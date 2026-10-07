import React, { useState } from "react"
import { FilePlus2, X, ShieldCheck, Plus, Sparkles } from "lucide-react"
import type { LicenseRecord } from "../lib/db"

type AddLicenseModalProps = {
  onClose: () => void
  onSubmit: (license: any) => Promise<void> | void
}

export function AddLicenseModal({ onClose, onSubmit }: AddLicenseModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [seats, setSeats] = useState(50)
  const [totalCost, setTotalCost] = useState(12000)
  const [error, setError] = useState<string | null>(null)

  const unitCost = seats > 0 ? (totalCost / seats).toFixed(2) : "0.00"

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const data = new FormData(event.currentTarget)
    const software = String(data.get("software") || "New License").trim()
    const vendor = String(data.get("vendor") || "Publisher").trim()
    const model = String(data.get("model") || "SAAS_SUBSCRIPTION")
    const billingCycle = String(data.get("billingCycle") || "ANNUALLY")
    const category = String(data.get("category") || "PRODUCTIVITY")
    const startRaw = String(data.get("start") || "")
    const renewalRaw = String(data.get("renewal") || "")

    if (totalCost <= 0) {
      setError("Integrity constraint error: Total cost must be greater than 0.")
      return
    }

    if (seats <= 0) {
      setError("Integrity constraint error: Seats must be greater than 0.")
      return
    }

    setSubmitting(true)

    const newLic = {
      name: software,
      vendor,
      seats: Number(seats),
      cost: `$${totalCost.toLocaleString()}`,
      unitCost: Number(unitCost),
      type: model,
      billingCycle,
      category,
      purchaseDate: startRaw ? new Date(startRaw) : new Date(),
      expiryDate: renewalRaw ? new Date(renewalRaw) : new Date(Date.now() + 365 * 86400000),
      autoRenew: true,
      status: "Healthy",
    }

    try {
      await onSubmit(newLic)
    } catch (err: any) {
      setError(err.message || "Failed to create license")
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
        aria-labelledby="add-license-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-icon" style={{ background: "#ECFDF5", color: "#059669" }}>
            <FilePlus2 size={20} />
          </div>
          <div>
            <span className="modal-eyebrow">3NF INVENTORY ENTRY</span>
            <h2 id="add-license-title">Add software license</h2>
            <p>Normalized into `vendors`, `software`, and `licenses` tables in MySQL.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "10px 14px", borderRadius: 8, marginBottom: 14, color: "#991B1B", fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="form-field span-two">
              <span>Software title</span>
              <input
                name="software"
                placeholder="e.g. JetBrains IntelliJ IDEA Ultimate"
                autoFocus
                required
              />
            </label>

            <label className="form-field">
              <span>Vendor / Publisher</span>
              <input
                name="vendor"
                placeholder="e.g. JetBrains s.r.o."
                required
              />
            </label>

            <label className="form-field">
              <span>Software Category</span>
              <select name="category" defaultValue="DEV_TOOLS">
                <option value="PRODUCTIVITY">Productivity</option>
                <option value="DEV_TOOLS">Developer Tools</option>
                <option value="SECURITY">Security & IAM</option>
                <option value="CLOUD_INFRA">Cloud Infrastructure</option>
                <option value="DESIGN">Design & Creative</option>
              </select>
            </label>

            <label className="form-field">
              <span>License model</span>
              <select name="model" defaultValue="SAAS_SUBSCRIPTION">
                <option value="SAAS_SUBSCRIPTION">SaaS Subscription</option>
                <option value="SEAT_BASED">Seat-Based License</option>
                <option value="PERPETUAL">Perpetual (One-Time)</option>
                <option value="OEM">OEM Bundled</option>
                <option value="TRIAL">Trial / Proof of Concept</option>
              </select>
            </label>

            <label className="form-field">
              <span>Billing Cycle</span>
              <select name="billingCycle" defaultValue="ANNUALLY">
                <option value="ANNUALLY">Annually</option>
                <option value="MONTHLY">Monthly</option>
                <option value="ONE_TIME">One-Time / Perpetual</option>
              </select>
            </label>

            <label className="form-field">
              <span>Purchased Seats</span>
              <input
                name="seats"
                type="number"
                min="1"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                required
              />
            </label>

            <label className="form-field">
              <span>Total Contract Cost ($)</span>
              <input
                name="cost"
                type="number"
                min="1"
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                required
              />
            </label>

            <div className="span-two" style={{ background: "#FAF8F5", padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
              <span>Calculated Unit Cost:</span>
              <strong style={{ fontFamily: "DM Mono", color: "#059669", fontSize: 15 }}>
                ${unitCost} / seat
              </strong>
            </div>

            <label className="form-field">
              <span>Start date</span>
              <input
                name="start"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </label>

            <label className="form-field">
              <span>Expiration date</span>
              <input
                name="renewal"
                type="date"
                defaultValue={new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)}
                required
              />
            </label>
          </div>

          <div className="form-assist" style={{ marginTop: 14 }}>
            <ShieldCheck size={16} />
            <span>
              Enforces MySQL 3NF integrity constraints, unique license keys, and cascade foreign key bindings.
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
              <Plus size={17} /> {submitting ? "Saving..." : "Add to Inventory"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
