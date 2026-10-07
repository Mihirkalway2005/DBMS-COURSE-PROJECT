import { NextResponse } from "next/server"
import { getGovernanceOverview } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await getGovernanceOverview()
  return NextResponse.json(result.data, { status: result.status })
}
