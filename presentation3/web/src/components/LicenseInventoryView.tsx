import React, { useState } from "react"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"
import type { LicenseRecord } from "../lib/db"

type LicenseInventoryViewProps = {
  licenses: LicenseRecord[]
  onOpenAddModal: () => void
  onOpenEditModal: (lic: LicenseRecord) => void
  onDelete: (id: number, name: string) => void
  onShowNotice: (msg: string) => void
}

export function LicenseInventoryView({
  licenses,
  onOpenAddModal,
  onOpenEditModal,
  onDelete,
}: LicenseInventoryViewProps) {
  const [query, setQuery] = useState("")

  const filtered = licenses.filter((lic) => {
    return (
      lic.name.toLowerCase().includes(query.toLowerCase()) ||
      lic.vendor.toLowerCase().includes(query.toLowerCase())
    )
  })

  return (
    <div className="license-inventory-view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#334155" }}>
            Software Licenses ({licenses.length})
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
            Manage contracts, seat counts, and costs.
          </p>
        </div>
        <button className="primary-button" onClick={onOpenAddModal}>
          <Plus size={16} /> Add License
        </button>
      </div>

      <div className="enterprise-table-wrapper">
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="Search software or publisher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent" }}
          />
        </div>

        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Software</th>
              <th>Seats Used</th>
              <th>Annual Cost</th>
              <th>Renewal Date</th>
              <th>Status</th>
              <th style={{ textAlign: "right", width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lic) => {
              const pct = lic.seats > 0 ? Math.round((lic.used / lic.seats) * 100) : 0
              const isFull = lic.used >= lic.seats

              return (
                <tr key={lic.id}>
                  <td>
                    <strong>{lic.name}</strong>
                    <small style={{ display: "block", color: "#64748B", fontSize: 11.5 }}>
                      {lic.vendor}
                    </small>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="gauge-bar" style={{ width: 80 }}>
                        <div
                          className={`gauge-fill ${isFull ? "saturated" : "normal"}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 12.5, fontFamily: "DM Mono" }}>
                        {lic.used}/{lic.seats}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "DM Mono", fontWeight: 700, color: "#334155" }}>
                    {lic.cost}
                  </td>
                  <td style={{ fontSize: 12.5, color: "#475569" }}>
                    {lic.renewal}
                  </td>
                  <td>
                    <span
                      className={`badge-status-pill ${
                        lic.status === "Healthy"
                          ? "active"
                          : lic.status === "Attention"
                          ? "pending"
                          : "expired"
                      }`}
                    >
                      {lic.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                      <button
                        className="secondary-button"
                        style={{ padding: "4px 9px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
                        onClick={() => onOpenEditModal(lic)}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        className="icon-button"
                        style={{ color: "#E11D48", padding: 5 }}
                        title="Delete license"
                        onClick={() => {
                          if (confirm(`Delete "${lic.name}"?`)) {
                            onDelete(lic.id, lic.name)
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748B", fontSize: 13 }}>
            No licenses match "{query}".
          </div>
        )}
      </div>
    </div>
  )
}
