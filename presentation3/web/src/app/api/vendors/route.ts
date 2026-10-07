import { NextResponse } from "next/server"
import { getVendors } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await getVendors()
  return NextResponse.json(result.data, { status: result.status })
}
