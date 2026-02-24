import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let conditions: string[] = [];
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        d.distributor_type AS type,
        SUM(f.net_amount) AS value
      FROM retail_scope_rd.fact_orders f
      JOIN retail_scope_rd.dim_distributor d ON f.distributor_id = d.distributor_id
      JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
      JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
      ${whereClause}
      GROUP BY d.distributor_type ORDER BY value DESC;
    `;
    const result = await pool.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) { return NextResponse.json({ error: "DB Error" }, { status: 500 }); }
}