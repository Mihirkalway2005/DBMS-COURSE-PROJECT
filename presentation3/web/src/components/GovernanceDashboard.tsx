import React from "react"
import {
  CircleDollarSign,
  Boxes,
  Gauge,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import type { GovernanceOverview } from "../lib/db"

type GovernanceDashboardProps = {
  data: GovernanceOverview | null
  onNavigate: (view: string) => void
  onOpenRenewalModal: (item?: any) => void
}

export function GovernanceDashboard({
  data,
  onNavigate,
  onOpenRenewalModal,
}: GovernanceDashboardProps) {
  if (!data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
        Loading overview...
      </div>
    )
  }

  const { kpi, radar, vendorSpend } = data

  return (
    <div className="governance-dashboard-container">
      {/* 4 Core KPIs */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Annual Spend</span>
            <div className="kpi-card-icon" style={{ background: "#ECFDF5", color: "#059669" }}>
              <CircleDollarSign size={18} />
            </div>
          </div>
          <div className="kpi-card-value">${(kpi.totalAnnualSpend / 1000).toFixed(1)}k</div>
          <div className="kpi-card-footer">
            <span style={{ color: "#059669", fontWeight: 600 }}>Active</span>
            <span>across {kpi.activeSubscriptions} agreements</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Active Subscriptions</span>
            <div className="kpi-card-icon" style={{ background: "#F0F9FF", color: "#0284C7" }}>
              <Boxes size={18} />
            </div>
          </div>
          <div className="kpi-card-value">{kpi.activeSubscriptions}</div>
          <div className="kpi-card-footer">
            <span>{kpi.totalSeatsPurchased} total seats</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Seat Saturation</span>
            <div className="kpi-card-icon" style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              <Gauge size={18} />
            </div>
          </div>
          <div className="kpi-card-value">{kpi.seatSaturationPct}%</div>
          <div className="kpi-card-footer">
            <span>{kpi.totalSeatsAllocated} / {kpi.totalSeatsPurchased} assigned</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Expiring Soon</span>
            <div className="kpi-card-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-card-value" style={{ color: "#D97706" }}>
            {kpi.renewingIn30DaysCount + kpi.renewingIn60DaysCount}
          </div>
          <div className="kpi-card-footer">
            <span>Renewals in next 60 days</span>
          </div>
        </div>
      </div>

      {/* Renewal Alert (if any) */}
      {radar && radar.length > 0 && (
        <section className="radar-panel" style={{ marginBottom: 20 }}>
          <div className="radar-header">
            <div className="radar-title">
              <Clock size={18} color="#D97706" />
              <span>Upcoming Renewals ({radar.length})</span>
            </div>
            <button
              className="text-button"
              style={{ fontSize: 13, color: "#D97706", fontWeight: 700 }}
              onClick={() => onNavigate("Renewals")}
            >
              View Renewals <ChevronRight size={14} />
            </button>
          </div>
          <div className="radar-grid">
            {radar.map((item) => (
              <div className="radar-card" key={item.id}>
                <div className="radar-card-left">
                  <strong>{item.software}</strong>
                  <small style={{ color: "#64748B" }}>{item.vendor}</small>
                </div>
                <div className="radar-card-right">
                  <span className={`days-tag ${item.urgency === "CRITICAL" ? "critical" : "warning"}`}>
                    {item.daysLeft}d left
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <button
                      className="primary-button"
                      style={{ padding: "3px 8px", fontSize: 11, background: "#D97706" }}
                      onClick={() => onOpenRenewalModal(item)}
                    >
                      Renew
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clean Seat Utilization Table */}
      <div className="enterprise-table-wrapper">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#334155" }}>
              Publisher Seat Utilization
            </h3>
            <small style={{ color: "#64748B" }}>Purchased capacity vs active allocations</small>
          </div>
          <button className="text-button" onClick={() => onNavigate("License inventory")}>
            Full Inventory <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {vendorSpend.map((v) => {
            const pct = v.seats > 0 ? Math.round((v.used / v.seats) * 100) : 0
            const isFull = pct >= 100

            return (
              <div key={v.vendor} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#334155" }}>
                  <strong style={{ fontWeight: 600 }}>{v.vendor}</strong>
                  <span style={{ fontFamily: "DM Mono", fontSize: 12 }}>
                    {v.used} / {v.seats} seats ({pct}%)
                  </span>
                </div>
                <div className="gauge-bar">
                  <div
                    className={`gauge-fill ${isFull ? "saturated" : "normal"}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
