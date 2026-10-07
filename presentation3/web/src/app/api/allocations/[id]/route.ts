import { NextRequest, NextResponse } from "next/server"
import { revokeAllocation } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const numId = Number(id)
    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid allocation ID" }, { status: 400 })
    }
    const result = await revokeAllocation(numId)
    return NextResponse.json(result.data, { status: result.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
