import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting enterprise seed for Licentra MySQL database...")

  // 1. Clean existing records in reverse foreign-key order
  console.log("🧹 Purging stale records...")
  await prisma.auditRecord.deleteMany()
  await prisma.renewalLog.deleteMany()
  await prisma.licenseAllocation.deleteMany()
  await prisma.license.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.software.deleteMany()
  await prisma.device.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.department.deleteMany()
  await prisma.vendor.deleteMany()

  // 2. Departments
  console.log("🏢 Seeding enterprise departments...")
  const deptsData = [
    { deptCode: "DEP-ENG", name: "Platform Engineering", departmentHead: "Elena Rostova" },
    { deptCode: "DEP-DES", name: "Product & UX Design", departmentHead: "Marcus Chen" },
    { deptCode: "DEP-SEC", name: "Cybersecurity & InfoSec", departmentHead: "David Vance" },
    { deptCode: "DEP-OPS", name: "Cloud Infrastructure & SRE", departmentHead: "Carlos Ramos" },
    { deptCode: "DEP-FIN", name: "Finance & Procurement", departmentHead: "Rachel Green" },
    { deptCode: "DEP-DAT", name: "Data Science & AI", departmentHead: "Priya Sharma" },
  ]
  const depts: Record<string, any> = {}
  for (const d of deptsData) {
    depts[d.deptCode] = await prisma.department.create({ data: d })
  }

  // 3. Employees
  console.log("👥 Seeding employees across departments...")
  const employeesData = [
    { empCode: "EMP-001", fullName: "Elena Rostova", email: "elena.rostova@acme.corp", department: "Platform Engineering", role: "VP of Engineering", departmentId: depts["DEP-ENG"].id },
    { empCode: "EMP-002", fullName: "Alex Rivera", email: "alex.rivera@acme.corp", department: "Platform Engineering", role: "Staff Software Architect", departmentId: depts["DEP-ENG"].id },
    { empCode: "EMP-003", fullName: "Liam O'Connor", email: "liam.oconnor@acme.corp", department: "Platform Engineering", role: "Senior Backend Engineer", departmentId: depts["DEP-ENG"].id },
    { empCode: "EMP-004", fullName: "Ethan Wright", email: "ethan.wright@acme.corp", department: "Platform Engineering", role: "Frontend Tech Lead", departmentId: depts["DEP-ENG"].id },

    { empCode: "EMP-005", fullName: "Marcus Chen", email: "marcus.chen@acme.corp", department: "Product & UX Design", role: "Design Director", departmentId: depts["DEP-DES"].id },
    { empCode: "EMP-006", fullName: "Sophia Patel", email: "sophia.patel@acme.corp", department: "Product & UX Design", role: "Lead Product Designer", departmentId: depts["DEP-DES"].id },
    { empCode: "EMP-007", fullName: "Claire Dupont", email: "claire.dupont@acme.corp", department: "Product & UX Design", role: "Senior UX Researcher", departmentId: depts["DEP-DES"].id },

    { empCode: "EMP-008", fullName: "David Vance", email: "david.vance@acme.corp", department: "Cybersecurity & InfoSec", role: "Chief Information Security Officer", departmentId: depts["DEP-SEC"].id },
    { empCode: "EMP-009", fullName: "Kenji Takahashi", email: "kenji.takahashi@acme.corp", department: "Cybersecurity & InfoSec", role: "Senior SecOps Engineer", departmentId: depts["DEP-SEC"].id },

    { empCode: "EMP-010", fullName: "Carlos Ramos", email: "carlos.ramos@acme.corp", department: "Cloud Infrastructure & SRE", role: "DevOps & Cloud SRE Lead", departmentId: depts["DEP-OPS"].id },
    { empCode: "EMP-011", fullName: "Maya Lin", email: "maya.lin@acme.corp", department: "Cloud Infrastructure & SRE", role: "Senior IT Systems Admin", departmentId: depts["DEP-OPS"].id },
    { empCode: "EMP-012", fullName: "Tariq Al-Mansoor", email: "tariq.mansoor@acme.corp", department: "Cloud Infrastructure & SRE", role: "Site Reliability Engineer", departmentId: depts["DEP-OPS"].id },

    { empCode: "EMP-013", fullName: "Rachel Green", email: "rachel.green@acme.corp", department: "Finance & Procurement", role: "Global Procurement Director", departmentId: depts["DEP-FIN"].id },
    { empCode: "EMP-014", fullName: "Olivia Taylor", email: "olivia.taylor@acme.corp", department: "Finance & Procurement", role: "IT Asset & Vendor Analyst", departmentId: depts["DEP-FIN"].id },

    { empCode: "EMP-015", fullName: "Priya Sharma", email: "priya.sharma@acme.corp", department: "Data Science & AI", role: "Principal Data Architect", departmentId: depts["DEP-DAT"].id },
    { empCode: "EMP-016", fullName: "Ananya Rao", email: "ananya.rao@acme.corp", department: "Data Science & AI", role: "Staff Machine Learning Engineer", departmentId: depts["DEP-DAT"].id },
  ]
  const employees: Record<string, any> = {}
  for (const emp of employeesData) {
    employees[emp.empCode] = await prisma.employee.create({ data: emp })
  }

  // 4. Workstations & Hardware Assets
  console.log("💻 Seeding hardware devices & server instances...")
  const devicesData = [
    { assetTag: "AST-MBP-16-01", deviceName: "MacBook Pro 16\" (M3 Max)", deviceType: "LAPTOP" as const, os: "macOS Sequoia", employeeId: employees["EMP-001"].id },
    { assetTag: "AST-MBP-16-02", deviceName: "MacBook Pro 16\" (M3 Pro)", deviceType: "LAPTOP" as const, os: "macOS Sequoia", employeeId: employees["EMP-002"].id },
    { assetTag: "AST-WRK-DELL-01", deviceName: "Dell Precision 7780 Workstation", deviceType: "DESKTOP" as const, os: "Ubuntu 24.04 LTS", employeeId: employees["EMP-003"].id },
    { assetTag: "AST-MBP-14-01", deviceName: "MacBook Pro 14\" (M3)", deviceType: "LAPTOP" as const, os: "macOS Sonoma", employeeId: employees["EMP-004"].id },
    { assetTag: "AST-MBP-16-03", deviceName: "MacBook Pro 16\" (M3 Max)", deviceType: "LAPTOP" as const, os: "macOS Sequoia", employeeId: employees["EMP-005"].id },
    { assetTag: "AST-MBP-14-02", deviceName: "MacBook Pro 14\" (M2 Pro)", deviceType: "LAPTOP" as const, os: "macOS Sonoma", employeeId: employees["EMP-006"].id },
    { assetTag: "AST-AIR-15-01", deviceName: "MacBook Air 15\" (M3)", deviceType: "LAPTOP" as const, os: "macOS Sequoia", employeeId: employees["EMP-007"].id },
    { assetTag: "AST-TP-LEN-01", deviceName: "Lenovo ThinkPad P1 Gen 6", deviceType: "LAPTOP" as const, os: "Windows 11 Enterprise", employeeId: employees["EMP-008"].id },
    { assetTag: "AST-TP-LEN-02", deviceName: "Lenovo ThinkPad X1 Carbon", deviceType: "LAPTOP" as const, os: "Fedora Linux 41", employeeId: employees["EMP-009"].id },
    { assetTag: "AST-WRK-HP-01", deviceName: "HP ZBook Studio G10 Workstation", deviceType: "DESKTOP" as const, os: "Ubuntu 24.04 LTS", employeeId: employees["EMP-010"].id },
    { assetTag: "AST-MBP-14-03", deviceName: "MacBook Pro 14\" (M3 Pro)", deviceType: "LAPTOP" as const, os: "macOS Sonoma", employeeId: employees["EMP-011"].id },
    { assetTag: "AST-SRV-R760-01", deviceName: "Dell PowerEdge R760 Rack Server", deviceType: "SERVER" as const, os: "RHEL 9.4", employeeId: employees["EMP-012"].id },
    { assetTag: "AST-TP-LEN-03", deviceName: "Lenovo ThinkPad T14s Gen 4", deviceType: "LAPTOP" as const, os: "Windows 11 Enterprise", employeeId: employees["EMP-013"].id },
    { assetTag: "AST-AIR-13-01", deviceName: "MacBook Air 13\" (M2)", deviceType: "LAPTOP" as const, os: "macOS Sonoma", employeeId: employees["EMP-014"].id },
    { assetTag: "AST-VM-EC2-01", deviceName: "AWS EC2 GPU g5.12xlarge Instance", deviceType: "VM" as const, os: "Amazon Linux 2023", employeeId: employees["EMP-015"].id },
    { assetTag: "AST-MBP-16-04", deviceName: "MacBook Pro 16\" (M3 Max)", deviceType: "LAPTOP" as const, os: "macOS Sequoia", employeeId: employees["EMP-016"].id },
  ]
  const devices: Record<string, any> = {}
  for (const dev of devicesData) {
    devices[dev.assetTag] = await prisma.device.create({ data: dev })
  }

  // 5. Vendors
  console.log("🏢 Seeding strategic and preferred enterprise vendors...")
  const vendorsData = [
    { vendorCode: "VND-FIGMA", name: "Figma, Inc.", contactEmail: "enterprise-licensing@figma.com", website: "https://figma.com", supportPhone: "+1-800-456-3446", tier: "STRATEGIC" as const },
    { vendorCode: "VND-GITHUB", name: "GitHub / Microsoft", contactEmail: "enterprise-sales@github.com", website: "https://github.com", supportPhone: "+1-877-448-4820", tier: "STRATEGIC" as const },
    { vendorCode: "VND-JETBRAINS", name: "JetBrains s.r.o.", contactEmail: "licensing@jetbrains.com", website: "https://jetbrains.com", supportPhone: "+420-241-722-540", tier: "PREFERRED" as const },
    { vendorCode: "VND-SLACK", name: "Slack Technologies (Salesforce)", contactEmail: "enterprise-desk@slack.com", website: "https://slack.com", supportPhone: "+1-800-667-6389", tier: "PREFERRED" as const },
    { vendorCode: "VND-MSFT", name: "Microsoft Corporation", contactEmail: "m365-licensing@microsoft.com", website: "https://microsoft.com", supportPhone: "+1-800-642-7676", tier: "STRATEGIC" as const },
    { vendorCode: "VND-CROWDSTRIKE", name: "CrowdStrike, Inc.", contactEmail: "contracts@crowdstrike.com", website: "https://crowdstrike.com", supportPhone: "+1-888-512-8906", tier: "STRATEGIC" as const },
    { vendorCode: "VND-DATADOG", name: "Datadog, Inc.", contactEmail: "orders@datadoghq.com", website: "https://datadoghq.com", supportPhone: "+1-866-328-2364", tier: "STRATEGIC" as const },
    { vendorCode: "VND-ATLASSIAN", name: "Atlassian Corporation", contactEmail: "licensing@atlassian.com", website: "https://atlassian.com", supportPhone: "+1-800-428-5277", tier: "PREFERRED" as const },
    { vendorCode: "VND-ADOBE", name: "Adobe Systems", contactEmail: "enterprise-solutions@adobe.com", website: "https://adobe.com", supportPhone: "+1-800-833-6687", tier: "PREFERRED" as const },
    { vendorCode: "VND-SNOWFLAKE", name: "Snowflake Inc.", contactEmail: "sales-licensing@snowflake.com", website: "https://snowflake.com", supportPhone: "+1-844-766-9355", tier: "PREFERRED" as const },
    { vendorCode: "VND-DOCKER", name: "Docker, Inc.", contactEmail: "enterprise-sales@docker.com", website: "https://docker.com", supportPhone: "+1-800-555-3625", tier: "STANDARD" as const },
  ]
  const vendors: Record<string, any> = {}
  for (const v of vendorsData) {
    vendors[v.vendorCode] = await prisma.vendor.create({ data: v })
  }

  // 6. Software Catalog
  console.log("📦 Seeding software product catalog...")
  const softwareCatalogData = [
    { softwareCode: "SW-FIG-ORG", name: "Figma Enterprise Organization", category: "DESIGN" as const, currentVersion: "124.2", vendorId: vendors["VND-FIGMA"].id },
    { softwareCode: "SW-GH-ENT", name: "GitHub Enterprise Cloud", category: "DEV_TOOLS" as const, currentVersion: "3.14.0", vendorId: vendors["VND-GITHUB"].id },
    { softwareCode: "SW-JB-ALL", name: "JetBrains All Products Pack", category: "DEV_TOOLS" as const, currentVersion: "2025.1", vendorId: vendors["VND-JETBRAINS"].id },
    { softwareCode: "SW-SLK-GRID", name: "Slack Enterprise Grid", category: "PRODUCTIVITY" as const, currentVersion: "4.41.0", vendorId: vendors["VND-SLACK"].id },
    { softwareCode: "SW-M365-E5", name: "Microsoft 365 E5 Suite", category: "PRODUCTIVITY" as const, currentVersion: "16.0", vendorId: vendors["VND-MSFT"].id },
    { softwareCode: "SW-CS-FALCON", name: "CrowdStrike Falcon Complete", category: "SECURITY" as const, currentVersion: "7.18.2", vendorId: vendors["VND-CROWDSTRIKE"].id },
    { softwareCode: "SW-DD-APM", name: "Datadog Cloud APM & Infra", category: "CLOUD_INFRA" as const, currentVersion: "7.52.0", vendorId: vendors["VND-DATADOG"].id },
    { softwareCode: "SW-ATL-JIRA", name: "Jira & Confluence Cloud Enterprise", category: "PRODUCTIVITY" as const, currentVersion: "10.2.1", vendorId: vendors["VND-ATLASSIAN"].id },
    { softwareCode: "SW-ADB-CC", name: "Adobe Creative Cloud All Apps", category: "DESIGN" as const, currentVersion: "2025.0", vendorId: vendors["VND-ADOBE"].id },
    { softwareCode: "SW-SNOW-ENT", name: "Snowflake Enterprise Data Cloud", category: "CLOUD_INFRA" as const, currentVersion: "8.14.0", vendorId: vendors["VND-SNOWFLAKE"].id },
    { softwareCode: "SW-DCK-BUS", name: "Docker Business Subscription", category: "DEV_TOOLS" as const, currentVersion: "4.38.0", vendorId: vendors["VND-DOCKER"].id },
  ]
  const softwareCatalog: Record<string, any> = {}
  for (const sw of softwareCatalogData) {
    softwareCatalog[sw.softwareCode] = await prisma.software.create({ data: sw })
  }

  // 7. Purchases & Invoices
  console.log("📑 Seeding enterprise master procurement purchase records...")
  const purchasesData = [
    { vendorId: vendors["VND-FIGMA"].id, softwareId: softwareCatalog["SW-FIG-ORG"].id, purchaseDate: new Date("2024-11-15"), quantity: 100, invoiceNumber: "INV-2024-FIG-1082" },
    { vendorId: vendors["VND-GITHUB"].id, softwareId: softwareCatalog["SW-GH-ENT"].id, purchaseDate: new Date("2024-12-01"), quantity: 150, invoiceNumber: "INV-2024-GH-9931" },
    { vendorId: vendors["VND-JETBRAINS"].id, softwareId: softwareCatalog["SW-JB-ALL"].id, purchaseDate: new Date("2024-05-15"), quantity: 40, invoiceNumber: "INV-2024-JB-4421" },
    { vendorId: vendors["VND-SLACK"].id, softwareId: softwareCatalog["SW-SLK-GRID"].id, purchaseDate: new Date("2024-06-01"), quantity: 200, invoiceNumber: "INV-2024-SLK-8812" },
    { vendorId: vendors["VND-MSFT"].id, softwareId: softwareCatalog["SW-M365-E5"].id, purchaseDate: new Date("2024-04-01"), quantity: 250, invoiceNumber: "INV-2024-MS-7720" },
    { vendorId: vendors["VND-CROWDSTRIKE"].id, softwareId: softwareCatalog["SW-CS-FALCON"].id, purchaseDate: new Date("2024-10-20"), quantity: 300, invoiceNumber: "INV-2024-CS-3391" },
    { vendorId: vendors["VND-DATADOG"].id, softwareId: softwareCatalog["SW-DD-APM"].id, purchaseDate: new Date("2024-08-10"), quantity: 80, invoiceNumber: "INV-2024-DD-5520" },
    { vendorId: vendors["VND-ATLASSIAN"].id, softwareId: softwareCatalog["SW-ATL-JIRA"].id, purchaseDate: new Date("2024-09-01"), quantity: 180, invoiceNumber: "INV-2024-ATL-6614" },
    { vendorId: vendors["VND-ADOBE"].id, softwareId: softwareCatalog["SW-ADB-CC"].id, purchaseDate: new Date("2024-07-15"), quantity: 50, invoiceNumber: "INV-2024-ADB-2201" },
    { vendorId: vendors["VND-SNOWFLAKE"].id, softwareId: softwareCatalog["SW-SNOW-ENT"].id, purchaseDate: new Date("2024-09-15"), quantity: 60, invoiceNumber: "INV-2024-SNOW-1109" },
    { vendorId: vendors["VND-DOCKER"].id, softwareId: softwareCatalog["SW-DCK-BUS"].id, purchaseDate: new Date("2024-10-01"), quantity: 90, invoiceNumber: "INV-2024-DCK-4019" },
  ]
  const purchases: any[] = []
  for (const pur of purchasesData) {
    purchases.push(await prisma.purchase.create({ data: pur }))
  }

  // 8. Licenses (Real Enterprise SaaS & Seat-based agreements with varied lifecycle states)
  console.log("🔑 Provisioning software licenses and contract parameters...")
  const now = new Date()
  const inDays = (days: number) => new Date(now.getTime() + days * 86400000)

  const licensesData = [
    {
      licenseKey: "FIG-ENT-8842-ORG-V1",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 100,
      allocatedSeats: 94,
      purchaseDate: new Date("2024-11-15"),
      expiryDate: inDays(18), // CRITICAL radar urgency (< 30 days)
      unitCost: 374.40,
      totalCost: 37440.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-FIG-ORG"].id,
      purchaseId: purchases[0].id,
    },
    {
      licenseKey: "GH-ENT-9104-CLD-G2",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 150,
      allocatedSeats: 138,
      purchaseDate: new Date("2024-12-01"),
      expiryDate: inDays(110),
      unitCost: 252.00,
      totalCost: 37800.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-GH-ENT"].id,
      purchaseId: purchases[1].id,
    },
    {
      licenseKey: "JB-ALL-4421-DEV-P3",
      licenseType: "SEAT_BASED" as const,
      totalSeats: 40,
      allocatedSeats: 38,
      purchaseDate: new Date("2024-05-15"),
      expiryDate: inDays(42), // UPCOMING radar urgency (< 60 days)
      unitCost: 300.00,
      totalCost: 12000.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: false,
      status: "PENDING_RENEWAL" as const,
      softwareId: softwareCatalog["SW-JB-ALL"].id,
      purchaseId: purchases[2].id,
    },
    {
      licenseKey: "SLK-GRID-3341-ENT-K9",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 200,
      allocatedSeats: 200, // 100% Saturated (Triggers Attention badge)
      purchaseDate: new Date("2024-06-01"),
      expiryDate: inDays(75),
      unitCost: 150.00,
      totalCost: 30000.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-SLK-GRID"].id,
      purchaseId: purchases[3].id,
    },
    {
      licenseKey: "MSFT-E5-7720-CORP-M5",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 250,
      allocatedSeats: 215,
      purchaseDate: new Date("2024-04-01"),
      expiryDate: inDays(190),
      unitCost: 420.00,
      totalCost: 105000.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-M365-E5"].id,
      purchaseId: purchases[4].id,
    },
    {
      licenseKey: "CS-FALCON-3391-SEC-C7",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 300,
      allocatedSeats: 280,
      purchaseDate: new Date("2024-10-20"),
      expiryDate: inDays(26), // CRITICAL radar urgency (< 30 days)
      unitCost: 280.00,
      totalCost: 84000.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-CS-FALCON"].id,
      purchaseId: purchases[5].id,
    },
    {
      licenseKey: "DD-APM-5520-INFRA-D4",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 80,
      allocatedSeats: 65,
      purchaseDate: new Date("2024-08-10"),
      expiryDate: inDays(58), // UPCOMING radar urgency (< 60 days)
      unitCost: 600.00,
      totalCost: 48000.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-DD-APM"].id,
      purchaseId: purchases[6].id,
    },
    {
      licenseKey: "ATL-JIRA-6614-PROD-A8",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 180,
      allocatedSeats: 160,
      purchaseDate: new Date("2024-09-01"),
      expiryDate: inDays(140),
      unitCost: 150.00,
      totalCost: 27000.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-ATL-JIRA"].id,
      purchaseId: purchases[7].id,
    },
    {
      licenseKey: "ADB-CC-2201-DES-A2",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 50,
      allocatedSeats: 35,
      purchaseDate: new Date("2024-07-15"),
      expiryDate: inDays(240),
      unitCost: 720.00,
      totalCost: 36000.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-ADB-CC"].id,
      purchaseId: purchases[8].id,
    },
    {
      licenseKey: "SNOW-ENT-1109-DAT-S6",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 60,
      allocatedSeats: 48,
      purchaseDate: new Date("2024-09-15"),
      expiryDate: inDays(310),
      unitCost: 900.00,
      totalCost: 54000.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-SNOW-ENT"].id,
      purchaseId: purchases[9].id,
    },
    {
      licenseKey: "DCK-BUS-4019-DEV-D1",
      licenseType: "SAAS_SUBSCRIPTION" as const,
      totalSeats: 90,
      allocatedSeats: 82,
      purchaseDate: new Date("2024-10-01"),
      expiryDate: inDays(85),
      unitCost: 240.00,
      totalCost: 21600.00,
      billingCycle: "ANNUALLY" as const,
      autoRenew: true,
      status: "ACTIVE" as const,
      softwareId: softwareCatalog["SW-DCK-BUS"].id,
      purchaseId: purchases[10].id,
    },
  ]
  const createdLicenses: any[] = []
  for (const lic of licensesData) {
    createdLicenses.push(await prisma.license.create({ data: lic }))
  }

  // 9. Seat Allocations (Binding employees & devices with audit records)
  console.log("🔗 Binding active seat allocations to staff and workstations...")
  const allocationsData = [
    // Figma Organization Allocations
    { allocationCode: "ALC-FIG-001", licenseId: createdLicenses[0].id, employeeId: employees["EMP-005"].id, deviceId: devices["AST-MBP-16-03"].id, allocatedDate: new Date("2024-11-20"), status: "ACTIVE" as const, allocatedBy: "Marcus Chen" },
    { allocationCode: "ALC-FIG-002", licenseId: createdLicenses[0].id, employeeId: employees["EMP-006"].id, deviceId: devices["AST-MBP-14-02"].id, allocatedDate: new Date("2024-11-20"), status: "ACTIVE" as const, allocatedBy: "Marcus Chen" },
    { allocationCode: "ALC-FIG-003", licenseId: createdLicenses[0].id, employeeId: employees["EMP-007"].id, deviceId: devices["AST-AIR-15-01"].id, allocatedDate: new Date("2024-11-22"), status: "ACTIVE" as const, allocatedBy: "Marcus Chen" },
    { allocationCode: "ALC-FIG-004", licenseId: createdLicenses[0].id, employeeId: employees["EMP-004"].id, deviceId: devices["AST-MBP-14-01"].id, allocatedDate: new Date("2024-12-05"), status: "ACTIVE" as const, allocatedBy: "Elena Rostova" },

    // GitHub Enterprise Allocations
    { allocationCode: "ALC-GH-001", licenseId: createdLicenses[1].id, employeeId: employees["EMP-001"].id, deviceId: devices["AST-MBP-16-01"].id, allocatedDate: new Date("2024-12-02"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-GH-002", licenseId: createdLicenses[1].id, employeeId: employees["EMP-002"].id, deviceId: devices["AST-MBP-16-02"].id, allocatedDate: new Date("2024-12-02"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-GH-003", licenseId: createdLicenses[1].id, employeeId: employees["EMP-003"].id, deviceId: devices["AST-WRK-DELL-01"].id, allocatedDate: new Date("2024-12-02"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-GH-004", licenseId: createdLicenses[1].id, employeeId: employees["EMP-004"].id, deviceId: devices["AST-MBP-14-01"].id, allocatedDate: new Date("2024-12-03"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-GH-005", licenseId: createdLicenses[1].id, employeeId: employees["EMP-010"].id, deviceId: devices["AST-WRK-HP-01"].id, allocatedDate: new Date("2024-12-05"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-GH-006", licenseId: createdLicenses[1].id, employeeId: employees["EMP-016"].id, deviceId: devices["AST-MBP-16-04"].id, allocatedDate: new Date("2024-12-10"), status: "ACTIVE" as const, allocatedBy: "Elena Rostova" },

    // JetBrains All Products Allocations
    { allocationCode: "ALC-JB-001", licenseId: createdLicenses[2].id, employeeId: employees["EMP-002"].id, deviceId: devices["AST-MBP-16-02"].id, allocatedDate: new Date("2024-05-20"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-JB-002", licenseId: createdLicenses[2].id, employeeId: employees["EMP-003"].id, deviceId: devices["AST-WRK-DELL-01"].id, allocatedDate: new Date("2024-05-20"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-JB-003", licenseId: createdLicenses[2].id, employeeId: employees["EMP-015"].id, deviceId: devices["AST-VM-EC2-01"].id, allocatedDate: new Date("2024-06-12"), status: "ACTIVE" as const, allocatedBy: "Elena Rostova" },

    // Slack Enterprise Grid Allocations
    { allocationCode: "ALC-SLK-001", licenseId: createdLicenses[3].id, employeeId: employees["EMP-001"].id, deviceId: devices["AST-MBP-16-01"].id, allocatedDate: new Date("2024-06-02"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-SLK-002", licenseId: createdLicenses[3].id, employeeId: employees["EMP-005"].id, deviceId: devices["AST-MBP-16-03"].id, allocatedDate: new Date("2024-06-02"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-SLK-003", licenseId: createdLicenses[3].id, employeeId: employees["EMP-008"].id, deviceId: devices["AST-TP-LEN-01"].id, allocatedDate: new Date("2024-06-02"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-SLK-004", licenseId: createdLicenses[3].id, employeeId: employees["EMP-013"].id, deviceId: devices["AST-TP-LEN-03"].id, allocatedDate: new Date("2024-06-02"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },

    // Microsoft 365 E5 Suite Allocations
    { allocationCode: "ALC-M365-001", licenseId: createdLicenses[4].id, employeeId: employees["EMP-008"].id, deviceId: devices["AST-TP-LEN-01"].id, allocatedDate: new Date("2024-04-05"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-M365-002", licenseId: createdLicenses[4].id, employeeId: employees["EMP-013"].id, deviceId: devices["AST-TP-LEN-03"].id, allocatedDate: new Date("2024-04-05"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-M365-003", licenseId: createdLicenses[4].id, employeeId: employees["EMP-014"].id, deviceId: devices["AST-AIR-13-01"].id, allocatedDate: new Date("2024-04-05"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },

    // CrowdStrike Falcon Complete Allocations
    { allocationCode: "ALC-CS-001", licenseId: createdLicenses[5].id, employeeId: employees["EMP-008"].id, deviceId: devices["AST-TP-LEN-01"].id, allocatedDate: new Date("2024-10-25"), status: "ACTIVE" as const, allocatedBy: "David Vance" },
    { allocationCode: "ALC-CS-002", licenseId: createdLicenses[5].id, employeeId: employees["EMP-009"].id, deviceId: devices["AST-TP-LEN-02"].id, allocatedDate: new Date("2024-10-25"), status: "ACTIVE" as const, allocatedBy: "David Vance" },
    { allocationCode: "ALC-CS-003", licenseId: createdLicenses[5].id, employeeId: employees["EMP-012"].id, deviceId: devices["AST-SRV-R760-01"].id, allocatedDate: new Date("2024-10-25"), status: "ACTIVE" as const, allocatedBy: "David Vance" },

    // Datadog APM & Infra Allocations
    { allocationCode: "ALC-DD-001", licenseId: createdLicenses[6].id, employeeId: employees["EMP-010"].id, deviceId: devices["AST-WRK-HP-01"].id, allocatedDate: new Date("2024-08-15"), status: "ACTIVE" as const, allocatedBy: "Carlos Ramos" },
    { allocationCode: "ALC-DD-002", licenseId: createdLicenses[6].id, employeeId: employees["EMP-012"].id, deviceId: devices["AST-SRV-R760-01"].id, allocatedDate: new Date("2024-08-15"), status: "ACTIVE" as const, allocatedBy: "Carlos Ramos" },

    // Adobe Creative Cloud Allocations
    { allocationCode: "ALC-ADB-001", licenseId: createdLicenses[8].id, employeeId: employees["EMP-005"].id, deviceId: devices["AST-MBP-16-03"].id, allocatedDate: new Date("2024-07-20"), status: "ACTIVE" as const, allocatedBy: "Marcus Chen" },
    { allocationCode: "ALC-ADB-002", licenseId: createdLicenses[8].id, employeeId: employees["EMP-006"].id, deviceId: devices["AST-MBP-14-02"].id, allocatedDate: new Date("2024-07-20"), status: "ACTIVE" as const, allocatedBy: "Marcus Chen" },

    // Snowflake Enterprise Allocations
    { allocationCode: "ALC-SNOW-001", licenseId: createdLicenses[9].id, employeeId: employees["EMP-015"].id, deviceId: devices["AST-VM-EC2-01"].id, allocatedDate: new Date("2024-09-20"), status: "ACTIVE" as const, allocatedBy: "Priya Sharma" },
    { allocationCode: "ALC-SNOW-002", licenseId: createdLicenses[9].id, employeeId: employees["EMP-016"].id, deviceId: devices["AST-MBP-16-04"].id, allocatedDate: new Date("2024-09-20"), status: "ACTIVE" as const, allocatedBy: "Priya Sharma" },

    // Docker Business Allocations
    { allocationCode: "ALC-DCK-001", licenseId: createdLicenses[10].id, employeeId: employees["EMP-002"].id, deviceId: devices["AST-MBP-16-02"].id, allocatedDate: new Date("2024-10-05"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
    { allocationCode: "ALC-DCK-002", licenseId: createdLicenses[10].id, employeeId: employees["EMP-003"].id, deviceId: devices["AST-WRK-DELL-01"].id, allocatedDate: new Date("2024-10-05"), status: "ACTIVE" as const, allocatedBy: "Maya Lin" },
  ]
  for (const alc of allocationsData) {
    await prisma.licenseAllocation.create({ data: alc })
  }

  // 10. Renewal Logs
  console.log("📜 Logging historical contract extensions and renewals...")
  await prisma.renewalLog.create({
    data: {
      licenseId: createdLicenses[0].id, // Figma
      renewalDate: new Date("2024-11-15"),
      nextExpiryDate: inDays(18),
      renewalCost: 37440.00,
      invoiceNo: "RNW-FIG-2024-1082",
      approvedBy: "Rachel Green",
      notes: "Annual renewal for 100 enterprise organization seats across design and frontend teams.",
    },
  })
  await prisma.renewalLog.create({
    data: {
      licenseId: createdLicenses[1].id, // GitHub
      renewalDate: new Date("2024-12-01"),
      nextExpiryDate: inDays(110),
      renewalCost: 37800.00,
      invoiceNo: "RNW-GH-2024-9931",
      approvedBy: "Elena Rostova",
      notes: "GitHub Enterprise Cloud multi-org agreement including Advanced Security and Copilot seats.",
    },
  })
  await prisma.renewalLog.create({
    data: {
      licenseId: createdLicenses[5].id, // CrowdStrike
      renewalDate: new Date("2024-10-20"),
      nextExpiryDate: inDays(26),
      renewalCost: 84000.00,
      invoiceNo: "RNW-CS-2024-3391",
      approvedBy: "David Vance",
      notes: "Annual master security agreement covering 300 endpoint agents, cloud workload protection, and Falcon Complete MDR.",
    },
  })

  // 11. Audit Records
  console.log("🛡️ Generating compliance and governance audit inspections...")
  await prisma.auditRecord.create({
    data: {
      auditDate: new Date("2025-02-18"),
      auditorName: "Internal IT Governance & InfoSec",
      licenseId: createdLicenses[3].id, // Slack
      totalLicensesAudited: 11,
      overAllocatedCount: 0,
      complianceStatus: "AT_RISK" as const,
      findings: "Slack Enterprise Grid has hit 100% capacity saturation (200/200 seats). Onboarding new personnel is temporarily blocked.",
      actionTaken: "Approved requisition with Procurement Director Rachel Green to purchase 30 additional buffer seats.",
    },
  })
  await prisma.auditRecord.create({
    data: {
      auditDate: new Date("2025-03-01"),
      auditorName: "External SOC 2 Compliance Assessor",
      licenseId: createdLicenses[5].id, // CrowdStrike
      totalLicensesAudited: 11,
      overAllocatedCount: 0,
      complianceStatus: "COMPLIANT" as const,
      findings: "Endpoint security coverage verified: all corporate laptops, desktops, and production servers have active Falcon agents bound.",
      actionTaken: "Certified SOC 2 Type II compliant with zero unmanaged endpoints.",
    },
  })
  await prisma.auditRecord.create({
    data: {
      auditDate: new Date("2025-03-15"),
      auditorName: "Financial Spend & License Utilization Committee",
      licenseId: createdLicenses[0].id, // Figma
      totalLicensesAudited: 11,
      overAllocatedCount: 0,
      complianceStatus: "COMPLIANT" as const,
      findings: "Figma Enterprise seat utilization healthy at 94% saturation (94/100 seats). Contract renewal approaching in under 3 weeks.",
      actionTaken: "Dispatched automated renewal notifications to Procurement and Design leadership.",
    },
  })

  console.log("🎉 Enterprise dataset successfully seeded into MySQL `licentra_db`!")
  console.log("   • 6 Departments")
  console.log("   • 16 Employees")
  console.log("   • 16 Workstations & Servers")
  console.log("   • 11 Strategic/Preferred Vendors")
  console.log("   • 11 Software Products")
  console.log("   • 11 Active & Expiring Licenses")
  console.log("   • 31 Seat Allocations")
  console.log("   • 3 Renewal Logs")
  console.log("   • 3 Audit Records")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
