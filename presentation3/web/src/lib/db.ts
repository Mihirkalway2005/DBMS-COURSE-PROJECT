export type LicenseRecord = {
  id: number
  name: string
  softwareCode?: string
  category?: "PRODUCTIVITY" | "DEV_TOOLS" | "SECURITY" | "CLOUD_INFRA" | "DESIGN"
  vendor: string
  vendorCode?: string
  vendorTier?: "STRATEGIC" | "PREFERRED" | "STANDARD"
  initials: string
  tone: string
  type: string
  rawType?: "PERPETUAL" | "SAAS_SUBSCRIPTION" | "SEAT_BASED" | "OEM" | "TRIAL"
  billingCycle?: "MONTHLY" | "ANNUALLY" | "ONE_TIME"
  seats: number
  used: number
  unitCost?: number
  totalCostNum?: number
  renewal: string
  expiryDate?: string
  purchaseDate?: string
  autoRenew?: boolean
  cost: string
  status: "Healthy" | "Attention" | "Expired"
  dbStatus?: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "PENDING_RENEWAL"
  licenseKey?: string
  allocationsCount?: number
  allocations?: any[]
  renewalLogs?: any[]
}

export type DbStatus = {
  configured: boolean
  connected: boolean
  engine?: string
  dbVersion?: string
  latencyMs?: number
  serverTime?: string
  tableCount?: number
  counts?: {
    licenses: number
    vendors: number
    employees: number
    allocations: number
  }
  error?: string
}

export type GovernanceOverview = {
  kpi: {
    totalAnnualSpend: number
    activeSubscriptions: number
    seatSaturationPct: number
    complianceViolations: number
    totalSeatsPurchased: number
    totalSeatsAllocated: number
    ghostLicensesCount: number
    saturatedLicensesCount: number
    renewingIn30DaysCount: number
    renewingIn60DaysCount: number
  }
  radar: Array<{
    id: number
    software: string
    vendor: string
    licenseKey: string
    expiryDate: string
    daysLeft: number
    cost: number
    urgency: "CRITICAL" | "UPCOMING"
  }>
  vendorSpend: Array<{
    vendor: string
    spend: number
    seats: number
    used: number
  }>
  deptAllocations: Array<{
    department: string
    allocated: number
    spendEst: number
  }>
  recentAudits: Array<{
    id: number
    auditDate: string
    auditorName: string
    complianceStatus: "COMPLIANT" | "AT_RISK" | "NON_COMPLIANT"
    findings: string
    actionTaken: string
  }>
}

export const INITIAL_DEFAULT_LICENSES: LicenseRecord[] = [
  {
    id: 1,
    name: "Figma Enterprise Organization",
    softwareCode: "SW-FIG-ORG",
    category: "DESIGN",
    vendor: "Figma, Inc.",
    vendorCode: "VND-FIGMA",
    vendorTier: "STRATEGIC",
    initials: "Fi",
    tone: "violet",
    type: "SaaS · Annual",
    rawType: "SAAS_SUBSCRIPTION",
    billingCycle: "ANNUALLY",
    seats: 80,
    used: 76,
    renewal: "Dec 18, 2025",
    cost: "$24,960",
    status: "Attention",
    dbStatus: "ACTIVE",
    licenseKey: "FIG-ENT-8842-9901-XL7",
  },
  {
    id: 2,
    name: "GitHub Enterprise Cloud",
    softwareCode: "SW-GH-ENT",
    category: "DEV_TOOLS",
    vendor: "GitHub / Microsoft",
    vendorCode: "VND-GITHUB",
    vendorTier: "STRATEGIC",
    initials: "GH",
    tone: "slate",
    type: "SaaS · Annual",
    rawType: "SAAS_SUBSCRIPTION",
    billingCycle: "ANNUALLY",
    seats: 140,
    used: 112,
    renewal: "Feb 02, 2026",
    cost: "$29,400",
    status: "Healthy",
    dbStatus: "ACTIVE",
    licenseKey: "GH-ENT-CLD-9104-BB9",
  },
]

// 1. Check database connectivity
export async function testDatabaseConnection(): Promise<DbStatus> {
  try {
    const res = await fetch("/api/db/status")
    if (res.ok) {
      return await res.json()
    }
    return {
      configured: false,
      connected: false,
      engine: "Prisma (MySQL)",
      error: `API responded with HTTP ${res.status}`,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      configured: false,
      connected: false,
      engine: "Prisma (MySQL)",
      error: `Failed to connect to API: ${message}`,
    }
  }
}

// 2. Fetch full governance overview & radar
export async function fetchGovernanceOverview(): Promise<GovernanceOverview | null> {
  try {
    const res = await fetch("/api/governance/overview")
    if (res.ok) {
      const data = await res.json()
      return data
    }
  } catch (err) {
    console.error("[DB] fetchGovernanceOverview error:", err)
  }
  return null
}

// 3. Fetch all licenses
export async function fetchLicenses(): Promise<{ licenses: LicenseRecord[]; isFromDb: boolean; engine?: string }> {
  try {
    const res = await fetch("/api/licenses")
    if (res.ok) {
      const data = await res.json()
      return {
        licenses: data.licenses || INITIAL_DEFAULT_LICENSES,
        isFromDb: data.isFromDb ?? true,
        engine: data.engine || "MySQL 3NF (Prisma ORM)",
      }
    }
  } catch (err) {
    console.warn("[DB] API request failed, using local fallback licenses:", err)
  }

  return {
    licenses: INITIAL_DEFAULT_LICENSES,
    isFromDb: false,
    engine: "Local / Fallback",
  }
}

// 4. Create license
export async function createLicense(lic: any): Promise<any> {
  const res = await fetch("/api/licenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lic),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || "Failed to create license")
  }
  return data.license
}

// 5. Delete license
export async function deleteLicense(id: number): Promise<boolean> {
  const res = await fetch(`/api/licenses/${id}`, { method: "DELETE" })
  return res.ok
}

// 6. Fetch Directory (Employees & Devices)
export async function fetchDirectory(): Promise<{ employees: any[]; devices: any[] }> {
  const res = await fetch("/api/allocations/directory")
  if (res.ok) {
    return await res.json()
  }
  return { employees: [], devices: [] }
}

// 7. Provision Seat Allocation
export async function provisionAllocation(params: {
  licenseId: number
  employeeId: number
  deviceId?: number | null
  allocatedBy?: string
}): Promise<any> {
  const res = await fetch("/api/allocations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || "Failed to allocate seat")
  }
  return data
}

// 8. Revoke Allocation
export async function revokeAllocation(allocationId: number): Promise<any> {
  const res = await fetch(`/api/allocations/${allocationId}`, {
    method: "DELETE",
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || "Failed to revoke seat")
  }
  return data
}

// 9. Execute Contract Renewal Workflow
export async function logRenewal(params: {
  licenseId: number
  renewalCost: number | string
  nextExpiryDate: string
  invoiceNo?: string
  approvedBy?: string
  notes?: string
}): Promise<any> {
  const res = await fetch("/api/renewals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || "Failed to process renewal")
  }
  return data
}

// 10. Run Automated Audit Scan
export async function runComplianceAudit(params?: { auditorName?: string; actionTaken?: string }): Promise<any> {
  const res = await fetch("/api/audits/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params || {}),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || "Failed to run audit")
  }
  return data.audit
}

// 11. Fetch Vendors
export async function fetchVendors(): Promise<any[]> {
  const res = await fetch("/api/vendors")
  if (res.ok) {
    const data = await res.json()
    return data.vendors || []
  }
  return []
}

// 12. Seed Prisma Database
export async function seedPrismaDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("/api/db/seed", { method: "POST" })
    const data = await res.json()
    return {
      success: res.ok,
      message: data.message || data.error || "Seeding complete",
    }
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err),
    }
  }
}

export function generateRandomLicenses(count = 5): any[] {
  return []
}

// 5b. Update License
export async function updateLicense(id: number, data: any): Promise<any> {
  const res = await fetch(`/api/licenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const resJson = await res.json()
  if (!res.ok) {
    throw new Error(resJson.error || "Failed to update license")
  }
  return resJson.license
}
