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
    const channel = searchParams.get("channel");
    const category = searchParams.get("category");

    let conditions: string[] = [];

    if (year && year !== "ALL") {
      conditions.push(`EXTRACT(YEAR FROM f.order_date) = ${year}`);
    }

    if (region && region !== "ALL") {
      conditions.push(`c.region = '${region}'`);
    }

    if (distributor && distributor !== "ALL") {
      conditions.push(`dist.distributor_name = '${distributor}'`);
    }

    if (channel && channel !== "ALL") {
      conditions.push(`ch.channel_group = '${channel}'`);
    }

    if (category && category !== "ALL") {
      conditions.push(`cat.category_name = '${category}'`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(`
      SELECT
        f.product_id,
        p.product_name,
        cat.category_name,
        SUM(f.net_amount) AS total_sales,
        SUM(f.margin_amount) AS gross_profit,
        SUM(f.units_sold) AS total_units,
        (SUM(f.margin_amount) / NULLIF(SUM(f.net_amount),0)) * 100 AS avg_margin_pct
      FROM retail_scope_rd.fact_orders f
      JOIN retail_scope_rd.dim_store s 
        ON f.store_id = s.store_id
      JOIN retail_scope_rd.dim_city c 
        ON s.city_id = c.city_id
      JOIN retail_scope_rd.dim_distributor dist 
        ON f.distributor_id = dist.distributor_id
      JOIN retail_scope_rd.dim_product p 
        ON f.product_id = p.product_id
      JOIN retail_scope_rd.dim_category cat 
        ON p.category_id = cat.category_id
      JOIN retail_scope_rd.dim_channel ch 
        ON f.channel_id = ch.channel_id
      ${whereClause}
      GROUP BY f.product_id, p.product_name, cat.category_name
      HAVING SUM(f.net_amount) > 0
      ORDER BY total_sales DESC;
    `);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}