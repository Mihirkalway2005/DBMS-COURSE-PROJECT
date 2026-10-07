import React, { useState } from "react"
import { Pencil, X, ShieldCheck, Check, AlertCircle } from "lucide-react"
import type { LicenseRecord } from "../lib/db"

type EditLicenseModalProps = {
  license: LicenseRecord
  onClose: () => void
  onUpdate: (id: number, data: any) => Promise<void> | void
}

export function EditLicenseModal({
  license,
  onClose,
  onUpdate,
}: EditLicenseModalProps) {
  const [name, setName] = useState(license.name)
  const [seats, setSeats] = useState(license.seats)
  const [totalCost, setTotalCost] = useState(license.totalCostNum || 12000)
  const [status, setStatus] = useState<string>(license.dbStatus || "ACTIVE")
  const [billingCycle, setBillingCycle] = useState(license.billingCycle || "ANNUALLY")
  const [expiryDate, setExpiryDate] = useState(
    license.expiryDate ? new Date(license.expiryDate).toISOString().slice(0, 10) : ""
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unitCost = seats > 0 ? (Number(totalCost) / Number(seats)).toFixed(2) : "0.00"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (seats < license.used) {
      setError(
        `Integrity rule: Cannot reduce seats to ${seats}. There are currently ${license.used} seats allocated. Reclaim seats first.`
      )
      return
    }

    if (Number(totalCost) <= 0) {
      setError("Total cost must be a positive number > 0.")
      return
    }

    setSubmitting(true)
    try {
      await onUpdate(license.id, {
        name,
        seats: Number(seats),
        cost: Number(totalCost),
        status,
        billingCycle,
        expiryDate,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to update license")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal-card add-license-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
            <Pencil size={20} />
          </div>
          <div>
            <span className="modal-eyebrow">EDIT RECORD #{license.id}</span>
            <h2>Modify Software License</h2>
            <p>Update agreement capacity, renewal term, or status in MySQL.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 14,
              color: "#991B1B",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="form-field span-two">
              <span>Software Title</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <div className="form-field">
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Publisher</span>
              <div
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  fontSize: 13,
                  color: "#334155",
                  fontWeight: 600,
                }}
              >
                {license.vendor}
              </div>
            </div>

            <div className="form-field">
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>License Key</span>
              <div
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  fontSize: 11.5,
                  fontFamily: "DM Mono",
                  color: "#334155",
                  fontWeight: 600,
                }}
              >
                {license.licenseKey}
              </div>
            </div>

            <label className="form-field">
              <span>Agreement Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING_RENEWAL">PENDING_RENEWAL</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </label>

            <label className="form-field">
              <span>Billing Cycle</span>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
              >
                <option value="ANNUALLY">ANNUALLY</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="ONE_TIME">ONE_TIME</option>
              </select>
            </label>

            <label className="form-field">
              <span>Total Seats (Current used: {license.used})</span>
              <input
                type="number"
                min={license.used}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                required
              />
            </label>

            <label className="form-field">
              <span>Total Annual Cost ($)</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                required
              />
            </label>

            <div
              className="span-two"
              style={{
                background: "#FAF8F5",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13,
              }}
            >
              <span>Recalculated Unit Cost:</span>
              <strong style={{ fontFamily: "DM Mono", color: "#059669", fontSize: 15 }}>
                ${unitCost} / seat
              </strong>
            </div>

            <label className="form-field span-two">
              <span>Expiration Date</span>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-assist" style={{ marginTop: 14 }}>
            <ShieldCheck size={16} />
            <span>
              Changes immediately update MySQL and propagate to capacity gauges & telemetry.
            </span>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={submitting}>
              <Check size={16} /> {submitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
