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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        EXTRACT(MONTH FROM f.order_date) AS month_num,
        SUM(CASE WHEN LOWER(ch.channel_group) LIKE '%retail%' OR LOWER(ch.channel_group) LIKE '%store%' THEN f.net_amount ELSE 0 END) AS retail,
        SUM(CASE WHEN LOWER(ch.channel_group) LIKE '%online%' OR LOWER(ch.channel_group) LIKE '%digital%' THEN f.net_amount ELSE 0 END) AS online,
        SUM(CASE WHEN LOWER(ch.channel_group) LIKE '%b2b%' OR LOWER(ch.channel_group) LIKE '%distri%' THEN f.net_amount ELSE 0 END) AS b2b
      FROM retail_scope_rd.fact_orders f
      JOIN retail_scope_rd.dim_channel ch ON f.channel_id = ch.channel_id
      ${whereClause}
      GROUP BY month_num
      ORDER BY month_num;
    `;
    const result = await pool.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) { return NextResponse.json({ error: "DB Error" }, { status: 500 }); }
}