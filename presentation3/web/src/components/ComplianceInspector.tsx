import React, { useState } from "react"
import {
  ShieldCheck,
  Play,
  Download,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { runComplianceAudit, type LicenseRecord } from "../lib/db"

type ComplianceInspectorProps = {
  licenses: LicenseRecord[]
  recentAudits: any[]
  onRefresh: () => void
  onShowNotice: (msg: string) => void
}

export function ComplianceInspector({
  licenses,
  recentAudits,
  onRefresh,
  onShowNotice,
}: ComplianceInspectorProps) {
  const [running, setRunning] = useState(false)

  const overAllocated = licenses.filter((l) => l.used > l.seats)
  const saturated = licenses.filter((l) => l.used === l.seats)

  const handleRunAudit = async () => {
    setRunning(true)
    try {
      await runComplianceAudit({
        auditorName: "Automated System Check",
        actionTaken: "Compliance scan verified.",
      })
      onShowNotice("Compliance scan complete!")
      onRefresh()
    } catch (err: any) {
      alert(err.message || "Audit run failed.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="compliance-inspector-view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#334155" }}>
            Compliance & Audits
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
            Seat capacity audit and status logs.
          </p>
        </div>
        <button className="primary-button" onClick={handleRunAudit} disabled={running}>
          <Play size={15} /> {running ? "Checking..." : "Run Audit Check"}
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Over-Allocations</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: overAllocated.length > 0 ? "#DC2626" : "#059669", fontFamily: "DM Mono", marginTop: 4 }}>
            {overAllocated.length} Issues
          </div>
          <small style={{ color: "#64748B" }}>Seats exceeding purchased capacity</small>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>100% Saturated</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: saturated.length > 0 ? "#D97706" : "#059669", fontFamily: "DM Mono", marginTop: 4 }}>
            {saturated.length} Licenses
          </div>
          <small style={{ color: "#64748B" }}>Capacity full (0 buffer seats)</small>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="enterprise-table-wrapper">
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2E8F0" }}>
          <strong style={{ fontSize: 14, color: "#334155" }}>Recent Audit Logs ({recentAudits.length})</strong>
        </div>
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Auditor</th>
              <th>Status</th>
              <th>Findings</th>
            </tr>
          </thead>
          <tbody>
            {recentAudits.map((a) => (
              <tr key={a.id}>
                <td style={{ fontSize: 12.5, color: "#475569" }}>
                  {new Date(a.auditDate).toLocaleDateString()}
                </td>
                <td><strong>{a.auditorName}</strong></td>
                <td>
                  <span
                    className={`badge-status-pill ${
                      a.complianceStatus === "COMPLIANT"
                        ? "active"
                        : "pending"
                    }`}
                  >
                    {a.complianceStatus}
                  </span>
                </td>
                <td style={{ fontSize: 12.5, color: "#475569" }}>{a.findings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
