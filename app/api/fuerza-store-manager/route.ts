import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let conditions: string[] = ["s.store_manager IS NOT NULL", "s.store_manager != ''"];
    let values: any[] = [];
    let idx = 1;

    const year = searchParams.get("year");
    if (year && year !== "ALL") {
      conditions.push(`EXTRACT(YEAR FROM f.order_date) = $${idx++}`);
      values.push(Number(year));
    }
    const region = searchParams.get("region");
    if (region && region !== "ALL") {
      conditions.push(`c.region = $${idx++}`);
      values.push(region);
    }
    const distributor = searchParams.get("distributor");
    if (distributor && distributor !== "ALL") {
      conditions.push(`d.distributor_name = $${idx++}`);
      values.push(distributor);
    }

    const query = `
      SELECT 
        s.store_manager AS manager,
        SUM(f.net_amount) AS sales
      FROM retail_scope_rd.fact_orders f
      JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
      JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
      LEFT JOIN retail_scope_rd.dim_distributor d ON f.distributor_id = d.distributor_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY s.store_manager
      ORDER BY sales DESC LIMIT 10;
    `;
    const result = await pool.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) { return NextResponse.json({ error: "DB Error" }, { status: 500 }); }
}