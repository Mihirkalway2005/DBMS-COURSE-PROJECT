import { NextRequest, NextResponse } from "next/server"
import { updateLicense, deleteLicense } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const numId = Number(id)
    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid license ID" }, { status: 400 })
    }
    const body = await req.json()
    const result = await updateLicense(numId, body)
    return NextResponse.json(result.data, { status: result.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const numId = Number(id)
    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid license ID" }, { status: 400 })
    }
    const result = await deleteLicense(numId)
    return NextResponse.json(result.data, { status: result.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
