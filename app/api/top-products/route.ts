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

    let conditions: string[] = [];

    if (year && year !== "ALL")
      conditions.push(`d.year = ${Number(year)}`);

    if (region && region !== "ALL")
      conditions.push(`c.region = '${region}'`);

    if (distributor && distributor !== "ALL")
      conditions.push(`dist.distributor_name = '${distributor}'`);

    if (category && category !== "ALL")
      conditions.push(`cat.category_name = '${category}'`);

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(`
      SELECT 
        p.product_name,
        cat.category_name,
        SUM(f.units_sold) AS total_units,
        SUM(f.net_amount) AS total_sales
      FROM retail_scope_rd.fact_orders f
      JOIN retail_scope_rd.dim_date d ON f.order_date = d.date_id
      JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
      JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
      JOIN retail_scope_rd.dim_product p ON f.product_id = p.product_id
      JOIN retail_scope_rd.dim_category cat ON p.category_id = cat.category_id
      LEFT JOIN retail_scope_rd.dim_distributor dist 
        ON f.distributor_id = dist.distributor_id
      ${whereClause}
      GROUP BY p.product_name, cat.category_name
      ORDER BY total_units DESC
      LIMIT 20;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}