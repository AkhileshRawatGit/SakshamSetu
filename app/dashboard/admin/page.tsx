"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, CreditCard, Lock, TrendingUp, CheckCircle2, MapPin } from "lucide-react"
import Link from "next/link"
import { apiGet } from "@/lib/api"
import { getUser } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"
import type { PwdMapData } from "@/components/pwd-map"

// Dynamically import the map to avoid SSR issues
const PwdMap = dynamic(() => import("@/components/pwd-map"), { ssr: false })

interface Analytics {
  users: {
    total: number
    pwd: number
    donor: number
    verifiedPwD: number
  }
  requests: {
    total: number
    pending: number
    approved: number
    delivered: number
    verified: number
  }
  supports: {
    total: number
    active: number
    completed: number
  }
  payments: {
    total: number
    revenue: number
  }
  distribution?: {
    byRegion?: Array<{ _id: string; count: number }>
    byDeviceType?: Array<{ _id: string; count: number }>
  }
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mapData, setMapData] = useState<PwdMapData[]>([])
  const [selectedRegion, setSelectedRegion] = useState("All")

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    fetchAnalytics()
    fetchPwdMap()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await apiGet<{
        success: boolean
        data: Analytics
      }>("/admin/analytics")
      if (response.success && response.data) {
        setAnalytics(response.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPwdMap = async () => {
    try {
      const response = await apiGet<{
        success: boolean
        data: { mapData: Array<{ region: string; count: number; verified: number; disability: string; aid: string }>; total: number }
      }>("/admin/pwd-map")
      if (response.success && response.data?.mapData) {
        const pwdMapData: PwdMapData[] = response.data.mapData
          .filter((r) => r.region && r.region !== "Unknown")
          .map((r) => ({
            region: r.region,
            count: r.count,
            aid: r.aid || "Assistive Devices",
            disability: r.disability || "Various",
          }))
        setMapData(pwdMapData)
      }
    } catch (error: any) {
      console.error("Failed to fetch PwD map data:", error)
    }
  }

  const statsCards = analytics
    ? [
        {
          title: "Total PwD Users",
          value: analytics.users.pwd.toString(),
          icon: Users,
          color: "text-blue-600",
          href: "/dashboard/admin/users",
        },
        {
          title: "Active Requests",
          value: analytics.requests.pending.toString(),
          icon: FileText,
          color: "text-green-600",
          href: "/dashboard/admin/requests",
        },
        {
          title: "CSR Donors",
          value: analytics.users.donor.toString(),
          icon: Users,
          color: "text-purple-600",
          href: "/dashboard/admin/users",
        },
        {
          title: "Total Revenue",
          value: `₹${analytics.payments.revenue.toLocaleString()}`,
          icon: CreditCard,
          color: "text-orange-600",
          href: "/dashboard/admin/payments",
        },
        {
          title: "Verified PwDs",
          value: analytics.users.verifiedPwD.toString(),
          icon: Lock,
          color: "text-red-600",
          href: "/dashboard/admin/compliance",
        },
        {
          title: "Verified Devices",
          value: analytics.requests.verified.toString(),
          icon: CheckCircle2,
          color: "text-green-600",
          href: "/dashboard/admin/analytics",
        },
      ]
    : []

  const recentActivities: Array<{ id: number; action: string; desc: string; time: string }> = []

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar role="admin" />
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  const allRegions = ["All", ...mapData.map((d) => d.region)]

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar role="admin" />
      <div className="flex-1 overflow-auto">
        <DashboardHeader userName={user?.name || "Admin"} />

        <main className="p-8 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage all platform activities</p>
          </div>

          {/* Key Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {statsCards.map((stat) => {
              const Icon = stat.icon
              return (
                <Link key={stat.title} href={stat.href}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                        <Icon className={`h-8 w-8 ${stat.color}/30`} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/dashboard/admin/users">
              <Button className="w-full bg-primary hover:bg-primary/90">Manage Users</Button>
            </Link>
            <Link href="/dashboard/admin/requests">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Monitor Requests</Button>
            </Link>
            <Link href="/dashboard/admin/verifications">
              <Button className="w-full bg-green-600 hover:bg-green-700">Verifications</Button>
            </Link>
            <Link href="/dashboard/admin/analytics">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">View Analytics</Button>
            </Link>
          </div>

          {/* PwD Map Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  PwD Distribution Map
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {allRegions.map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedRegion === region
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-primary/10"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Geographic distribution of PwD requests across India. Click a marker for details.
              </p>
            </CardHeader>
            <CardContent>
              {mapData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-muted-foreground gap-3">
                  <MapPin className="h-12 w-12 opacity-30" />
                  <p className="text-sm">No region data available yet. Add PwD requests to see the map.</p>
                </div>
              ) : (
                <>
                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    <span className="text-xs text-muted-foreground font-medium">Density:</span>
                    {[
                      { color: "#16a34a", label: "Low (< 5)" },
                      { color: "#eab308", label: "Moderate (5–9)" },
                      { color: "#f97316", label: "Medium (10–19)" },
                      { color: "#dc2626", label: "High (20+)" },
                    ].map((item) => (
                      <span key={item.label} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ background: item.color }}
                        />
                        {item.label}
                      </span>
                    ))}
                  </div>
                  <PwdMap data={mapData} selectedRegion={selectedRegion} />
                </>
              )}
            </CardContent>
          </Card>

          {/* System Overview & Recent Activities */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="pb-4 border-b last:border-b-0">
                      <p className="font-semibold text-sm text-primary">{activity.action}</p>
                      <p className="text-sm text-muted-foreground mt-1">{activity.desc}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">System Uptime</p>
                    <p className="text-2xl font-bold text-green-600">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Data Violations</p>
                    <p className="text-2xl font-bold text-green-600">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
