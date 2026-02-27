"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Package, Briefcase, CheckCircle, Clock, Truck, Shield, Bell, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { apiGet } from "@/lib/api"
import { getUser } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"

interface PwDRequest {
  _id: string
  deviceType: string
  aidName: string
  status: string
  region?: string
  createdAt: string
}

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export default function PwDDashboard() {
  const [user, setUser] = useState<any>(null)
  const [myRequests, setMyRequests] = useState<PwDRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reqRes, notifRes] = await Promise.allSettled([
        apiGet<{ success: boolean; data: { requests: PwDRequest[] } }>("/pwd/request"),
        apiGet<{ success: boolean; data: { notifications: Notification[] } }>("/pwd/notifications"),
      ])

      if (reqRes.status === "fulfilled" && reqRes.value.success) {
        setMyRequests(reqRes.value.data.requests || [])
      }
      if (notifRes.status === "fulfilled" && notifRes.value.success) {
        setNotifications((notifRes.value.data.notifications || []).slice(0, 5))
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Compute status counts
  const statusCounts = {
    Pending: myRequests.filter((r) => r.status === "Pending").length,
    Approved: myRequests.filter((r) => r.status === "Approved" || r.status === "InProgress").length,
    Delivered: myRequests.filter((r) => r.status === "Delivered").length,
    Verified: myRequests.filter((r) => r.status === "Verified").length,
  }

  const requestCards = [
    { status: "Pending", count: statusCounts.Pending, icon: Clock, color: "text-yellow-500" },
    { status: "Approved", count: statusCounts.Approved, icon: CheckCircle, color: "text-blue-500" },
    { status: "Delivered", count: statusCounts.Delivered, icon: Truck, color: "text-orange-500" },
    { status: "Verified", count: statusCounts.Verified, icon: Shield, color: "text-green-500" },
  ]

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar role="pwd" />
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar role="pwd" />
      <div className="flex-1 overflow-auto">
        <DashboardHeader userName={user?.name || "User"} />

        <main className="p-8 space-y-8">
          {/* Personalized Welcome */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-muted-foreground mt-2">Here's your support summary for today</p>
            </div>
            <Link href="/knowledge-hub">
              <Button variant="outline" className="gap-2 bg-transparent">
                Learn About UDID & Rights
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Request Status Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {requestCards.map((req) => {
              const Icon = req.icon
              return (
                <Card key={req.status}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{req.status}</p>
                        <p className="text-3xl font-bold text-foreground">{req.count}</p>
                      </div>
                      <Icon className={`h-8 w-8 ${req.color}`} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* KPI Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests Submitted</p>
                    <p className="text-2xl font-bold">{myRequests.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {statusCounts.Verified} verified · {statusCounts.Delivered} delivered
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Requests</p>
                    <p className="text-2xl font-bold">{statusCounts.Pending + statusCounts.Approved}</p>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting support or delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/dashboard/pwd/requests">
              <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
                <Package className="h-4 w-4" />
                Request Assistive Device
              </Button>
            </Link>
            <Link href="/dashboard/pwd/status">
              <Button variant="outline" className="w-full gap-2">
                <Clock className="h-4 w-4" />
                View My Requests
              </Button>
            </Link>
          </div>

          {/* Recent Notifications */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Updates
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {notifications.filter((n) => !n.read).length} new
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No notifications yet. Submit a request to get started!
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notif) => (
                  <Card
                    key={notif._id}
                    className={`${!notif.read ? "border-l-4 border-l-primary" : ""}`}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">{notif.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
