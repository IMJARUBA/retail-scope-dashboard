import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const yearParam = searchParams.get("year");
    const region = searchParams.get("region");
    const distributor = searchParams.get("distributor");

    // 1. Filtros Comunes
    let commonFilters: string[] = [];
    let values: any[] = [];
    let index = 1;

    if (region && region !== "ALL") {
      commonFilters.push(`LOWER(c.region) = LOWER($${index++})`);
      values.push(region);
    }

    if (distributor && distributor !== "ALL") {
      commonFilters.push(`d.distributor_name = $${index++}`);
      values.push(distributor);
    }

    const commonWhere = commonFilters.length > 0 ? `AND ${commonFilters.join(" AND ")}` : "";

    // 2. Filtros de Tiempo (Año Actual, Año Anterior, y PY-1 para Retención)
    const isAllYears = !yearParam || yearParam === "ALL";
    
    let cyYearFilter = "1=1";
    let pyYearFilter = "1=0";
    let ppyYearFilter = "1=0";
    let cyNewFilter = "1=1";
    let pyNewFilter = "1=0";

    if (!isAllYears) {
      const year = Number(yearParam);
      cyYearFilter = `EXTRACT(YEAR FROM order_date) = ${year}`;
      pyYearFilter = `EXTRACT(YEAR FROM order_date) = ${year - 1}`;
      ppyYearFilter = `EXTRACT(YEAR FROM order_date) = ${year - 2}`; // Necesario para la retención del año pasado
      
      cyNewFilter = `EXTRACT(YEAR FROM first_order) = ${year}`;
      pyNewFilter = `EXTRACT(YEAR FROM first_order) = ${year - 1}`;
    }

    // 3. Consulta SQL Unificada
    const query = `
      WITH filtered_orders AS (
        SELECT 
          f.customer_id, 
          f.order_date, 
          f.net_amount
        FROM retail_scope_rd.fact_orders f
        JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
        JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
        JOIN retail_scope_rd.dim_distributor d ON f.distributor_id = d.distributor_id
        WHERE 1=1 ${commonWhere}
      ),
      first_purchase AS (
        SELECT customer_id, MIN(order_date) AS first_order
        FROM filtered_orders
        GROUP BY customer_id
      ),

      -- 🔹 AÑO ACTUAL (CY)
      cy_orders AS (
        SELECT * FROM filtered_orders WHERE ${cyYearFilter}
      ),
      cy_stats AS (
        SELECT 
          COUNT(DISTINCT customer_id) AS active_customers,
          COALESCE(SUM(net_amount), 0) AS total_sales
        FROM cy_orders
      ),
      cy_new AS (
        SELECT COUNT(*) AS new_customers
        FROM first_purchase
        WHERE ${cyNewFilter}
      ),

      -- 🔹 AÑO ANTERIOR (PY)
      py_orders AS (
        SELECT * FROM filtered_orders WHERE ${pyYearFilter}
      ),
      py_stats AS (
        SELECT 
          COUNT(DISTINCT customer_id) AS active_customers,
          COALESCE(SUM(net_amount), 0) AS total_sales
        FROM py_orders
      ),
      py_new AS (
        SELECT COUNT(*) AS new_customers
        FROM first_purchase
        WHERE ${pyNewFilter}
      ),

      -- 🔹 RETENCIÓN CY (Compraron en CY y también en PY)
      cy_retention AS (
        SELECT COUNT(DISTINCT cc.customer_id) AS retained
        FROM cy_orders cc
        INNER JOIN py_orders cp ON cc.customer_id = cp.customer_id
      ),

      -- 🔹 RETENCIÓN PY (Compraron en PY y también en PY-1)
      ppy_orders AS (
        SELECT * FROM filtered_orders WHERE ${ppyYearFilter}
      ),
      py_retention AS (
        SELECT COUNT(DISTINCT cp.customer_id) AS retained
        FROM py_orders cp
        INNER JOIN ppy_orders cpp ON cp.customer_id = cpp.customer_id
      )

      -- 🔹 UNIÓN DE RESULTADOS
      SELECT 
        -- CY Metrics
        cy_stats.active_customers AS cy_active,
        cy_new.new_customers AS cy_new,
        (cy_stats.total_sales / NULLIF(cy_stats.active_customers, 0)) AS cy_ticket,
        ((SELECT retained FROM cy_retention)::float / NULLIF((SELECT COUNT(DISTINCT customer_id) FROM py_orders), 0)) * 100 AS cy_retention_rate,

        -- PY Metrics
        py_stats.active_customers AS py_active,
        py_new.new_customers AS py_new,
        (py_stats.total_sales / NULLIF(py_stats.active_customers, 0)) AS py_ticket,
        ((SELECT retained FROM py_retention)::float / NULLIF((SELECT COUNT(DISTINCT customer_id) FROM ppy_orders), 0)) * 100 AS py_retention_rate

      FROM cy_stats, py_stats, cy_new, py_new;
    `;

    const result = await pool.query(query, values);
    const row = result.rows[0] || {};

    // 4. Extracción de Variables Segura
    const cyActive = Number(row.cy_active) || 0;
    const pyActive = Number(row.py_active) || 0;

    const cyNew = Number(row.cy_new) || 0;
    const pyNew = Number(row.py_new) || 0;

    const cyTicket = Number(row.cy_ticket) || 0;
    const pyTicket = Number(row.py_ticket) || 0;

    const cyRetention = Number(row.cy_retention_rate) || 0;
    const pyRetention = Number(row.py_retention_rate) || 0;

    // 5. Cálculo de Crecimiento
    const calcGrowth = (current: number, previous: number) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    return NextResponse.json({
      // Valores actuales (se envían al frontend)
      active_customers: cyActive,
      new_customers: cyNew,
      retention_rate: cyRetention,
      avg_ticket_per_customer: cyTicket,

      // Tendencias (YoY)
      yoy_active: calcGrowth(cyActive, pyActive),
      yoy_new: calcGrowth(cyNew, pyNew),
      yoy_retention: cyRetention - pyRetention, // Diferencia absoluta por ser %
      yoy_ticket: calcGrowth(cyTicket, pyTicket),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}