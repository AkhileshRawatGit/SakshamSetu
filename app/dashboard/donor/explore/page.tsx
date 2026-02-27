"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Filter, LogIn, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Zap, Package, Gem, Calendar } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"
import { getUser } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface RegionNeed {
  region: string
  deviceType: string
  count: number
  requests: Array<{
    id: string
    aidName: string
    priority: string
    status: string
    createdAt: string
    location?: string
    disabilityType?: string
  }>
}

interface NeedsData {
  needs: Record<string, Record<string, RegionNeed>>
  total: number
}

const oneTimePlans = [
  {
    id: "basic",
    name: "Basic",
    price: 499,
    profiles: 10,
    icon: Zap,
    description: "Perfect for getting started",
    features: ["View 10 verified profiles", "24-hour access", "Basic filters"],
  },
  {
    id: "standard",
    name: "Standard",
    price: 999,
    profiles: 25,
    icon: Package,
    description: "Most popular choice",
    features: ["View 25 verified profiles", "7-day access", "Advanced filters", "Export data"],
  },
  {
    id: "impact",
    name: "Impact",
    price: 1999,
    profiles: 50,
    icon: Gem,
    description: "Maximum reach",
    features: ["View 50 verified profiles", "30-day access", "All features", "Direct contact"],
  },
]

const subscriptionPlans = [
  { id: "monthly", period: "Monthly", price: 4999, duration: "30 days", profiles: "Unlimited" },
  { id: "quarterly", period: "Quarterly", price: 12000, duration: "90 days", profiles: "Unlimited" },
  { id: "annual", period: "Annual", price: 45000, duration: "365 days", profiles: "Unlimited" },
]

interface VerifiedPWD {
  _id: string
  name: string
  location: string
  disabilityType?: string
  udidVerified: boolean
  aid?: string
  requestId?: string
}

export default function ExploreNeeds() {
  const { toast } = useToast()
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [selectedDisability, setSelectedDisability] = useState("All")
  const [selectedAid, setSelectedAid] = useState("All")
  const [needsData, setNeedsData] = useState<NeedsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedNeed, setSelectedNeed] = useState<any>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [paymentStage, setPaymentStage] = useState<"plans" | "gateway" | "success">("plans")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedPlanType, setSelectedPlanType] = useState<"oneTime" | "subscription">("oneTime")
  const [accessGranted, setAccessGranted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [verifiedPWDs, setVerifiedPWDs] = useState<VerifiedPWD[]>([])
  const [supportingPWD, setSupportingPWD] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    fetchNeeds()
  }, [])

  const fetchNeeds = async () => {
    setLoading(true)
    try {
      const response = await apiGet<{
        success: boolean
        data: NeedsData
      }>("/donor/explore")
      if (response.success && response.data) {
        setNeedsData(response.data)
      }
    } catch (error: any) {
      toast({
        title: "Failed to fetch needs",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Flatten needs data for display
  const flattenedNeeds = needsData
    ? Object.entries(needsData.needs).flatMap(([region, deviceTypes]) =>
        Object.entries(deviceTypes).map(([deviceType, data]) => ({
          region,
          deviceType,
          count: data.count,
          aid: deviceType,
          disability: data.requests[0]?.disabilityType || "Various",
        })),
      )
    : []

  const regions = ["All", ...new Set(flattenedNeeds.map((n) => n.region))]
  const disabilities = ["All", ...new Set(flattenedNeeds.map((n) => n.disability))]
  const aidTypes = ["All", ...new Set(flattenedNeeds.map((n) => n.aid))]

  const filteredNeeds = flattenedNeeds.filter((need) => {
    const regionMatch = selectedRegion === "All" || need.region === selectedRegion
    const disabilityMatch = selectedDisability === "All" || need.disability === selectedDisability
    const aidMatch = selectedAid === "All" || need.aid === selectedAid
    return regionMatch && disabilityMatch && aidMatch
  })

  const handleHelpNow = (need: any) => {
    setSelectedNeed(need)
    setPaymentStage("plans")
    setSelectedPlan(null)
    setShowPlanModal(true)
  }

  const handleSelectPlan = (planId: string, planType: "oneTime" | "subscription") => {
    setSelectedPlan(planId)
    setSelectedPlanType(planType)
  }

  const handleProceedToPay = async () => {
    if (!selectedPlan) return

    // Move to gateway stage
    setPaymentStage("gateway")

    try {
      // Find plan details
      let planDetails: { id: string; name: string; price: number } | null = null

      if (selectedPlanType === "oneTime") {
        planDetails = oneTimePlans.find((p) => p.id === selectedPlan) || null
      } else {
        const subPlan = subscriptionPlans.find((p) => p.id === selectedPlan)
        if (subPlan) {
          planDetails = {
            id: subPlan.id,
            name: subPlan.period,
            price: subPlan.price,
          }
        }
      }

      if (!planDetails) {
        throw new Error("Plan not found")
      }

      // Simulate payment processing delay (2.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Process mock payment
      const response = await apiPost<{
        success: boolean
        message: string
        data: any
      }>("/donor/purchase", {
        planId: planDetails.id,
        plan: planDetails.name,
        amount: planDetails.price,
      })

      if (response.success) {
        // Fetch verified PwDs after payment success
        await fetchVerifiedPWDs()

        // Move to success stage
        setPaymentStage("success")
        setAccessGranted(true)

        toast({
          title: "Payment Successful! Verified PwDs unlocked.",
          description: "You now have access to verified beneficiaries.",
        })
      } else {
        throw new Error("Payment failed")
      }
    } catch (error: any) {
      setPaymentStage("plans")
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCloseModal = () => {
    setShowPlanModal(false)
    setPaymentStage("plans")
    setSelectedPlan(null)
    setSelectedNeed(null)
  }

  const fetchVerifiedPWDs = async () => {
    try {
      // Fetch verified PwDs
      const response = await apiGet<{
        success: boolean
        data: { beneficiaries: VerifiedPWD[] }
      }>("/donor/beneficiaries")

      if (response.success && response.data.beneficiaries) {
        // Fetch explore data once to match requests
        let exploreData: NeedsData | null = null
        try {
          const exploreResponse = await apiGet<{
            success: boolean
            data: NeedsData
          }>("/donor/explore")
          if (exploreResponse.success) {
            exploreData = exploreResponse.data
          }
        } catch (err) {
          console.error("Error fetching explore data:", err)
        }

        // Match with requests to get aid information
        const pwdWithAids = response.data.beneficiaries.map((pwd) => {
          let requestId: string | undefined
          let aid: string | undefined

          if (exploreData?.needs) {
            Object.values(exploreData.needs).forEach((regionData: any) => {
              Object.values(regionData).forEach((deviceData: any) => {
                if (deviceData.requests) {
                  deviceData.requests.forEach((req: any) => {
                    // Match by PwD ID or location
                    if (req.requestedBy?._id === pwd._id || req.location === pwd.location) {
                      requestId = req.id || req._id
                      aid = req.aidName || deviceData.deviceType
                    }
                  })
                }
              })
            })
          }

          return { ...pwd, requestId, aid: aid || "Not specified" }
        })

        setVerifiedPWDs(pwdWithAids)
      }
    } catch (error: any) {
      console.error("Failed to fetch verified PwDs:", error)
      toast({
        title: "Failed to load verified PwDs",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleSupportPWD = async (pwd: VerifiedPWD) => {
    if (!pwd.requestId) {
      toast({
        title: "No Request Available",
        description: "This PwD doesn't have an active request yet.",
        variant: "destructive",
      })
      return
    }

    setSupportingPWD(pwd._id)
    try {
      const response = await apiPost<{
        success: boolean
        message: string
        data: any
      }>("/donor/support", {
        requestId: pwd.requestId,
        amount: 0,
        notes: `Supporting ${pwd.name}`,
      })

      if (response.success) {
        toast({
          title: "Support Initiated!",
          description: `You are now supporting ${pwd.name}. They've been added to your beneficiaries list.`,
        })
        // Remove from verified list
        setVerifiedPWDs(verifiedPWDs.filter((p) => p._id !== pwd._id))
      }
    } catch (error: any) {
      toast({
        title: "Support Failed",
        description: error.message || "Failed to initiate support. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSupportingPWD(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar role="donor" />
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar role="donor" />
      <div className="flex-1 overflow-auto">
        <DashboardHeader userName={user?.name || "Explore Needs"} />

        <main className="p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Explore PwD Needs by Region</h1>
              <p className="text-muted-foreground">
                View aggregated data on assistance needs and support verified beneficiaries
              </p>
            </div>
            <Link href="/dashboard/admin">
              <Button
                variant="outline"
                className="border border-gray-300 text-sm hover:bg-gray-100 gap-2 bg-transparent"
              >
                <LogIn className="h-4 w-4" />
                Access Admin Portal
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Filter Insights</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Disability Type</label>
                <select
                  value={selectedDisability}
                  onChange={(e) => setSelectedDisability(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  {disabilities.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Aid Type</label>
                <select
                  value={selectedAid}
                  onChange={(e) => setSelectedAid(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  {aidTypes.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeeds.map((need, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-3xl font-bold text-primary">{need.count}</p>
                    <p className="text-sm text-muted-foreground">PwDs in need</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{need.region}</p>
                    <p className="text-sm text-muted-foreground">{need.disability}</p>
                    <p className="text-sm text-muted-foreground font-medium">{need.aid}</p>
                  </div>
                  <Button onClick={() => handleHelpNow(need)} className="w-full bg-accent hover:bg-accent/90">
                    Help Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNeeds.length === 0 && !loading && (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground">No needs found matching your criteria</p>
              </CardContent>
            </Card>
          )}

          {accessGranted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Verified Beneficiaries</h2>
                <p className="text-muted-foreground">Support PwDs directly through your active access plan</p>
              </div>

              {verifiedPWDs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {verifiedPWDs.map((pwd) => {
                    const initials = pwd.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)
                    return (
                      <Card key={pwd._id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-2xl font-bold text-primary">{initials}</span>
                            </div>
                            {pwd.udidVerified && (
                              <div className="flex items-center gap-1 text-primary">
                                <CheckCircle className="h-5 w-5" />
                                <span className="text-xs font-semibold">Verified</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Name</p>
                              <p className="font-semibold">{pwd.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Region</p>
                              <p className="font-semibold">{pwd.location}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Aid Needed</p>
                              <p className="font-semibold">{pwd.aid || "Not specified"}</p>
                            </div>
                            {pwd.disabilityType && (
                              <div>
                                <p className="text-xs text-muted-foreground">Disability Type</p>
                                <p className="font-semibold">{pwd.disabilityType}</p>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => handleSupportPWD(pwd)}
                            className="w-full bg-[#FF5E4B] hover:bg-[#FF5E4B]/90 text-white"
                            disabled={supportingPWD === pwd._id || !pwd.requestId}
                          >
                            {supportingPWD === pwd._id ? (
                              <>
                                <Spinner className="mr-2 h-4 w-4" />
                                Supporting...
                              </>
                            ) : (
                              "Support Now"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-12 text-center">
                    <p className="text-muted-foreground">No verified PwDs available at the moment.</p>
                    <Link href="/dashboard/donor/beneficiaries">
                      <Button className="mt-4">View All Beneficiaries</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      <Dialog open={showPlanModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg p-6 space-y-6">
          {paymentStage === "plans" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Choose Subscription Plan</DialogTitle>
                <DialogDescription>
                  {selectedNeed?.count} PwDs in {selectedNeed?.region} need {selectedNeed?.aid}
                </DialogDescription>
              </DialogHeader>

              <Tabs 
                value={selectedPlanType === "oneTime" ? "oneTime" : "subscription"} 
                onValueChange={(value) => {
                  setSelectedPlanType(value as "oneTime" | "subscription")
                  setSelectedPlan(null)
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="oneTime">One-Time Access</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                </TabsList>

                <TabsContent value="oneTime" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    {oneTimePlans.map((plan) => {
                      const Icon = plan.icon
                      const isSelected = selectedPlan === plan.id && selectedPlanType === "oneTime"
                      return (
                        <Card
                          key={plan.id}
                          onClick={() => handleSelectPlan(plan.id, "oneTime")}
                          className={`cursor-pointer border transition-all ${
                            isSelected ? "border-[#00A15D] ring-2 ring-[#00A15D]/20" : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Icon className="h-5 w-5 text-primary" />
                              <CardTitle className="text-2xl font-bold">₹{plan.price}</CardTitle>
                            </div>
                            <CardDescription>{plan.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="subscription" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    {subscriptionPlans.map((plan) => {
                      const isSelected = selectedPlan === plan.id && selectedPlanType === "subscription"
                      const priceDisplay = plan.period === "Monthly" 
                        ? `₹${plan.price.toLocaleString()} / month`
                        : plan.period === "Quarterly"
                        ? `₹${plan.price.toLocaleString()} / quarter`
                        : `₹${plan.price.toLocaleString()} / year`
                      return (
                        <Card
                          key={plan.id}
                          onClick={() => handleSelectPlan(plan.id, "subscription")}
                          className={`cursor-pointer border transition-all ${
                            isSelected ? "border-[#00A15D] ring-2 ring-[#00A15D]/20" : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Calendar className="h-5 w-5 text-primary" />
                              <CardTitle className="text-xl font-bold">{priceDisplay}</CardTitle>
                            </div>
                            <CardDescription>Unlimited verified access + impact reports</CardDescription>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleProceedToPay}
                disabled={!selectedPlan}
                className="w-full mt-6 bg-[#FF5E4B] hover:bg-[#FF5E4B]/90 text-white disabled:opacity-50"
              >
                Proceed to Pay
              </Button>
            </>
          )}

          {paymentStage === "gateway" && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-[#00A15D]" />
              <p className="mt-4 text-gray-600">Processing payment securely...</p>
            </div>
          )}

          {paymentStage === "success" && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="h-12 w-12 text-[#00A15D]" />
              <h3 className="mt-3 text-lg font-semibold">Payment Successful!</h3>
              <p className="text-sm text-gray-600 mt-1">Access to verified PwDs granted.</p>
              <Button onClick={handleCloseModal} className="mt-4 bg-[#FF5E4B] hover:bg-[#FF5E4B]/90 text-white">
                Continue
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
