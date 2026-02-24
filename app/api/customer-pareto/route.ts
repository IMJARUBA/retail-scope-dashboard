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

    // Región
    if (region && region !== "ALL") {
      filters.push(`LOWER(c.region) = LOWER($${index})`);
      values.push(region);
      index++;
    }

    // Distribuidor
    if (distributor && distributor !== "ALL") {
      filters.push(`d.distributor_name = $${index}`);
      values.push(distributor);
      index++;
    }

    const filterSQL = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const query = `
      SELECT 
        f.customer_id,
        SUM(f.net_amount) AS total_sales
      FROM retail_scope_rd.fact_orders f
      JOIN retail_scope_rd.dim_store s 
        ON f.store_id = s.store_id
      JOIN retail_scope_rd.dim_city c 
        ON s.city_id = c.city_id
      JOIN retail_scope_rd.dim_distributor d
        ON f.distributor_id = d.distributor_id
      WHERE EXTRACT(YEAR FROM f.order_date) = ${year}
      ${filterSQL}
      GROUP BY f.customer_id
      ORDER BY total_sales DESC;
    `;

    const result = await pool.query(query, values);

    // Cálculo acumulado en backend
    let cumulative = 0;

    const total = result.rows.reduce(
      (sum: number, r: any) => sum + Number(r.total_sales),
      0
    );

    const formatted = result.rows.map((r: any) => {
      cumulative += Number(r.total_sales);

      return {
        customer_id: r.customer_id,
        sales: Number(r.total_sales),
        cumulative_pct:
          total > 0 ? (cumulative / total) * 100 : 0,
      };
    });

    // Devolvemos solo primeros 50 para visualización limpia
    return NextResponse.json(formatted.slice(0, 50));

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}