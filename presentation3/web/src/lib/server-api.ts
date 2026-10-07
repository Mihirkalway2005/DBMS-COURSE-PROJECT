import prisma from "@/lib/prisma"

export async function getDbStatus() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
    return {
      status: 200,
      data: {
        configured: false,
        connected: false,
        engine: "Prisma (MySQL 3NF)",
        error: "DATABASE_URL is not set",
      },
    }
  }

  const start = performance.now()
  try {
    const raw = (await prisma.$queryRaw`SELECT NOW() as server_time, VERSION() as version;`) as Array<{
      server_time: string
      version: string
    }>
    const latencyMs = Math.round(performance.now() - start)
    const licenseCount = await prisma.license.count().catch(() => 0)
    const vendorCount = await prisma.vendor.count().catch(() => 0)
    const employeeCount = await prisma.employee.count().catch(() => 0)
    const allocationCount = await prisma.licenseAllocation.count().catch(() => 0)

    return {
      status: 200,
      data: {
        configured: true,
        connected: true,
        engine: "MySQL 3NF (Prisma ORM)",
        dbVersion: raw[0]?.version || "MySQL 9.x",
        latencyMs,
        serverTime: raw[0]?.server_time,
        counts: {
          licenses: licenseCount,
          vendors: vendorCount,
          employees: employeeCount,
          allocations: allocationCount,
        },
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      status: 200,
      data: {
        configured: true,
        connected: false,
        engine: "MySQL 3NF (Prisma ORM)",
        error: message,
      },
    }
  }
}

export async function getGovernanceOverview() {
  try {
    const licenses = await prisma.license.findMany({
      include: {
        software: {
          include: { vendor: true },
        },
        allocations: {
          where: { status: "ACTIVE" },
          include: {
            employee: true,
            device: true,
          },
        },
        renewalLogs: {
          orderBy: { renewalDate: "desc" },
          take: 1,
        },
      },
      orderBy: { id: "asc" },
    })

    const now = new Date()
    let totalAnnualSpend = 0
    let totalSeatsPurchased = 0
    let totalSeatsAllocated = 0
    let ghostLicensesCount = 0
    let saturatedLicensesCount = 0
    let renewingIn30DaysCount = 0
    let renewingIn60DaysCount = 0

    const expiringRadar: any[] = []
    const vendorSpendMap: Record<string, { vendor: string; spend: number; seats: number; used: number }> = {}
    const deptAllocMap: Record<string, { department: string; allocated: number; spendEst: number }> = {}

    for (const lic of licenses) {
      const cost = Number(lic.totalCost)
      totalAnnualSpend += cost
      totalSeatsPurchased += lic.totalSeats
      totalSeatsAllocated += lic.allocatedSeats

      if (lic.allocatedSeats === 0) {
        ghostLicensesCount++
      }
      if (lic.allocatedSeats >= lic.totalSeats) {
        saturatedLicensesCount++
      }

      const exp = new Date(lic.expiryDate)
      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysLeft <= 30 && daysLeft >= 0) {
        renewingIn30DaysCount++
        expiringRadar.push({
          id: lic.id,
          software: lic.software.name,
          vendor: lic.software.vendor.name,
          licenseKey: lic.licenseKey,
          expiryDate: lic.expiryDate,
          daysLeft,
          cost: Number(lic.totalCost),
          urgency: "CRITICAL",
        })
      } else if (daysLeft <= 60 && daysLeft > 30) {
        renewingIn60DaysCount++
        expiringRadar.push({
          id: lic.id,
          software: lic.software.name,
          vendor: lic.software.vendor.name,
          licenseKey: lic.licenseKey,
          expiryDate: lic.expiryDate,
          daysLeft,
          cost: Number(lic.totalCost),
          urgency: "UPCOMING",
        })
      }

      // Vendor spend breakdown
      const vName = lic.software.vendor.name
      if (!vendorSpendMap[vName]) {
        vendorSpendMap[vName] = { vendor: vName, spend: 0, seats: 0, used: 0 }
      }
      vendorSpendMap[vName].spend += cost
      vendorSpendMap[vName].seats += lic.totalSeats
      vendorSpendMap[vName].used += lic.allocatedSeats

      // Department allocation breakdown
      for (const alc of lic.allocations) {
        const dept = alc.employee?.department || "Unassigned"
        if (!deptAllocMap[dept]) {
          deptAllocMap[dept] = { department: dept, allocated: 0, spendEst: 0 }
        }
        deptAllocMap[dept].allocated += 1
        deptAllocMap[dept].spendEst += Number(lic.unitCost)
      }
    }

    const activeSubscriptions = licenses.filter((l) => l.status === "ACTIVE").length
    const seatSaturationPct =
      totalSeatsPurchased > 0
        ? Number(((totalSeatsAllocated / totalSeatsPurchased) * 100).toFixed(1))
        : 0

    // Audits summary
    const audits = await prisma.auditRecord.findMany({
      orderBy: { auditDate: "desc" },
    })
    const complianceViolations = audits.filter((a) => a.complianceStatus !== "COMPLIANT").length

    return {
      status: 200,
      data: {
        success: true,
        kpi: {
          totalAnnualSpend,
          activeSubscriptions,
          seatSaturationPct,
          complianceViolations,
          totalSeatsPurchased,
          totalSeatsAllocated,
          ghostLicensesCount,
          saturatedLicensesCount,
          renewingIn30DaysCount,
          renewingIn60DaysCount,
        },
        radar: expiringRadar.sort((a, b) => a.daysLeft - b.daysLeft),
        vendorSpend: Object.values(vendorSpendMap),
        deptAllocations: Object.values(deptAllocMap),
        recentAudits: audits.slice(0, 5),
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      status: 500,
      data: { success: false, error: message },
    }
  }
}

export async function getLicenses() {
  try {
    const licenses = await prisma.license.findMany({
      include: {
        software: {
          include: { vendor: true },
        },
        allocations: {
          include: { employee: true, device: true },
        },
        renewalLogs: {
          orderBy: { renewalDate: "desc" },
        },
      },
      orderBy: { id: "asc" },
    })

    const formatted = licenses.map((lic) => {
      const activeCount = lic.allocations.filter((a) => a.status === "ACTIVE").length
      const initials =
        lic.software.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "SW"

      const tones = ["violet", "slate", "coral", "amber", "blue"]
      const tone = tones[lic.id % tones.length]

      const d = new Date(lic.expiryDate)
      const renewalStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })

      return {
        id: lic.id,
        name: lic.software.name,
        softwareCode: lic.software.softwareCode,
        category: lic.software.category,
        vendor: lic.software.vendor.name,
        vendorCode: lic.software.vendor.vendorCode,
        vendorTier: lic.software.vendor.tier,
        initials,
        tone,
        type: `${lic.licenseType.replace("_", " ")} · ${lic.billingCycle}`,
        rawType: lic.licenseType,
        billingCycle: lic.billingCycle,
        seats: lic.totalSeats,
        used: lic.allocatedSeats || activeCount,
        unitCost: Number(lic.unitCost),
        totalCostNum: Number(lic.totalCost),
        renewal: renewalStr,
        expiryDate: lic.expiryDate,
        purchaseDate: lic.purchaseDate,
        autoRenew: lic.autoRenew,
        cost: `$${Number(lic.totalCost).toLocaleString()}`,
        status:
          lic.status === "EXPIRED"
            ? "Expired"
            : lic.allocatedSeats >= lic.totalSeats
            ? "Attention"
            : "Healthy",
        dbStatus: lic.status,
        licenseKey: lic.licenseKey,
        allocationsCount: lic.allocations.length,
        allocations: lic.allocations,
        renewalLogs: lic.renewalLogs,
      }
    })

    return {
      status: 200,
      data: {
        success: true,
        isFromDb: true,
        engine: "MySQL 3NF (Prisma ORM)",
        licenses: formatted,
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      status: 500,
      data: { success: false, error: message },
    }
  }
}

export async function createLicense(body: any) {
  try {
    const totalSeats = Math.max(1, Number(body.seats || 1))
    const rawCost = Number(String(body.cost || "0").replace(/[^0-9.]/g, "")) || 0
    if (rawCost <= 0) {
      return { status: 400, data: { success: false, error: "Total cost must be a positive value > 0." } }
    }
    const unitCost = Number((rawCost / totalSeats).toFixed(2))

    const expiry = body.expiryDate ? new Date(body.expiryDate) : new Date(Date.now() + 365 * 86400000)
    const purchase = body.purchaseDate ? new Date(body.purchaseDate) : new Date()

    const vendorName = String(body.vendor || "Standard Publisher").trim()
    let vendor = await prisma.vendor.findFirst({ where: { name: vendorName } })
    if (!vendor) {
      const code = `VND-${vendorName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`
      vendor = await prisma.vendor.create({
        data: {
          vendorCode: `${code}-${Date.now().toString().slice(-4)}`,
          name: vendorName,
          contactEmail: `contact@${vendorName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          tier: "STANDARD",
        },
      })
    }

    const swName = String(body.name || body.software || "Enterprise Software").trim()
    let software = await prisma.software.findFirst({
      where: { name: swName, vendorId: vendor.id },
    })
    if (!software) {
      const swCode = `SW-${swName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-${Date.now().toString().slice(-4)}`
      software = await prisma.software.create({
        data: {
          softwareCode: swCode,
          name: swName,
          category: body.category || "PRODUCTIVITY",
          currentVersion: body.version || "2025.1",
          vendorId: vendor.id,
        },
      })
    }

    const genKey =
      body.licenseKey ||
      `${swName.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    let lType: any = "SAAS_SUBSCRIPTION"
    if (String(body.type).toLowerCase().includes("perpetual")) lType = "PERPETUAL"
    else if (String(body.type).toLowerCase().includes("trial")) lType = "TRIAL"
    else if (String(body.type).toLowerCase().includes("seat")) lType = "SEAT_BASED"
    else if (String(body.type).toLowerCase().includes("oem")) lType = "OEM"

    const created = await prisma.license.create({
      data: {
        licenseKey: genKey,
        licenseType: lType,
        totalSeats,
        allocatedSeats: 0,
        purchaseDate: purchase,
        expiryDate: expiry,
        unitCost,
        totalCost: rawCost,
        billingCycle: body.billingCycle || "ANNUALLY",
        autoRenew: Boolean(body.autoRenew ?? true),
        status: "ACTIVE",
        softwareId: software.id,
      },
      include: {
        software: { include: { vendor: true } },
      },
    })

    return { status: 201, data: { success: true, license: created } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}

export async function updateLicense(id: number, body: any) {
  try {
    const existing = await prisma.license.findUnique({
      where: { id },
      include: { software: true },
    })
    if (!existing) {
      return { status: 404, data: { success: false, error: "License not found" } }
    }

    const totalSeats = body.seats !== undefined ? Number(body.seats) : existing.totalSeats
    if (totalSeats < existing.allocatedSeats) {
      return {
        status: 400,
        data: {
          success: false,
          error: `Capacity error: Cannot set total seats (${totalSeats}) below currently allocated active seats (${existing.allocatedSeats}).`,
        },
      }
    }

    const rawCost = body.cost !== undefined ? Number(String(body.cost).replace(/[^0-9.]/g, "")) : Number(existing.totalCost)
    if (rawCost <= 0) {
      return { status: 400, data: { success: false, error: "Total cost must be a positive value > 0." } }
    }
    const unitCost = Number((rawCost / totalSeats).toFixed(2))

    if (body.name || body.category) {
      await prisma.software.update({
        where: { id: existing.softwareId },
        data: {
          name: body.name || undefined,
          category: body.category || undefined,
        },
      })
    }

    const updated = await prisma.license.update({
      where: { id },
      data: {
        totalSeats,
        totalCost: rawCost,
        unitCost,
        status: body.status || undefined,
        licenseType: body.rawType || body.type || undefined,
        billingCycle: body.billingCycle || undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        autoRenew: body.autoRenew !== undefined ? Boolean(body.autoRenew) : undefined,
      },
      include: {
        software: { include: { vendor: true } },
      },
    })

    return { status: 200, data: { success: true, license: updated } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}

export async function deleteLicense(id: number) {
  try {
    await prisma.license.delete({ where: { id } })
    return { status: 200, data: { success: true, deletedId: id } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}

export async function getAllocationsDirectory() {
  try {
    const employees = await prisma.employee.findMany({
      include: { devices: true },
      orderBy: { fullName: "asc" },
    })
    const devices = await prisma.device.findMany({
      include: { employee: true },
      orderBy: { assetTag: "asc" },
    })
    return { status: 200, data: { success: true, employees, devices } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}

export async function createAllocation(body: any) {
  try {
    const licenseId = Number(body.licenseId)
    const employeeId = Number(body.employeeId)
    const deviceId = body.deviceId ? Number(body.deviceId) : null

    const lic = await prisma.license.findUnique({
      where: { id: licenseId },
      include: { software: true },
    })
    if (!lic) return { status: 404, data: { success: false, error: "License not found" } }

    if (lic.status === "EXPIRED" || new Date(lic.expiryDate).getTime() < Date.now()) {
      return {
        status: 400,
        data: {
          success: false,
          error: `Integrity Constraint Violation: License ${lic.licenseKey} has expired on ${lic.expiryDate.toISOString().slice(0, 10)}. Allocations prohibited.`,
        },
      }
    }

    if (lic.allocatedSeats >= lic.totalSeats) {
      return {
        status: 400,
        data: {
          success: false,
          error: `Integrity Constraint Violation: License seat capacity reached 100% saturation (${lic.allocatedSeats}/${lic.totalSeats} seats). Cannot provision further.`,
        },
      }
    }

    const existing = await prisma.licenseAllocation.findFirst({
      where: { licenseId, employeeId, status: "ACTIVE" },
    })
    if (existing) {
      return {
        status: 400,
        data: {
          success: false,
          error: "Employee already has an active seat allocated for this software license.",
        },
      }
    }

    const allocCode = `ALC-${lic.software.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`

    const [allocation, updatedLic] = await prisma.$transaction([
      prisma.licenseAllocation.create({
        data: {
          allocationCode: allocCode,
          licenseId,
          employeeId,
          deviceId,
          allocatedDate: new Date(),
          status: "ACTIVE",
          allocatedBy: body.allocatedBy || "IT Admin",
        },
        include: { employee: true, device: true, license: { include: { software: true } } },
      }),
      prisma.license.update({
        where: { id: licenseId },
        data: { allocatedSeats: { increment: 1 } },
      }),
    ])

    return {
      status: 201,
      data: {
        success: true,
        allocation,
        currentAllocatedSeats: updatedLic.allocatedSeats,
        totalSeats: updatedLic.totalSeats,
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}

export async function revokeAllocation(allocId: number) {
  try {
    const alloc = await prisma.licenseAllocation.findUnique({
      where: { id: allocId },
      include: { license: true },
    })

    if (!alloc) {
      return { status: 404, data: { success: false, error: "Allocation record not found" } }
    }

    const now = new Date()
    await prisma.$transaction([
      prisma.licenseAllocation.update({
        where: { id: allocId },
        data: {
          status: "REVOKED",
          deallocatedDate: now,
        },
      }),
      prisma.license.update({
        where: { id: alloc.licenseId },
        data: {
          allocatedSeats: {
            decrement: alloc.license.allocatedSeats > 0 ? 1 : 0,
          },
        },
      }),
    ])

    return {
      status: 200,
      data: {
        success: true,
        revokedAllocationId: allocId,
        message: "Seat successfully reclaimed and returned to available inventory.",
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}

export async function createRenewal(body: any) {
  try {
    const licenseId = Number(body.licenseId)
    const renewalCost = Number(String(body.renewalCost).replace(/[^0-9.]/g, "")) || 0
    if (renewalCost <= 0) {
      return { status: 400, data: { success: false, error: "Renewal cost must be > 0." } }
    }

    const lic = await prisma.license.findUnique({ where: { id: licenseId } })
    if (!lic) return { status: 404, data: { success: false, error: "License not found" } }

    const newExpiry = body.nextExpiryDate
      ? new Date(body.nextExpiryDate)
      : new Date(new Date(lic.expiryDate).getTime() + 365 * 86400000)

    const invoiceNo = body.invoiceNo || `RNW-INV-${Date.now().toString().slice(-6)}`

    const [log, updatedLic] = await prisma.$transaction([
      prisma.renewalLog.create({
        data: {
          licenseId,
          renewalDate: new Date(),
          nextExpiryDate: newExpiry,
          renewalCost,
          invoiceNo,
          approvedBy: body.approvedBy || "Procurement Director",
          notes: body.notes || "Contract term extension executed via Licentra Renewal Workflow.",
        },
      }),
      prisma.license.update({
        where: { id: licenseId },
        data: {
          expiryDate: newExpiry,
          status: "ACTIVE",
          totalCost: renewalCost,
        },
      }),
    ])

    return { status: 201, data: { success: true, renewalLog: log, updatedLicense: updatedLic } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}

export async function runAudit(body: any) {
  try {
    const licenses = await prisma.license.findMany({
      include: { software: true },
    })

    let overAllocated = 0
    let shelfwareCount = 0
    let expiredCount = 0
    const findingsList: string[] = []

    for (const l of licenses) {
      if (l.allocatedSeats > l.totalSeats) {
        overAllocated++
        findingsList.push(`Over-allocation: ${l.software.name} has ${l.allocatedSeats} seats used out of ${l.totalSeats}.`)
      }
      if (l.allocatedSeats === 0 || l.allocatedSeats / l.totalSeats < 0.15) {
        shelfwareCount++
        findingsList.push(`Shelfware Waste: ${l.software.name} is severely underutilized (${l.allocatedSeats}/${l.totalSeats} seats).`)
      }
      if (new Date(l.expiryDate).getTime() < Date.now()) {
        expiredCount++
        findingsList.push(`Expired Contract: ${l.software.name} expired on ${l.expiryDate.toISOString().slice(0, 10)}.`)
      }
    }

    let complianceStatus: any = "COMPLIANT"
    if (overAllocated > 0) complianceStatus = "NON_COMPLIANT"
    else if (shelfwareCount > 0 || expiredCount > 0) complianceStatus = "AT_RISK"

    const audit = await prisma.auditRecord.create({
      data: {
        auditDate: new Date(),
        auditorName: body.auditorName || "Licentra Governance Engine",
        totalLicensesAudited: licenses.length,
        overAllocatedCount: overAllocated,
        complianceStatus,
        findings: findingsList.join("\n") || "All software licenses within permissible capacity limits and active validity periods.",
        actionTaken: body.actionTaken || (complianceStatus === "COMPLIANT" ? "Certified compliant" : "Rebalance and procurement alerts dispatched."),
      },
    })

    return { status: 201, data: { success: true, audit } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}

export async function getVendors() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        softwareProducts: {
          include: {
            licenses: true,
          },
        },
        purchases: true,
      },
      orderBy: { name: "asc" },
    })
    return { status: 200, data: { success: true, vendors } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}

export async function seedDatabase() {
  try {
    const { execSync } = await import("node:child_process")
    execSync("bun prisma/seed.ts", { cwd: process.cwd(), stdio: "inherit" })
    return { status: 200, data: { success: true, message: "Database reseeded with enterprise dataset." } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 500, data: { success: false, error: message } }
  }
}
