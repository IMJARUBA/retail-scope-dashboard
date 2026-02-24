import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const region = searchParams.get("region");
    const distributor = searchParams.get("distributor");

    let commonFilters: string[] = [];
    let values: any[] = [];
    let index = 1;

    if (region && region !== "ALL") {
      commonFilters.push(`c.region = $${index++}`);
      values.push(region);
    }
    if (distributor && distributor !== "ALL") {
      commonFilters.push(`d.distributor_name = $${index++}`);
      values.push(distributor);
    }

    const commonWhere = commonFilters.length > 0 ? `AND ${commonFilters.join(" AND ")}` : "";

    const isAllYears = !yearParam || yearParam === "ALL";
    let cyYearFilter = "1=1";
    let pyYearFilter = "1=0";

    if (!isAllYears) {
      const year = Number(yearParam);
      cyYearFilter = `EXTRACT(YEAR FROM f.order_date) = ${year}`;
      pyYearFilter = `EXTRACT(YEAR FROM f.order_date) = ${year - 1}`;
    }

    const query = `
      WITH cy_data AS (
        SELECT 
          f.distributor_id, f.net_amount, d.commission_pct,
          (f.net_amount * (d.commission_pct / 100)) AS commission_amount
        FROM retail_scope_rd.fact_orders f
        JOIN retail_scope_rd.dim_distributor d ON f.distributor_id = d.distributor_id
        JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
        JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
        WHERE ${cyYearFilter} ${commonWhere}
      ),
      cy_stats AS (
        SELECT 
          COUNT(DISTINCT distributor_id) AS active_distributors,
          COALESCE(SUM(net_amount), 0) AS b2b_sales,
          COALESCE(SUM(commission_amount), 0) AS total_commissions,
          COALESCE(AVG(commission_pct), 0) AS avg_commission_pct
        FROM cy_data
      ),
      py_data AS (
        SELECT 
          f.distributor_id, f.net_amount, d.commission_pct,
          (f.net_amount * (d.commission_pct / 100)) AS commission_amount
        FROM retail_scope_rd.fact_orders f
        JOIN retail_scope_rd.dim_distributor d ON f.distributor_id = d.distributor_id
        JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
        JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
        WHERE ${pyYearFilter} ${commonWhere}
      ),
      py_stats AS (
        SELECT 
          COUNT(DISTINCT distributor_id) AS active_distributors,
          COALESCE(SUM(net_amount), 0) AS b2b_sales,
          COALESCE(SUM(commission_amount), 0) AS total_commissions,
          COALESCE(AVG(commission_pct), 0) AS avg_commission_pct
        FROM py_data
      )
      SELECT 
        cy_stats.active_distributors AS cy_active, cy_stats.b2b_sales AS cy_sales,
        cy_stats.total_commissions AS cy_commissions, cy_stats.avg_commission_pct AS cy_avg_pct,
        py_stats.active_distributors AS py_active, py_stats.b2b_sales AS py_sales,
        py_stats.total_commissions AS py_commissions, py_stats.avg_commission_pct AS py_avg_pct
      FROM cy_stats, py_stats;
    `;

    const result = await pool.query(query, values);
    const row = result.rows[0] || {};
    const cyActive = Number(row.cy_active) || 0, pyActive = Number(row.py_active) || 0;
    const cySales = Number(row.cy_sales) || 0, pySales = Number(row.py_sales) || 0;
    const cyComms = Number(row.cy_commissions) || 0, pyComms = Number(row.py_commissions) || 0;
    const cyPct = Number(row.cy_avg_pct) || 0, pyPct = Number(row.py_avg_pct) || 0;

    const calcGrowth = (curr: number, prev: number) => (!prev ? 0 : ((curr - prev) / prev) * 100);

    return NextResponse.json({
      active_distributors: cyActive, b2b_sales: cySales, total_commissions: cyComms, avg_commission_pct: cyPct,
      yoy_distributors: calcGrowth(cyActive, pyActive), yoy_b2b_sales: calcGrowth(cySales, pySales),
      yoy_commissions: calcGrowth(cyComms, pyComms), yoy_commission_pct: cyPct - pyPct,
    });
  } catch (error) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}