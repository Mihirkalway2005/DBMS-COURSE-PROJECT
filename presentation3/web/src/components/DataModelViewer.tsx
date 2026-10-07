import React from "react"
import { Database, Table, ShieldCheck } from "lucide-react"

export function DataModelViewer() {
  const tables = [
    { name: "vendors", desc: "Software publishers", cols: "vendor_code, name, contact_email, tier" },
    { name: "software", desc: "Catalog items", cols: "software_code, name, category, vendor_id" },
    { name: "licenses", desc: "Contracts & seats", cols: "license_key, seats, allocated, unit_cost, total_cost, expiry" },
    { name: "license_allocations", desc: "Seat assignments", cols: "allocation_code, license_id, employee_id, device_id, date" },
    { name: "renewal_logs", desc: "Renewal records", cols: "license_id, renewal_date, next_expiry, renewal_cost, invoice_no" },
    { name: "audit_records", desc: "Compliance audits", cols: "audit_date, auditor_name, compliance_status, findings" },
    { name: "employees", desc: "Team members", cols: "emp_code, full_name, email, department" },
    { name: "devices", desc: "Hardware assets", cols: "asset_tag, device_name, device_type, employee_id" },
  ]

  return (
    <div className="data-model-viewer-view">
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#334155" }}>
          Relational Schema (3NF)
        </h2>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
          Clean Third Normal Form schema enforcing foreign key cascades and seat constraints.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {tables.map((t) => (
          <div key={t.name} className="schema-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <strong style={{ fontSize: 14, color: "#334155", fontFamily: "DM Mono" }}>{t.name}</strong>
              <small style={{ color: "#059669", fontWeight: 700, fontSize: 11 }}>3NF Table</small>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748B" }}>{t.desc}</p>
            <div style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: 6, fontSize: 11.5, fontFamily: "DM Mono", color: "#475569" }}>
              {t.cols}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
