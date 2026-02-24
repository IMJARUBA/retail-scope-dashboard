import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let conditions: string[] = [];
    let values: any[] = [];
    let idx = 1;

    // (Aquí omitimos los filtros de año por brevedad, pero la lógica es la misma de las otras APIs)
    const year = searchParams.get("year");
    if (year && year !== "ALL") {
      conditions.push(`EXTRACT(YEAR FROM f.order_date) = $${idx++}`);
      values.push(Number(year));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      WITH customer_orders AS (
        SELECT 
          f.customer_id,
          COUNT(f.order_id) AS total_orders
        FROM retail_scope_rd.fact_orders f
        ${whereClause}
        GROUP BY f.customer_id
      )
      SELECT 
        COUNT(*) AS "Base Total (Compradores)",
        COUNT(CASE WHEN total_orders >= 2 THEN 1 END) AS "Recurrentes (2+ compras)",
        COUNT(CASE WHEN total_orders >= 4 THEN 1 END) AS "Frecuentes (4+ compras)",
        COUNT(CASE WHEN total_orders >= 7 THEN 1 END) AS "VIP (7+ compras)"
      FROM customer_orders;
    `;
    const result = await pool.query(query, values);
    
    // Transformamos la fila a un formato que el FunnelChart entienda [{name: "", value: X}]
    const row = result.rows[0];
    const funnelData = [
      { name: "Base Total (Compradores)", value: Number(row["Base Total (Compradores)"]) || 0 },
      { name: "Recurrentes (2+ compras)", value: Number(row["Recurrentes (2+ compras)"]) || 0 },
      { name: "Frecuentes (4+ compras)", value: Number(row["Frecuentes (4+ compras)"]) || 0 },
      { name: "VIP (7+ compras)", value: Number(row["VIP (7+ compras)"]) || 0 },
    ];

    return NextResponse.json(funnelData);
  } catch (error) { return NextResponse.json({ error: "DB Error" }, { status: 500 }); }
}