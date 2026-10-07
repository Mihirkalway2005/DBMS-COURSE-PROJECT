import React, { useState } from "react"
import {
  CalendarClock,
  CheckCircle2,
} from "lucide-react"
import { logRenewal, type LicenseRecord } from "../lib/db"

type RenewalsManagerProps = {
  licenses: LicenseRecord[]
  onRefresh: () => void
  onShowNotice: (msg: string) => void
}

export function RenewalsManager({
  licenses,
  onRefresh,
  onShowNotice,
}: RenewalsManagerProps) {
  const [selectedLicense, setSelectedLicense] = useState<LicenseRecord | null>(null)
  const [renewalCost, setRenewalCost] = useState("")
  const [nextExpiryDate, setNextExpiryDate] = useState("")
  const [invoiceNo, setInvoiceNo] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenRenewModal = (lic: LicenseRecord) => {
    setSelectedLicense(lic)
    setRenewalCost(String(lic.totalCostNum || 10000))
    const baseDate = lic.expiryDate ? new Date(lic.expiryDate) : new Date()
    const futureDate = new Date(baseDate.getTime() + 365 * 86400000)
    setNextExpiryDate(futureDate.toISOString().slice(0, 10))
    setInvoiceNo(`INV-${Date.now().toString().slice(-4)}`)
    setError(null)
  }

  const handleSubmitRenewal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLicense) return
    setError(null)

    const costNum = Number(renewalCost.replace(/[^0-9.]/g, ""))
    if (costNum <= 0) {
      setError("Renewal cost must be greater than 0.")
      return
    }

    setSubmitting(true)
    try {
      await logRenewal({
        licenseId: selectedLicense.id,
        renewalCost: costNum,
        nextExpiryDate,
        invoiceNo,
        approvedBy: "Procurement Lead",
        notes: `Renewed for ${selectedLicense.seats} seats.`,
      })
      onShowNotice(`Contract for ${selectedLicense.name} renewed!`)
      setSelectedLicense(null)
      onRefresh()
    } catch (err: any) {
      setError(err.message || "Failed to renew.")
    } finally {
      setSubmitting(false)
    }
  }

  // Renewal history
  const allRenewalLogs = licenses.flatMap((lic) =>
    (lic.renewalLogs || []).map((rnw) => ({
      ...rnw,
      softwareName: lic.name,
    }))
  ).sort((a, b) => new Date(b.renewalDate).getTime() - new Date(a.renewalDate).getTime())

  return (
    <div className="renewals-manager-view">
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#334155" }}>
          Contract Renewals
        </h2>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
          Upcoming contract expiration dates and renewal actions.
        </p>
      </div>

      {/* Expiration List */}
      <div className="enterprise-table-wrapper" style={{ marginBottom: 20 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2E8F0" }}>
          <strong style={{ fontSize: 14, color: "#334155" }}>Active Agreements</strong>
        </div>
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Software</th>
              <th>Publisher</th>
              <th>Expiration</th>
              <th>Cost</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((lic) => {
              const exp = lic.expiryDate ? new Date(lic.expiryDate) : new Date()
              const daysLeft = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const isUrgent = daysLeft <= 30

              return (
                <tr key={lic.id}>
                  <td><strong>{lic.name}</strong></td>
                  <td style={{ color: "#64748B" }}>{lic.vendor}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: isUrgent ? "#D97706" : "#334155" }}>
                      {exp.toLocaleDateString()}
                    </span>
                    <small style={{ display: "block", color: isUrgent ? "#D97706" : "#64748B" }}>
                      {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
                    </small>
                  </td>
                  <td style={{ fontFamily: "DM Mono", fontWeight: 700 }}>{lic.cost}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="primary-button"
                      style={{ padding: "4px 10px", fontSize: 12, background: isUrgent ? "#D97706" : "#059669" }}
                      onClick={() => handleOpenRenewModal(lic)}
                    >
                      <CalendarClock size={13} /> Renew
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Executed Renewals */}
      {allRenewalLogs.length > 0 && (
        <div className="enterprise-table-wrapper">
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2E8F0" }}>
            <strong style={{ fontSize: 14, color: "#334155" }}>Renewal History ({allRenewalLogs.length})</strong>
          </div>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Software</th>
                <th>Invoice #</th>
                <th>Cost</th>
                <th>Next Expiry</th>
              </tr>
            </thead>
            <tbody>
              {allRenewalLogs.map((rnw) => (
                <tr key={rnw.id}>
                  <td style={{ fontSize: 12.5, color: "#475569" }}>
                    {new Date(rnw.renewalDate).toLocaleDateString()}
                  </td>
                  <td><strong>{rnw.softwareName}</strong></td>
                  <td style={{ fontFamily: "DM Mono", fontSize: 12 }}>{rnw.invoiceNo}</td>
                  <td style={{ fontFamily: "DM Mono", fontWeight: 700, color: "#059669" }}>
                    ${Number(rnw.renewalCost).toLocaleString()}
                  </td>
                  <td style={{ fontSize: 12.5, color: "#475569" }}>
                    {new Date(rnw.nextExpiryDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedLicense && (
        <div className="modal-backdrop" onMouseDown={() => setSelectedLicense(null)}>
          <div className="modal-card" style={{ maxWidth: 440 }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
                <CalendarClock size={18} />
              </div>
              <div>
                <h2>Renew Agreement</h2>
                <p>{selectedLicense.name}</p>
              </div>
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "8px 12px", borderRadius: 8, marginBottom: 12, color: "#991B1B", fontSize: 12.5 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitRenewal}>
              <div className="form-grid">
                <label className="form-field span-two">
                  <span>Renewal Cost ($)</span>
                  <input
                    type="number"
                    min="1"
                    value={renewalCost}
                    onChange={(e) => setRenewalCost(e.target.value)}
                    required
                  />
                </label>

                <label className="form-field span-two">
                  <span>New Expiration Date</span>
                  <input
                    type="date"
                    value={nextExpiryDate}
                    onChange={(e) => setNextExpiryDate(e.target.value)}
                    required
                  />
                </label>

                <label className="form-field span-two">
                  <span>Invoice #</span>
                  <input
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="modal-footer" style={{ marginTop: 16 }}>
                <button type="button" className="secondary-button" onClick={() => setSelectedLicense(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={submitting}>
                  <CheckCircle2 size={15} /> {submitting ? "Renewing..." : "Confirm Renewal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
