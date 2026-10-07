import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function POST() {
  const result = await seedDatabase()
  return NextResponse.json(result.data, { status: result.status })
}
