import React, { useState, useEffect } from "react"
import { Building2, Mail, Phone } from "lucide-react"
import { fetchVendors } from "../lib/db"

export function VendorsCatalog() {
  const [vendors, setVendors] = useState<any[]>([])

  useEffect(() => {
    fetchVendors().then(setVendors).catch(console.error)
  }, [])

  return (
    <div className="vendors-catalog-view">
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#334155" }}>
          Publishers & Vendors ({vendors.length})
        </h2>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
          Software partners and product catalogs.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {vendors.map((v) => (
          <div
            key={v.id}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ fontSize: 15, color: "#334155" }}>{v.name}</strong>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: v.tier === "STRATEGIC" ? "#FEF3C7" : "#F1F5F9",
                  color: v.tier === "STRATEGIC" ? "#B45309" : "#475569",
                }}
              >
                {v.tier}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#64748B", display: "flex", flexDirection: "column", gap: 4 }}>
              {v.contactEmail && <span>{v.contactEmail}</span>}
              {v.supportPhone && <span>{v.supportPhone}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
