"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasUnread, setHasUnread] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { onAuthChange } = await import("../../lib/auth")
        const unsubscribe = onAuthChange((currentUser) => {
          setUser(currentUser)
          setLoading(false)
        })
        return () => unsubscribe()
      } catch {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (!user) {
      setHasUnread(false)
      return
    }

    let mounted = true
    let unsubs: any[] = []

    const getSeenKey = (uid: string, tripId: string) =>
      `cc_seen_${uid}_${tripId}`

    const getLastSeen = (uid: string, tripId: string) => {
      try {
        const raw = localStorage.getItem(getSeenKey(uid, tripId))
        return raw ? Number(raw) : 0
      } catch {
        return 0
      }
    }

    async function initUnread() {
      try {
        const {
          getUserTrips,
          getUserOrders,
          listenToTripLastMessage,
        } = await import("../../lib/db")

        const postedTrips = await getUserTrips(user.uid)
        const bookedOrders = await getUserOrders(user.uid)
        const trips = [...postedTrips, ...bookedOrders].filter(
          (t) => t.status === "booked"
        )

        const uniqueTripIds = Array.from(new Set(trips.map((t) => t.id)))

        unsubs = uniqueTripIds.map((tripId) =>
          listenToTripLastMessage(tripId, (msg) => {
            if (!mounted || !msg || msg.senderUid === user.uid) return
            const lastSeen = getLastSeen(user.uid, tripId)
            const msgTime = new Date(msg.sentAt).getTime()
            if (msgTime > lastSeen) setHasUnread(true)
          })
        )
      } catch {}
    }

    initUnread()
    return () => {
      mounted = false
      unsubs.forEach((u) => u && u())
    }
  }, [user])

  const handleLogout = async () => {
    const { logOut } = await import("../../lib/auth")
    await logOut()
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-[2px]">
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="CarryConnect"
                  width={20}
                  height={20}
                />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CarryConnect
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              ["Find a Carrier", "/find-a-carrier"],
              ["Add Trip", "/add-trip"],
              user && ["My Trips", "/my-trips"],
              user && ["My Orders", "/my-orders"],
            ]
              .filter(Boolean)
              .map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition"
                >
                  {label}
                </Link>
              ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <i className="fa-solid fa-search"></i>
            </button>

            {user && (
              <Link
                href="/messages"
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <i className="fa-regular fa-comments"></i>
                {hasUnread && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Link>
            )}

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <i className="fa-regular fa-user"></i>
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              !loading && (
                <Link
                  href="/auth"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Login / Sign Up
                </Link>
              )
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <i
              className={`fa-solid ${
                isMobileMenuOpen ? "fa-xmark" : "fa-bars"
              } text-lg`}
            ></i>
          </button>
        </div>
      </div>
    </nav>
  )
}
