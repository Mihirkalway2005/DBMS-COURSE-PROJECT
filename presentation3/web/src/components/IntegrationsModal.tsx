import React, { useState, useEffect } from "react"
import {
  X,
  Database,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react"
import {
  testDatabaseConnection,
  seedPrismaDatabase,
  type DbStatus,
} from "../lib/db"
import { isClerkConfigured } from "../lib/clerk"

type IntegrationsModalProps = {
  isOpen: boolean
  onClose: () => void
  onDatabaseUpdated?: () => void
}

export function IntegrationsModal({
  isOpen,
  onClose,
  onDatabaseUpdated,
}: IntegrationsModalProps) {
  const [copied, setCopied] = useState(false)
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null)
  const [testingDb, setTestingDb] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedNotice, setSeedNotice] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      handleTestDb()
    }
  }, [isOpen])

  const handleTestDb = async () => {
    setTestingDb(true)
    setSeedNotice(null)
    try {
      const res = await testDatabaseConnection()
      setDbStatus(res)
    } finally {
      setTestingDb(false)
    }
  }

  const handleInitSchema = async () => {
    setSeeding(true)
    setSeedNotice(null)
    try {
      const res = await seedPrismaDatabase()
      setSeedNotice(res.message)
      await handleTestDb()
      if (onDatabaseUpdated) {
        onDatabaseUpdated()
      }
    } catch (err: unknown) {
      setSeedNotice(err instanceof Error ? err.message : String(err))
    } finally {
      setSeeding(false)
    }
  }

  const copyEnvSnippet = () => {
    const snippet = `# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# PostgreSQL Connection (Neon or local PostgreSQL)
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
VITE_NEON_DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require`
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 14, 23, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onMouseDown={onClose}
    >
      <div
        className="modal-card"
        style={{
          width: "100%",
          maxWidth: "640px",
          background: "linear-gradient(180deg, #161e2e 0%, #0f172a 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          color: "#f8fafc",
          overflow: "hidden",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Layers size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>
                Prisma ORM & PostgreSQL Configuration
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "13px",
                  color: "#94a3b8",
                }}
              >
                Clerk Authentication + Prisma ORM on PostgreSQL (Neon)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          {/* Clerk Status Card */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(30, 41, 59, 0.6)",
              border: `1px solid ${
                isClerkConfigured
                  ? "rgba(16, 185, 129, 0.3)"
                  : "rgba(245, 158, 11, 0.3)"
              }`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(99, 102, 241, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#818cf8",
                  }}
                >
                  <KeyRound size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: "15px", display: "block" }}>
                    Clerk Authentication
                  </strong>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Sign-in, user sessions & RBAC
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontWeight: 500,
                  background: isClerkConfigured
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(245, 158, 11, 0.15)",
                  color: isClerkConfigured ? "#34d399" : "#fbbf24",
                  border: `1px solid ${
                    isClerkConfigured
                      ? "rgba(16, 185, 129, 0.3)"
                      : "rgba(245, 158, 11, 0.3)"
                  }`,
                }}
              >
                {isClerkConfigured ? "Connected" : "Setup Required"}
              </span>
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#cbd5e1",
                lineHeight: "1.5",
                marginTop: "8px",
              }}
            >
              {isClerkConfigured ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#34d399",
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Clerk is active with publishable key.</span>
                </div>
              ) : (
                <div>
                  <p style={{ margin: "0 0 8px" }}>
                    Add your Clerk Publishable Key to{" "}
                    <code
                      style={{
                        background: "#0f172a",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      .env
                    </code>
                    :
                  </p>
                  <code
                    style={{
                      display: "block",
                      padding: "8px 12px",
                      background: "#0f172a",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#93c5fd",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Prisma & PostgreSQL Status Card */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(30, 41, 59, 0.6)",
              border: `1px solid ${
                dbStatus?.connected
                  ? "rgba(16, 185, 129, 0.3)"
                  : "rgba(245, 158, 11, 0.3)"
              }`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(14, 165, 233, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#38bdf8",
                  }}
                >
                  <Database size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: "15px", display: "block" }}>
                    Prisma ORM · PostgreSQL
                  </strong>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Type-safe schema, migrations & auto-generated client
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontWeight: 500,
                  background: dbStatus?.connected
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(245, 158, 11, 0.15)",
                  color: dbStatus?.connected ? "#34d399" : "#fbbf24",
                  border: `1px solid ${
                    dbStatus?.connected
                      ? "rgba(16, 185, 129, 0.3)"
                      : "rgba(245, 158, 11, 0.3)"
                  }`,
                }}
              >
                {dbStatus?.connected
                  ? `Connected (${dbStatus.latencyMs}ms)`
                  : "Setup Required"}
              </span>
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#cbd5e1",
                lineHeight: "1.5",
                marginTop: "8px",
              }}
            >
              {dbStatus?.connected ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#34d399",
                      marginBottom: "6px",
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      Prisma connected to PostgreSQL. Contains{" "}
                      <strong>{dbStatus.counts?.licenses ?? dbStatus.tableCount ?? 0} licenses</strong>.
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "12px",
                    }}
                  >
                    <button
                      onClick={handleTestDb}
                      disabled={testingDb}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#f8fafc",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <RefreshCw
                        size={12}
                        className={testingDb ? "animate-spin" : ""}
                      />
                      Test Connection
                    </button>
                    <button
                      onClick={handleInitSchema}
                      disabled={seeding}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        background: "rgba(14, 165, 233, 0.2)",
                        border: "1px solid rgba(14, 165, 233, 0.4)",
                        color: "#7dd3fc",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Sparkles size={12} />
                      {seeding ? "Seeding Prisma..." : "Seed Prisma Database"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ margin: "0 0 8px" }}>
                    Set your PostgreSQL connection string in{" "}
                    <code
                      style={{
                        background: "#0f172a",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      .env
                    </code>
                    :
                  </p>
                  <code
                    style={{
                      display: "block",
                      padding: "8px 12px",
                      background: "#0f172a",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#93c5fd",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      overflowX: "auto",
                    }}
                  >
                    DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
                  </code>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "10px",
                    }}
                  >
                    <a
                      href="https://console.neon.tech"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: "#38bdf8",
                        textDecoration: "none",
                      }}
                    >
                      Get Neon PostgreSQL URL <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={handleTestDb}
                      disabled={testingDb}
                      style={{
                        padding: "4px 10px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#f8fafc",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <RefreshCw
                        size={12}
                        className={testingDb ? "animate-spin" : ""}
                      />
                      Check status
                    </button>
                  </div>
                </div>
              )}

              {seedNotice && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "rgba(14, 165, 233, 0.15)",
                    border: "1px solid rgba(14, 165, 233, 0.3)",
                    color: "#7dd3fc",
                    fontSize: "12px",
                  }}
                >
                  {seedNotice}
                </div>
              )}
            </div>
          </div>

          {/* Useful CLI Commands */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#080c14",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <Terminal size={14} />
              <span>Prisma CLI Cheatsheet</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                fontSize: "11.5px",
                fontFamily: "monospace",
              }}
            >
              <div
                style={{
                  background: "#0f172a",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                }}
              >
                bun x prisma db push
              </div>
              <div
                style={{
                  background: "#0f172a",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                }}
              >
                bun x prisma studio
              </div>
              <div
                style={{
                  background: "#0f172a",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                }}
              >
                bun run prisma/seed.ts
              </div>
              <div
                style={{
                  background: "#0f172a",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                }}
              >
                bun x prisma generate
              </div>
            </div>
          </div>

          {/* Quick Copy Box */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#0b0f19",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  display: "block",
                }}
              >
                Copy .env Template
              </span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Includes DATABASE_URL and Clerk keys
              </span>
            </div>
            <button
              onClick={copyEnvSnippet}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                background: "rgba(14, 165, 233, 0.2)",
                border: "1px solid rgba(14, 165, 233, 0.4)",
                color: "#7dd3fc",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy .env snippet"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "flex-end",
            background: "rgba(15, 23, 42, 0.5)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              background: "#0ea5e9",
              border: "none",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
