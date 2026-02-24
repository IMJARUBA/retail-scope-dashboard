import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const year = searchParams.get("year");
    const region = searchParams.get("region");
    const distributor = searchParams.get("distributor");
    const category = searchParams.get("category");
    const channel = searchParams.get("channel");

    // 1. Filtros Comunes (Aplican tanto al año actual como al anterior)
    let commonFilters: string[] = [];
    let values: any[] = [];
    let index = 1;

    if (region && region !== "ALL") {
      commonFilters.push(`c.region = $${index++}`);
      values.push(region);
    }

    if (distributor && distributor !== "ALL") {
      commonFilters.push(`dist.distributor_name = $${index++}`);
      values.push(distributor);
    }

    if (category && category !== "ALL") {
      commonFilters.push(`cat.category_name = $${index++}`);
      values.push(category);
    }

    if (channel && channel !== "ALL") {
      commonFilters.push(`ch.channel_group = $${index++}`);
      values.push(channel);
    }

    const commonWhere = commonFilters.length > 0 ? `AND ${commonFilters.join(" AND ")}` : "";

    // 2. Filtros de Año (Para separar el actual del anterior)
    let cyYearFilter = "";
    let pyYearFilter = "";

    if (year && year !== "ALL") {
      const targetYear = Number(year);
      cyYearFilter = `AND EXTRACT(YEAR FROM f.order_date) = ${targetYear}`;
      pyYearFilter = `AND EXTRACT(YEAR FROM f.order_date) = ${targetYear - 1}`;
    } else {
      // Si el filtro es "ALL", el año previo se anula para devolver 0 en la comparación
      pyYearFilter = `AND 1 = 0`;
    }

    // 3. Consulta SQL con CTEs para Año Actual (CY) y Año Anterior (PY)
    const query = `
      WITH 
      -- 🔹 AÑO ACTUAL (CY)
      base_cy AS (
        SELECT 
          f.product_id,
          SUM(f.net_amount) AS sales,
          SUM(f.margin_amount) AS profit
        FROM retail_scope_rd.fact_orders f
        JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
        JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
        JOIN retail_scope_rd.dim_distributor dist ON f.distributor_id = dist.distributor_id
        JOIN retail_scope_rd.dim_product p ON f.product_id = p.product_id
        JOIN retail_scope_rd.dim_category cat ON p.category_id = cat.category_id
        JOIN retail_scope_rd.dim_channel ch ON f.channel_id = ch.channel_id
        WHERE 1=1 ${cyYearFilter} ${commonWhere}
        GROUP BY f.product_id
      ),
      totals_cy AS (
        SELECT 
          COALESCE(SUM(sales), 0) AS total_sales,
          COALESCE(SUM(profit), 0) AS gross_profit,
          COUNT(*) AS active_skus
        FROM base_cy
      ),
      top20_cy AS (
        SELECT COALESCE(SUM(sales), 0) AS top_sales
        FROM (
          SELECT sales, RANK() OVER (ORDER BY sales DESC) AS rank
          FROM base_cy
        ) ranked
        WHERE rank <= (SELECT GREATEST(1, CEIL(COUNT(*) * 0.2)) FROM base_cy)
      ),

      -- 🔹 AÑO ANTERIOR (PY)
      base_py AS (
        SELECT 
          f.product_id,
          SUM(f.net_amount) AS sales,
          SUM(f.margin_amount) AS profit
        FROM retail_scope_rd.fact_orders f
        JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
        JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
        JOIN retail_scope_rd.dim_distributor dist ON f.distributor_id = dist.distributor_id
        JOIN retail_scope_rd.dim_product p ON f.product_id = p.product_id
        JOIN retail_scope_rd.dim_category cat ON p.category_id = cat.category_id
        JOIN retail_scope_rd.dim_channel ch ON f.channel_id = ch.channel_id
        WHERE 1=1 ${pyYearFilter} ${commonWhere}
        GROUP BY f.product_id
      ),
      totals_py AS (
        SELECT 
          COALESCE(SUM(sales), 0) AS total_sales,
          COALESCE(SUM(profit), 0) AS gross_profit,
          COUNT(*) AS active_skus
        FROM base_py
      ),
      top20_py AS (
        SELECT COALESCE(SUM(sales), 0) AS top_sales
        FROM (
          SELECT sales, RANK() OVER (ORDER BY sales DESC) AS rank
          FROM base_py
        ) ranked
        WHERE rank <= (SELECT GREATEST(1, CEIL(COUNT(*) * 0.2)) FROM base_py)
      )

      -- 🔹 UNIÓN DE RESULTADOS
      SELECT 
        tcy.total_sales AS cy_sales,
        tcy.gross_profit AS cy_profit,
        (tcy.gross_profit / NULLIF(tcy.total_sales, 0)) * 100 AS cy_margin,
        tcy.active_skus AS cy_skus,
        (topcy.top_sales / NULLIF(tcy.total_sales, 0)) * 100 AS cy_top20,

        tpy.total_sales AS py_sales,
        tpy.gross_profit AS py_profit,
        (tpy.gross_profit / NULLIF(tpy.total_sales, 0)) * 100 AS py_margin,
        tpy.active_skus AS py_skus,
        (toppy.top_sales / NULLIF(tpy.total_sales, 0)) * 100 AS py_top20
      FROM totals_cy tcy
      CROSS JOIN top20_cy topcy
      CROSS JOIN totals_py tpy
      CROSS JOIN top20_py toppy;
    `;

    const result = await pool.query(query, values);
    const row = result.rows[0] || {};

    // 4. Extracción Segura de Variables
    const cySales = Number(row.cy_sales) || 0;
    const cyProfit = Number(row.cy_profit) || 0;
    const cyMargin = Number(row.cy_margin) || 0;
    const cySkus = Number(row.cy_skus) || 0;
    const cyTop20 = Number(row.cy_top20) || 0;

    const pySales = Number(row.py_sales) || 0;
    const pyProfit = Number(row.py_profit) || 0;
    const pyMargin = Number(row.py_margin) || 0;
    const pySkus = Number(row.py_skus) || 0;
    const pyTop20 = Number(row.py_top20) || 0;

    // 5. Cálculo de Crecimiento
    const calcGrowth = (current: number, previous: number) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    return NextResponse.json({
      // Valores Actuales
      total_sales: cySales,
      gross_profit: cyProfit,
      avg_margin: cyMargin,
      active_skus: cySkus,
      top20_contribution: cyTop20,

      // Tendencias (YoY)
      yoy_sales: calcGrowth(cySales, pySales),
      yoy_profit: calcGrowth(cyProfit, pyProfit),
      yoy_margin: cyMargin - pyMargin, // Para %, la diferencia absoluta es la mejor práctica (ej. 20% vs 18% = +2%)
      yoy_skus: calcGrowth(cySkus, pySkus),
      yoy_top20: cyTop20 - pyTop20, 
    });

  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({ error: "Database Error" }, { status: 500 });
  }
}