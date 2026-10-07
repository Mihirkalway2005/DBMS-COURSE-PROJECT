import React, { useState, useEffect } from "react"
import {
  UserPlus,
  Trash2,
  Search,
  Laptop,
} from "lucide-react"
import {
  fetchDirectory,
  provisionAllocation,
  revokeAllocation,
  type LicenseRecord,
} from "../lib/db"

type AllocationsManagerProps = {
  licenses: LicenseRecord[]
  onRefresh: () => void
  onShowNotice: (msg: string) => void
}

export function AllocationsManager({
  licenses,
  onRefresh,
  onShowNotice,
}: AllocationsManagerProps) {
  const [employees, setEmployees] = useState<any[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedLicenseId, setSelectedLicenseId] = useState<number>(licenses[0]?.id || 0)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0)
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | "">("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadDirectory()
  }, [])

  const loadDirectory = async () => {
    try {
      const data = await fetchDirectory()
      setEmployees(data.employees || [])
      setDevices(data.devices || [])
      if (data.employees?.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(data.employees[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const allAllocations = licenses.flatMap((lic) =>
    (lic.allocations || []).map((alc) => ({
      ...alc,
      licenseName: lic.name,
      licenseId: lic.id,
    }))
  )

  const filteredAllocations = allAllocations.filter((alc) => {
    const q = search.toLowerCase()
    return (
      alc.employee?.fullName?.toLowerCase().includes(q) ||
      alc.employee?.email?.toLowerCase().includes(q) ||
      alc.licenseName?.toLowerCase().includes(q)
    )
  })

  const selectedLicense = licenses.find((l) => l.id === selectedLicenseId)
  const isFull = selectedLicense ? selectedLicense.used >= selectedLicense.seats : false

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedLicenseId || !selectedEmployeeId) {
      setFormError("Please select both a software license and an employee.")
      return
    }

    if (isFull) {
      setFormError(`Capacity limit: ${selectedLicense?.name} is full (${selectedLicense?.used}/${selectedLicense?.seats}).`)
      return
    }

    setSubmitting(true)
    try {
      await provisionAllocation({
        licenseId: selectedLicenseId,
        employeeId: selectedEmployeeId,
        deviceId: selectedDeviceId ? Number(selectedDeviceId) : null,
        allocatedBy: "IT Administrator",
      })
      onShowNotice("Seat assigned to employee!")
      setModalOpen(false)
      onRefresh()
      loadDirectory()
    } catch (err: any) {
      setFormError(err.message || "Failed to allocate seat.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevoke = async (allocationId: number, name: string) => {
    if (!confirm(`Reclaim seat for ${name}?`)) return
    try {
      await revokeAllocation(allocationId)
      onShowNotice("Seat reclaimed into pool.")
      onRefresh()
    } catch (err: any) {
      alert(err.message || "Failed to revoke seat.")
    }
  }

  return (
    <div className="allocations-manager-view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#334155" }}>
            Seat Allocations ({allAllocations.length})
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
            Assign seats to team members and reclaim unused licenses.
          </p>
        </div>
        <button className="primary-button" onClick={() => setModalOpen(true)}>
          <UserPlus size={16} /> Assign Seat
        </button>
      </div>

      <div className="enterprise-table-wrapper">
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="Search by team member or software..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent" }}
          />
        </div>

        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Team Member</th>
              <th>Assigned Software</th>
              <th>Device</th>
              <th>Date Assigned</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAllocations.map((alc) => {
              const isRevoked = alc.status === "REVOKED"
              return (
                <tr key={alc.id}>
                  <td>
                    <strong>{alc.employee?.fullName || "Employee"}</strong>
                    <small style={{ display: "block", color: "#64748B", fontSize: 11 }}>
                      {alc.employee?.email} · {alc.employee?.department}
                    </small>
                  </td>
                  <td>
                    <strong>{alc.licenseName}</strong>
                  </td>
                  <td>
                    {alc.device ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                        <Laptop size={14} color="#64748B" />
                        <span>{alc.device.deviceName}</span>
                      </div>
                    ) : (
                      <span style={{ color: "#94A3B8", fontSize: 12 }}>Cloud Account</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12.5, color: "#475569" }}>
                    {new Date(alc.allocatedDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge-status-pill ${isRevoked ? "suspended" : "active"}`}>
                      {alc.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {!isRevoked ? (
                      <button
                        className="secondary-button"
                        style={{ padding: "4px 8px", fontSize: 11.5, color: "#E11D48" }}
                        onClick={() => handleRevoke(alc.id, alc.employee?.fullName)}
                      >
                        Reclaim
                      </button>
                    ) : (
                      <small style={{ color: "#94A3B8" }}>Reclaimed</small>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredAllocations.length === 0 && (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748B", fontSize: 13 }}>
            No seat allocations match "{search}".
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 480 }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-icon" style={{ background: "#ECFDF5", color: "#059669" }}>
                <UserPlus size={18} />
              </div>
              <div>
                <h2>Assign Seat</h2>
                <p>Select software and recipient.</p>
              </div>
            </div>

            {formError && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "8px 12px", borderRadius: 8, marginBottom: 12, color: "#991B1B", fontSize: 12.5 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAllocate}>
              <div className="form-grid">
                <label className="form-field span-two">
                  <span>Software</span>
                  <select
                    value={selectedLicenseId}
                    onChange={(e) => setSelectedLicenseId(Number(e.target.value))}
                    required
                  >
                    {licenses.map((l) => (
                      <option key={l.id} value={l.id} disabled={l.used >= l.seats}>
                        {l.name} ({l.used}/{l.seats} used) {l.used >= l.seats ? "· [FULL]" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field span-two">
                  <span>Team Member</span>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.department})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field span-two">
                  <span>Device (Optional)</span>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">No hardware binding</option>
                    {devices.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.deviceName} ({dev.os})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="modal-footer" style={{ marginTop: 16 }}>
                <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={submitting || isFull}>
                  {submitting ? "Assigning..." : "Assign Seat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
