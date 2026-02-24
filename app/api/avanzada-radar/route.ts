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
      conditions.push(`EXTRACT(YEAR FROM order_date) = $${idx++}`);
      values.push(Number(year));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      WITH base_metrics AS (
        SELECT 
          AVG(margin_pct) AS avg_margin,
          COUNT(DISTINCT customer_id) AS total_customers,
          COUNT(DISTINCT product_id) AS total_products,
          SUM(net_amount) / NULLIF(COUNT(order_id), 0) AS avg_ticket
        FROM retail_scope_rd.fact_orders
        ${whereClause}
      ),
      retention AS (
        SELECT COUNT(*) AS recurrent_customers FROM (
          SELECT customer_id FROM retail_scope_rd.fact_orders ${whereClause} GROUP BY customer_id HAVING COUNT(order_id) > 1
        ) sub
      )
      SELECT 
        (SELECT avg_margin FROM base_metrics) AS margin_score,
        (SELECT (recurrent_customers::float / NULLIF(total_customers, 0)) * 100 FROM retention, base_metrics) AS retention_score,
        (SELECT LEAST((total_products::float / 150) * 100, 100) FROM base_metrics) AS mix_score,
        (SELECT LEAST((avg_ticket / 5000) * 100, 100) FROM base_metrics) AS ticket_score,
        85 AS satisfaction_score -- Simulado, ya que no hay tabla de encuestas
    `;
    
    const result = await pool.query(query, values);
    const row = result.rows[0];

    // Mapeamos los resultados a la estructura del Radar
    const radarData = [
      { subject: "Margen Saludable", A: Number(row.margin_score) || 0, fullMark: 100 },
      { subject: "Retención Clientes", A: Number(row.retention_score) || 0, fullMark: 100 },
      { subject: "Mix Portafolio", A: Number(row.mix_score) || 0, fullMark: 100 },
      { subject: "Efectividad Ticket", A: Number(row.ticket_score) || 0, fullMark: 100 },
      { subject: "Satisfacción B2B", A: Number(row.satisfaction_score) || 0, fullMark: 100 },
    ];

    return NextResponse.json(radarData);
  } catch (error) { return NextResponse.json({ error: "DB Error" }, { status: 500 }); }
}