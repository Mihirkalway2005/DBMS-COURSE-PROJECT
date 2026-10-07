import { NextResponse } from "next/server"
import { getDbStatus } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await getDbStatus()
  return NextResponse.json(result.data, { status: result.status })
}
