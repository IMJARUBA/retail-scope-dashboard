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

    const previousYear = year - 1;

    let filters: string[] = [];
    let values: any[] = [];
    let index = 1;

    if (region && region !== "ALL") {
      filters.push(`LOWER(c.region) = LOWER($${index})`);
      values.push(region);
      index++;
    }

    if (distributor && distributor !== "ALL") {
      filters.push(`LOWER(d.distributor_name) = LOWER($${index})`);
      values.push(distributor);
      index++;
    }

    const filterSQL =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    const query = `
      WITH current_year AS (
        SELECT 
          COALESCE(SUM(f.net_amount), 0) AS total_sales,
          COALESCE(AVG(f.margin_pct), 0) AS avg_margin,
          COALESCE(COUNT(f.order_id), 0) AS invoices,
          COALESCE(
            SUM(CASE 
              WHEN LOWER(ch.channel_group) = 'online' 
              THEN f.net_amount 
              ELSE 0 
            END), 0
          ) AS digital_sales
        FROM retail_scope_rd.fact_orders f
        JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
        JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
        JOIN retail_scope_rd.dim_channel ch ON f.channel_id = ch.channel_id
        LEFT JOIN retail_scope_rd.dim_distributor d 
          ON f.distributor_id = d.distributor_id
        WHERE EXTRACT(YEAR FROM f.order_date) = ${year}
        ${filterSQL}
      ),
      previous_year AS (
        SELECT 
          COALESCE(SUM(f.net_amount), 0) AS total_sales
        FROM retail_scope_rd.fact_orders f
        JOIN retail_scope_rd.dim_store s ON f.store_id = s.store_id
        JOIN retail_scope_rd.dim_city c ON s.city_id = c.city_id
        JOIN retail_scope_rd.dim_channel ch ON f.channel_id = ch.channel_id
        LEFT JOIN retail_scope_rd.dim_distributor d 
          ON f.distributor_id = d.distributor_id
        WHERE EXTRACT(YEAR FROM f.order_date) = ${previousYear}
        ${filterSQL}
      )
      SELECT 
        cy.total_sales,
        cy.avg_margin,
        cy.invoices,
        cy.digital_sales,
        py.total_sales AS previous_sales
      FROM current_year cy, previous_year py
    `;

    const result = await pool.query(query, values);
    const row = result.rows[0];

    const ticketCurrent =
      row.invoices > 0 ? row.total_sales / row.invoices : 0;

    const calcGrowth = (current: number, previous: number) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const digitalShare =
      row.total_sales > 0
        ? (row.digital_sales / row.total_sales) * 100
        : 0;

    return NextResponse.json({
      total_sales: row.total_sales,
      avg_margin: row.avg_margin,
      invoices: row.invoices,
      avg_ticket: ticketCurrent,

      yoy_sales: calcGrowth(row.total_sales, row.previous_sales),

      digital_share: digitalShare,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}