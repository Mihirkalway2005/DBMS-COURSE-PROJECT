import { NextRequest, NextResponse } from "next/server"
import { runAudit } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const result = await runAudit(body)
    return NextResponse.json(result.data, { status: result.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
