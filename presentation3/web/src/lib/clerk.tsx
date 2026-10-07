"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/clerk-react"
import { KeyRound, Shield, User, LogIn, ExternalLink, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"

const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  ""

export const isClerkConfigured = Boolean(
  CLERK_PUBLISHABLE_KEY &&
  CLERK_PUBLISHABLE_KEY.trim() !== "" &&
  !CLERK_PUBLISHABLE_KEY.includes("your_clerk_publishable_key") &&
  (CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") || CLERK_PUBLISHABLE_KEY.startsWith("pk_live_"))
)

// Fallback context for demo/setup mode when key is not yet configured in .env
type DemoAuthContextType = {
  isConfigured: boolean
  user: {
    fullName: string
    primaryEmailAddress: { emailAddress: string }
    imageUrl?: string
    role: string
  }
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  isConfigured: false,
  user: {
    fullName: "Maya Chen",
    primaryEmailAddress: { emailAddress: "maya.chen@acme-corp.internal" },
    role: "IT Administrator",
  },
})

// Provider component that wraps the app with real Clerk or fallback demo mode
export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  if (isClerkConfigured && CLERK_PUBLISHABLE_KEY) {
    return (
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        afterSignOutUrl="/"
      >
        {children}
      </ClerkProvider>
    )
  }

  // Graceful Demo provider if Clerk publishable key has not been added yet
  return (
    <DemoAuthContext.Provider
      value={{
        isConfigured: false,
        user: {
          fullName: "Maya Chen",
          primaryEmailAddress: { emailAddress: "maya.chen@acme-corp.internal" },
          role: "IT Administrator",
        },
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  )
}

// User Profile widget for the Topbar
export function TopbarAuthButton({ onOpenEnvModal }: { onOpenEnvModal?: () => void }) {
  if (isClerkConfigured) {
    return (
      <div className="flex items-center gap-2">
        <SignedIn>
          <div className="flex items-center gap-2.5 pl-2 py-1 pr-1 rounded-full border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm">
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              <CurrentUserName />
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full ring-2 ring-violet-500/30",
                },
              }}
            />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-all">
              <LogIn size={14} />
              Sign in with Clerk
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    )
  }

  return (
    <button
      onClick={onOpenEnvModal}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
      title="Click to configure Clerk credentials"
    >
      <KeyRound size={13} className="text-amber-400" />
      <span>Clerk Demo Mode</span>
    </button>
  )
}

function CurrentUserName() {
  const { user } = useUser()
  return <span>{user?.firstName || user?.fullName || "User"}</span>
}

// Sidebar Profile Row
export function SidebarAuthProfile({ onOpenEnvModal }: { onOpenEnvModal?: () => void }) {
  if (isClerkConfigured) {
    return (
      <div className="sidebar-auth-wrapper">
        <SignedIn>
          <ClerkLiveSidebarUser />
        </SignedIn>
        <SignedOut>
          <div className="user-row p-3 rounded-xl border border-slate-700/40 bg-slate-900/40">
            <div className="flex flex-col gap-2 w-full">
              <span className="text-xs text-slate-400">Signed out of Licentra</span>
              <SignInButton mode="modal">
                <button className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors">
                  <LogIn size={14} /> Sign in
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
      </div>
    )
  }

  // Fallback demo user display
  return (
    <div
      className="user-row cursor-pointer hover:bg-slate-800/50 transition-colors"
      onClick={onOpenEnvModal}
      title="Click to connect real Clerk authentication"
    >
      <span className="user-avatar">MC</span>
      <span>
        <strong className="flex items-center gap-1.5">
          Maya Chen
          <span className="text-[10px] px-1.5 py-0.2 rounded font-normal bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Demo
          </span>
        </strong>
        <small>IT Administrator · Click to setup</small>
      </span>
      <KeyRound size={16} className="text-amber-400/80" />
    </div>
  )
}

function ClerkLiveSidebarUser() {
  const { user } = useUser()
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"

  return (
    <div className="user-row">
      {user?.imageUrl ? (
        <img
          src={user.imageUrl}
          alt={user.fullName || "User"}
          className="user-avatar object-cover"
        />
      ) : (
        <span className="user-avatar">{initials}</span>
      )}
      <span>
        <strong className="truncate max-w-[140px] block">
          {user?.fullName || user?.primaryEmailAddress?.emailAddress || "Admin User"}
        </strong>
        <small className="truncate max-w-[140px] block text-emerald-400">
          Clerk Active · {user?.primaryEmailAddress?.emailAddress || "Verified"}
        </small>
      </span>
      <UserButton />
    </div>
  )
}
