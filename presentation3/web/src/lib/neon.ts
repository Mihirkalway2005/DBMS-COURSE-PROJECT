import { neon } from "@neondatabase/serverless"

export type LicenseRecord = {
  id: number | string
  name: string
  vendor: string
  initials: string
  tone: string
  type: string
  seats: number
  used: number
  renewal: string
  cost: string
  status: "Healthy" | "Attention"
  created_at?: string
}

export const INITIAL_DEFAULT_LICENSES: LicenseRecord[] = [
  {
    id: 1,
    name: "Figma Organization",
    vendor: "Figma, Inc.",
    initials: "Fi",
    tone: "violet",
    type: "SaaS · Annual",
    seats: 80,
    used: 76,
    renewal: "Dec 18, 2025",
    cost: "$24,960",
    status: "Attention",
  },
  {
    id: 2,
    name: "GitHub Enterprise",
    vendor: "GitHub, Inc.",
    initials: "GH",
    tone: "slate",
    type: "SaaS · Annual",
    seats: 140,
    used: 112,
    renewal: "Feb 02, 2026",
    cost: "$29,400",
    status: "Healthy",
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    vendor: "Adobe Systems",
    initials: "Ai",
    tone: "coral",
    type: "SaaS · Annual",
    seats: 45,
    used: 31,
    renewal: "Mar 14, 2026",
    cost: "$32,340",
    status: "Healthy",
  },
  {
    id: 4,
    name: "JetBrains All Products",
    vendor: "JetBrains s.r.o.",
    initials: "JB",
    tone: "amber",
    type: "Subscription",
    seats: 60,
    used: 44,
    renewal: "Apr 27, 2026",
    cost: "$18,540",
    status: "Healthy",
  },
  {
    id: 5,
    name: "Microsoft 365 E5",
    vendor: "Microsoft Corp.",
    initials: "M",
    tone: "blue",
    type: "SaaS · Monthly",
    seats: 220,
    used: 193,
    renewal: "May 01, 2026",
    cost: "$92,400",
    status: "Healthy",
  },
  {
    id: 6,
    name: "Slack Enterprise Grid",
    vendor: "Salesforce / Slack",
    initials: "S",
    tone: "rose",
    type: "SaaS · Annual",
    seats: 260,
    used: 254,
    renewal: "Jan 15, 2026",
    cost: "$37,440",
    status: "Attention",
  },
  {
    id: 7,
    name: "Notion Enterprise",
    vendor: "Notion Labs, Inc.",
    initials: "N",
    tone: "slate",
    type: "SaaS · Annual",
    seats: 110,
    used: 104,
    renewal: "Nov 12, 2025",
    cost: "$13,200",
    status: "Attention",
  },
  {
    id: 8,
    name: "Datadog APM & Infra",
    vendor: "Datadog, Inc.",
    initials: "DD",
    tone: "violet",
    type: "Usage · Annual",
    seats: 75,
    used: 71,
    renewal: "Jun 30, 2026",
    cost: "$48,600",
    status: "Healthy",
  },
  {
    id: 9,
    name: "Linear Business",
    vendor: "Linear Orbit, Inc.",
    initials: "Li",
    tone: "slate",
    type: "SaaS · Annual",
    seats: 95,
    used: 91,
    renewal: "Aug 10, 2026",
    cost: "$11,400",
    status: "Healthy",
  },
  {
    id: 10,
    name: "1Password Business",
    vendor: "AgileBits, Inc.",
    initials: "1P",
    tone: "blue",
    type: "SaaS · Annual",
    seats: 290,
    used: 278,
    renewal: "Oct 04, 2026",
    cost: "$27,840",
    status: "Healthy",
  },
  {
    id: 11,
    name: "Jira Software Cloud",
    vendor: "Atlassian",
    initials: "Jr",
    tone: "blue",
    type: "SaaS · Annual",
    seats: 180,
    used: 172,
    renewal: "Jul 22, 2026",
    cost: "$21,600",
    status: "Healthy",
  },
  {
    id: 12,
    name: "Confluence Standard",
    vendor: "Atlassian",
    initials: "Cf",
    tone: "blue",
    type: "SaaS · Annual",
    seats: 180,
    used: 158,
    renewal: "Jul 22, 2026",
    cost: "$12,960",
    status: "Healthy",
  },
  {
    id: 13,
    name: "Zoom Workplace Pro",
    vendor: "Zoom Video Comm.",
    initials: "Zm",
    tone: "blue",
    type: "SaaS · Annual",
    seats: 200,
    used: 188,
    renewal: "Sep 15, 2026",
    cost: "$30,000",
    status: "Healthy",
  },
  {
    id: 14,
    name: "AWS Enterprise Support",
    vendor: "Amazon Web Services",
    initials: "AW",
    tone: "amber",
    type: "Cloud · Tier 1",
    seats: 1,
    used: 1,
    renewal: "Dec 31, 2026",
    cost: "$142,000",
    status: "Healthy",
  },
  {
    id: 15,
    name: "Snowflake Enterprise",
    vendor: "Snowflake, Inc.",
    initials: "Sf",
    tone: "blue",
    type: "Capacity · Annual",
    seats: 50,
    used: 49,
    renewal: "Dec 31, 2025",
    cost: "$65,000",
    status: "Attention",
  },
  {
    id: 16,
    name: "Vercel Enterprise",
    vendor: "Vercel, Inc.",
    initials: "Vc",
    tone: "slate",
    type: "SaaS · Annual",
    seats: 40,
    used: 38,
    renewal: "Jan 28, 2026",
    cost: "$24,000",
    status: "Healthy",
  },
  {
    id: 17,
    name: "Sentry Performance",
    vendor: "Functional Software",
    initials: "Sn",
    tone: "rose",
    type: "SaaS · Annual",
    seats: 65,
    used: 61,
    renewal: "Feb 19, 2026",
    cost: "$7,800",
    status: "Healthy",
  },
  {
    id: 18,
    name: "Postman Enterprise",
    vendor: "Postman, Inc.",
    initials: "Pm",
    tone: "coral",
    type: "SaaS · Annual",
    seats: 90,
    used: 88,
    renewal: "Mar 05, 2026",
    cost: "$32,400",
    status: "Attention",
  },
  {
    id: 19,
    name: "Docker Business",
    vendor: "Docker, Inc.",
    initials: "Dk",
    tone: "blue",
    type: "SaaS · Annual",
    seats: 110,
    used: 102,
    renewal: "Apr 18, 2026",
    cost: "$26,400",
    status: "Healthy",
  },
  {
    id: 20,
    name: "Miro Enterprise",
    vendor: "RealtimeBoard, Inc.",
    initials: "Mr",
    tone: "amber",
    type: "SaaS · Annual",
    seats: 130,
    used: 124,
    renewal: "May 25, 2026",
    cost: "$21,840",
    status: "Healthy",
  },
  {
    id: 21,
    name: "MongoDB Atlas Dedicated",
    vendor: "MongoDB, Inc.",
    initials: "Mg",
    tone: "mint",
    type: "Dedicated · Annual",
    seats: 12,
    used: 10,
    renewal: "Jun 14, 2026",
    cost: "$38,500",
    status: "Healthy",
  },
  {
    id: 22,
    name: "Okta Workforce Identity",
    vendor: "Okta, Inc.",
    initials: "Ok",
    tone: "blue",
    type: "SaaS · Annual",
    seats: 320,
    used: 315,
    renewal: "Jul 01, 2026",
    cost: "$57,600",
    status: "Attention",
  },
  {
    id: 23,
    name: "Salesforce Sales Cloud",
    vendor: "Salesforce, Inc.",
    initials: "SF",
    tone: "blue",
    type: "SaaS · Annual",
    seats: 60,
    used: 59,
    renewal: "Aug 19, 2026",
    cost: "$72,000",
    status: "Attention",
  },
  {
    id: 24,
    name: "Cursor Pro Business",
    vendor: "Anysphere, Inc.",
    initials: "Cr",
    tone: "violet",
    type: "SaaS · Annual",
    seats: 75,
    used: 75,
    renewal: "Oct 14, 2026",
    cost: "$36,000",
    status: "Attention",
  },
  {
    id: 25,
    name: "Raycast Pro Teams",
    vendor: "Raycast Technologies",
    initials: "Rc",
    tone: "rose",
    type: "SaaS · Annual",
    seats: 50,
    used: 48,
    renewal: "Nov 02, 2026",
    cost: "$6,000",
    status: "Healthy",
  },
]

// Retrieve Neon connection URL from Vite environment
export function getNeonDatabaseUrl(): string | undefined {
  const url =
    process.env.NEXT_PUBLIC_NEON_DATABASE_URL ||
    process.env.VITE_NEON_DATABASE_URL ||
    process.env.DATABASE_URL
  if (!url || url.includes("ep-sample-pooler") || url.trim() === "") {
    return undefined
  }
  return url.trim()
}

export function isNeonConfigured(): boolean {
  return Boolean(getNeonDatabaseUrl())
}

// Get Neon client instance if configured
export function getNeonClient() {
  const dbUrl = getNeonDatabaseUrl()
  if (!dbUrl) return null
  return neon(dbUrl)
}

export type DbConnectionStatus = {
  configured: boolean
  connected: boolean
  latencyMs?: number
  serverTime?: string
  error?: string
  tableCount?: number
}

// Test Neon Connection and verify schema
export async function testNeonConnection(): Promise<DbConnectionStatus> {
  const dbUrl = getNeonDatabaseUrl()
  if (!dbUrl) {
    return {
      configured: false,
      connected: false,
      error: "VITE_NEON_DATABASE_URL is not set in .env",
    }
  }

  const start = performance.now()
  try {
    const sql = neon(dbUrl)
    const result = (await sql`SELECT NOW() as server_time, 1 as status;`) as Array<{ server_time: string }>
    const latencyMs = Math.round(performance.now() - start)

    // Check if licenses table exists
    const tableCheck = (await sql`
      SELECT count(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'licenses';
    `) as Array<{ count: string | number }>
    const tableExists = Number(tableCheck[0]?.count || 0) > 0

    let tableCount = 0
    if (tableExists) {
      const countRes = (await sql`SELECT COUNT(*) as count FROM licenses;`) as Array<{ count: string | number }>
      tableCount = Number(countRes[0]?.count || 0)
    }

    return {
      configured: true,
      connected: true,
      latencyMs,
      serverTime: result[0]?.server_time,
      tableCount,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      configured: true,
      connected: false,
      error: message,
    }
  }
}

// Initialize tables and seed initial data if empty
export async function initNeonDatabaseSchema(): Promise<{ success: boolean; message: string; rowsSeeded?: number }> {
  const sql = getNeonClient()
  if (!sql) {
    throw new Error("Neon database is not configured. Please add VITE_NEON_DATABASE_URL in .env.")
  }

  // Create licenses table
  await sql`
    CREATE TABLE IF NOT EXISTS licenses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      vendor VARCHAR(255) NOT NULL,
      initials VARCHAR(10) NOT NULL,
      tone VARCHAR(50) DEFAULT 'violet',
      type VARCHAR(100) NOT NULL,
      seats INTEGER NOT NULL DEFAULT 1,
      used INTEGER NOT NULL DEFAULT 0,
      renewal VARCHAR(100) NOT NULL,
      cost VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'Healthy',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Check if table is empty, seed initial records
  const existing = (await sql`SELECT count(*) as count FROM licenses;`) as Array<{ count: string | number }>
  const count = Number(existing[0]?.count || 0)

  if (count === 0) {
    for (const lic of INITIAL_DEFAULT_LICENSES) {
      await sql`
        INSERT INTO licenses (name, vendor, initials, tone, type, seats, used, renewal, cost, status)
        VALUES (${lic.name}, ${lic.vendor}, ${lic.initials}, ${lic.tone}, ${lic.type}, ${lic.seats}, ${lic.used}, ${lic.renewal}, ${lic.cost}, ${lic.status});
      `
    }
    return {
      success: true,
      message: `Schema created & ${INITIAL_DEFAULT_LICENSES.length} default records seeded into Neon!`,
      rowsSeeded: INITIAL_DEFAULT_LICENSES.length,
    }
  }

  return {
    success: true,
    message: `Table already exists with ${count} license records.`,
    rowsSeeded: 0,
  }
}

// Fetch all licenses from Neon or fallback to local
export async function fetchLicenses(): Promise<{ licenses: LicenseRecord[]; isFromDb: boolean }> {
  const sql = getNeonClient()
  if (!sql) {
    return { licenses: INITIAL_DEFAULT_LICENSES, isFromDb: false }
  }

  try {
    const rows = (await sql`
      SELECT id, name, vendor, initials, tone, type, seats, used, renewal, cost, status, created_at
      FROM licenses
      ORDER BY id ASC;
    `) as LicenseRecord[]

    if (!rows || rows.length === 0) {
      // If table is newly created and empty, seed it
      await initNeonDatabaseSchema()
      const seeded = (await sql`
        SELECT id, name, vendor, initials, tone, type, seats, used, renewal, cost, status, created_at
        FROM licenses
        ORDER BY id ASC;
      `) as LicenseRecord[]
      return { licenses: seeded, isFromDb: true }
    }

    return { licenses: rows, isFromDb: true }
  } catch (err) {
    console.warn("Neon query failed, using fallback licenses:", err)
    return { licenses: INITIAL_DEFAULT_LICENSES, isFromDb: false }
  }
}

// Create a new license in Neon
export async function createLicense(license: Omit<LicenseRecord, "id">): Promise<LicenseRecord> {
  const sql = getNeonClient()
  if (!sql) {
    // Return simulated record for offline/demo mode
    return {
      ...license,
      id: Date.now(),
    }
  }

  const result = (await sql`
    INSERT INTO licenses (name, vendor, initials, tone, type, seats, used, renewal, cost, status)
    VALUES (
      ${license.name}, 
      ${license.vendor}, 
      ${license.initials}, 
      ${license.tone || "violet"}, 
      ${license.type}, 
      ${license.seats}, 
      ${license.used}, 
      ${license.renewal}, 
      ${license.cost}, 
      ${license.status}
    )
    RETURNING id, name, vendor, initials, tone, type, seats, used, renewal, cost, status, created_at;
  `) as LicenseRecord[]

  return result[0]
}

// Delete license from Neon
export async function deleteLicense(id: number | string): Promise<boolean> {
  const sql = getNeonClient()
  if (!sql) {
    return true
  }

  await sql`DELETE FROM licenses WHERE id = ${Number(id)};`
  return true
}

// Update license status
export async function updateLicenseStatus(id: number | string, status: "Healthy" | "Attention"): Promise<boolean> {
  const sql = getNeonClient()
  if (!sql) {
    return true
  }

  await sql`UPDATE licenses SET status = ${status} WHERE id = ${Number(id)};`
  return true
}
