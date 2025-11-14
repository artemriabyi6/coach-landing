// app/api/check-tables/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  let client;
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    client = await pool.connect()

    // Перевірка всіх таблиць та їх структури
    const allTables = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    // Перевірка структури таблиці payments
    const paymentsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position
    `)

    // Перевірка чи є дані в payments
    const paymentsData = await client.query('SELECT * FROM payments LIMIT 3')

    return NextResponse.json({
      success: true,
      allTables: allTables.rows,
      paymentsColumns: paymentsColumns.rows,
      paymentsData: paymentsData.rows,
      hasPaymentsTable: paymentsColumns.rows.length > 0
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}