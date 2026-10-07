import { NextResponse } from "next/server"
import { getAllocationsDirectory } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await getAllocationsDirectory()
  return NextResponse.json(result.data, { status: result.status })
}
