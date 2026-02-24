import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const year = searchParams.get("year");
    const region = searchParams.get("region");
    const distributor = searchParams.get("distributor");

    let whereClauses: string[] = [];
    let values: any[] = [];
    let index = 1;

    // Filtro por año
    if (year && year !== "ALL") {
      whereClauses.push(`EXTRACT(YEAR FROM f.order_date) = $${index}`);
      values.push(year);
      index++;
    }

    // Filtro por región
    if (region && region !== "ALL") {
      whereClauses.push(`c.region = $${index}`);
      values.push(region);
      index++;
    }

    // Filtro por distribuidor
    if (distributor && distributor !== "ALL") {
      whereClauses.push(`d.distributor_name = $${index}`);
      values.push(distributor);
      index++;
    }

    const whereSQL =
      whereClauses.length > 0
        ? `WHERE ${whereClauses.join(" AND ")}`
        : "";

    const query = `
      SELECT 
        c.city_name,
        c.latitude,
        c.longitude,
        SUM(f.net_amount) AS total_sales
      FROM retail_scope_rd.fact_orders f
      JOIN retail_scope_rd.dim_store s
        ON f.store_id = s.store_id
      JOIN retail_scope_rd.dim_city c
        ON s.city_id = c.city_id
      LEFT JOIN retail_scope_rd.dim_distributor d
        ON f.distributor_id = d.distributor_id
      ${whereSQL}
      GROUP BY c.city_name, c.latitude, c.longitude
      ORDER BY total_sales DESC
    `;

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}