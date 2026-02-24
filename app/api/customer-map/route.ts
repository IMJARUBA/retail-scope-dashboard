import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const year = Number(searchParams.get("year") || "2024");
    const region = searchParams.get("region");
    const distributor = searchParams.get("distributor");

    let filters: string[] = [];
    let values: any[] = [];
    let index = 1;

    if (region && region !== "ALL") {
      filters.push(`LOWER(c.region) = LOWER($${index})`);
      values.push(region);
      index++;
    }

    if (distributor && distributor !== "ALL") {
      filters.push(`d.distributor_name = $${index}`);
      values.push(distributor);
      index++;
    }

    const filterSQL = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const query = `
      SELECT 
        c.city_name,
        c.latitude,
        c.longitude,
        COUNT(DISTINCT f.customer_id) AS total_customers
      FROM retail_scope_rd.fact_orders f
      JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
      JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
      JOIN retail_scope_rd.dim_distributor d ON f.distributor_id = d.distributor_id
      WHERE EXTRACT(YEAR FROM f.order_date) = ${year}
      ${filterSQL}
      GROUP BY c.city_name, c.latitude, c.longitude;
    `;

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}