import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");

    let yearFilter = "";
    if (year && year !== "ALL") {
      yearFilter = `WHERE d.year = ${Number(year)}`;
    }

    const result = await pool.query(`
      WITH base AS (
        SELECT 
          p.product_name,
          SUM(f.net_amount) AS total_sales
        FROM retail_scope_rd.fact_orders f
        JOIN retail_scope_rd.dim_date d ON f.order_date = d.date_id
        JOIN retail_scope_rd.dim_product p ON f.product_id = p.product_id
        ${yearFilter}
        GROUP BY p.product_name
      ),
      ranked AS (
        SELECT *,
          SUM(total_sales) OVER () AS total_all,
          SUM(total_sales) OVER (
            ORDER BY total_sales DESC
          ) AS cumulative_sales
        FROM base
      )
      SELECT 
        product_name,
        total_sales,
        cumulative_sales / total_all * 100 AS cumulative_pct
      FROM ranked
      ORDER BY total_sales DESC;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}