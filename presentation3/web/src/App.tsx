"use client"

import { Component } from "react"
import {
  Boxes,
  Users,
  CalendarClock,
  ShieldCheck,
  Building2,
  Database,
  Plus,
  Command,
  Search,
  Bell,
  Menu,
  Check,
  X,
} from "lucide-react"

import {
  type LicenseRecord,
  type GovernanceOverview,
  INITIAL_DEFAULT_LICENSES,
  fetchLicenses,
  fetchGovernanceOverview,
  createLicense,
  updateLicense,
  deleteLicense,
} from "./lib/db"
import { TopbarAuthButton, SidebarAuthProfile } from "./lib/clerk"
import { IntegrationsModal } from "./components/IntegrationsModal"
import { GovernanceDashboard } from "./components/GovernanceDashboard"
import { LicenseInventoryView } from "./components/LicenseInventoryView"
import { AllocationsManager } from "./components/AllocationsManager"
import { RenewalsManager } from "./components/RenewalsManager"
import { ComplianceInspector } from "./components/ComplianceInspector"
import { DataModelViewer } from "./components/DataModelViewer"
import { VendorsCatalog } from "./components/VendorsCatalog"
import { AddLicenseModal } from "./components/AddLicenseModal"
import { EditLicenseModal } from "./components/EditLicenseModal"

type NavGroup = {
  label: string
  items: Array<{
    label: string
    icon: typeof Boxes
  }>
}

const navGroups: NavGroup[] = [
  {
    label: "Management",
    items: [
      { label: "Overview", icon: Boxes },
      { label: "Licenses", icon: Boxes },
      { label: "Allocations", icon: Users },
      { label: "Renewals", icon: CalendarClock },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Compliance", icon: ShieldCheck },
      { label: "Vendors", icon: Building2 },
      { label: "Relational Schema", icon: Database },
    ],
  },
]

type AppState = {
  active: string
  sidebarOpen: boolean
  notice: string
  addLicenseOpen: boolean
  editingLicense: LicenseRecord | null
  envModalOpen: boolean
  licensesList: LicenseRecord[]
  governanceData: GovernanceOverview | null
  loadingData: boolean
}

export default class App extends Component<object, AppState> {
  state: AppState = {
    active: "Overview",
    sidebarOpen: false,
    notice: "",
    addLicenseOpen: false,
    editingLicense: null,
    envModalOpen: false,
    licensesList: INITIAL_DEFAULT_LICENSES,
    governanceData: null,
    loadingData: false,
  }

  private noticeTimer?: number

  componentDidMount() {
    this.refreshAllData()
  }

  componentWillUnmount() {
    if (this.noticeTimer) window.clearTimeout(this.noticeTimer)
  }

  refreshAllData = async () => {
    this.setState({ loadingData: true })
    try {
      const [licRes, govRes] = await Promise.all([
        fetchLicenses(),
        fetchGovernanceOverview(),
      ])
      this.setState({
        licensesList: licRes.licenses,
        governanceData: govRes,
      })
    } catch (err) {
      console.error(err)
    } finally {
      this.setState({ loadingData: false })
    }
  }

  handleCreateLicense = async (newLicense: any) => {
    try {
      const created = await createLicense(newLicense)
      this.setState({ addLicenseOpen: false })
      this.showNotice(`"${created.name}" created!`)
      await this.refreshAllData()
    } catch (err: any) {
      this.showNotice(`Error: ${err.message}`)
      throw err
    }
  }

  handleUpdateLicense = async (id: number, data: any) => {
    try {
      await updateLicense(id, data)
      this.setState({ editingLicense: null })
      this.showNotice("License updated!")
      await this.refreshAllData()
    } catch (err: any) {
      this.showNotice(`Update error: ${err.message}`)
      throw err
    }
  }

  handleDeleteLicense = async (id: number, name: string) => {
    try {
      await deleteLicense(id)
      this.showNotice(`"${name}" deleted!`)
      await this.refreshAllData()
    } catch (err: any) {
      this.showNotice(`Error deleting: ${err.message}`)
    }
  }

  showNotice = (message: string) => {
    if (this.noticeTimer) window.clearTimeout(this.noticeTimer)
    this.setState({ notice: message })
    this.noticeTimer = window.setTimeout(() => this.setState({ notice: "" }), 2800)
  }

  render() {
    const {
      active,
      sidebarOpen,
      notice,
      addLicenseOpen,
      editingLicense,
      envModalOpen,
      licensesList,
      governanceData,
    } = this.state

    const setActive = (item: string) => this.setState({ active: item, sidebarOpen: false })

    return (
      <div className="app-shell">
        {/* Mobile Scrim */}
        {sidebarOpen && <div className="sidebar-scrim" onClick={() => this.setState({ sidebarOpen: false })} />}

        {/* Clean Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <div className="brand">
            <span className="brand-mark">
              <Command size={18} strokeWidth={2.4} />
            </span>
            <span>Licentra</span>
            <button
              className="icon-button mobile-close"
              onClick={() => this.setState({ sidebarOpen: false })}
            >
              <X size={18} />
            </button>
          </div>

          <div className="workspace-switcher">
            <span className="workspace-avatar">AP</span>
            <span className="workspace-copy">
              <strong>Acme Products</strong>
              <small>License Manager</small>
            </span>
          </div>

          <nav className="nav">
            {navGroups.map((group) => (
              <div className="nav-group" key={group.label}>
                <p className="nav-label">{group.label}</p>
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      className={`nav-item ${active === item.label ? "active" : ""}`}
                      onClick={() => setActive(item.label)}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <SidebarAuthProfile onOpenEnvModal={() => this.setState({ envModalOpen: true })} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <header className="topbar">
            <button
              className="icon-button menu-button"
              onClick={() => this.setState({ sidebarOpen: true })}
            >
              <Menu size={19} />
            </button>

            <div style={{ fontWeight: 700, fontSize: 16, color: "#334155" }}>
              {active}
            </div>

            <div className="topbar-actions">
              <button
                className="sync-state is-connected"
                onClick={() => this.setState({ envModalOpen: true })}
                title="MySQL Status"
              >
                <i />
                <span>MySQL Connected</span>
              </button>

              <TopbarAuthButton onOpenEnvModal={() => this.setState({ envModalOpen: true })} />
            </div>
          </header>

          <div className="content" style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
            {/* View Switching */}
            {active === "Overview" && (
              <GovernanceDashboard
                data={governanceData}
                onNavigate={setActive}
                onOpenRenewalModal={() => setActive("Renewals")}
              />
            )}

            {active === "Licenses" && (
              <LicenseInventoryView
                licenses={licensesList}
                onOpenAddModal={() => this.setState({ addLicenseOpen: true })}
                onOpenEditModal={(lic) => this.setState({ editingLicense: lic })}
                onDelete={this.handleDeleteLicense}
                onShowNotice={this.showNotice}
              />
            )}

            {active === "Allocations" && (
              <AllocationsManager
                licenses={licensesList}
                onRefresh={this.refreshAllData}
                onShowNotice={this.showNotice}
              />
            )}

            {active === "Renewals" && (
              <RenewalsManager
                licenses={licensesList}
                onRefresh={this.refreshAllData}
                onShowNotice={this.showNotice}
              />
            )}

            {active === "Compliance" && (
              <ComplianceInspector
                licenses={licensesList}
                recentAudits={governanceData?.recentAudits || []}
                onRefresh={this.refreshAllData}
                onShowNotice={this.showNotice}
              />
            )}

            {active === "Vendors" && <VendorsCatalog />}

            {active === "Relational Schema" && <DataModelViewer />}
          </div>
        </main>

        {/* Toast Notification */}
        {notice && (
          <div className="toast">
            <span><Check size={16} /></span>
            {notice}
          </div>
        )}

        {/* Add Modal */}
        {addLicenseOpen && (
          <AddLicenseModal
            onClose={() => this.setState({ addLicenseOpen: false })}
            onSubmit={this.handleCreateLicense}
          />
        )}

        {/* Edit Modal */}
        {editingLicense && (
          <EditLicenseModal
            license={editingLicense}
            onClose={() => this.setState({ editingLicense: null })}
            onUpdate={this.handleUpdateLicense}
          />
        )}

        {/* Integrations Modal */}
        <IntegrationsModal
          isOpen={envModalOpen}
          onClose={() => this.setState({ envModalOpen: false })}
          onDatabaseUpdated={this.refreshAllData}
        />
      </div>
    )
  }
}
