"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Calendar, CreditCard, AlertCircle } from "lucide-react"

const currentPlan = {
  name: "Annual Subscription",
  startDate: "2024-01-15",
  expiryDate: "2025-01-15",
  daysRemaining: 98,
  profilesAccessed: 247,
  totalProfiles: "Unlimited",
  status: "Active",
  price: 60000,
}

const paymentHistory = [
  { id: 1, date: "2024-01-15", amount: 60000, plan: "Annual Subscription", status: "Success" },
  { id: 2, date: "2023-01-15", amount: 60000, plan: "Annual Subscription", status: "Success" },
  { id: 3, date: "2022-01-15", amount: 60000, plan: "Annual Subscription", status: "Success" },
  { id: 4, date: "2024-04-10", amount: 4999, plan: "Monthly Add-on", status: "Success" },
]

export default function PlansPayments() {
  const [showRenewalDialog, setShowRenewalDialog] = useState(false)
  const [renewalType, setRenewalType] = useState("same")

  const handleRenewal = () => {
    console.log("[v0] Processing renewal:", renewalType)
    setShowRenewalDialog(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar role="donor" />
      <div className="flex-1 overflow-auto">
        <DashboardHeader userName="My Plans & Payments" />

        <main className="p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Plans & Payments</h1>
            <p className="text-muted-foreground">Manage your subscription and view payment history</p>
          </div>

          {/* Current Plan */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  {currentPlan.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Plan Name</p>
                  <p className="font-bold text-lg">{currentPlan.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Expires In
                  </p>
                  <p className="font-bold text-lg text-accent">{currentPlan.daysRemaining} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Profiles Accessed</p>
                  <p className="font-bold text-lg">
                    {currentPlan.profilesAccessed}/{currentPlan.totalProfiles}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <CreditCard className="h-4 w-4" /> Plan Cost
                  </p>
                  <p className="font-bold text-lg">₹{currentPlan.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Expiry Notice</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your plan expires on {currentPlan.expiryDate}. Renew before expiry to avoid service interruption.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => setShowRenewalDialog(true)} className="bg-accent hover:bg-accent/90">
                  Renew Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History & Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Plan</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-right py-3 px-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{payment.date}</td>
                        <td className="py-3 px-4">{payment.plan}</td>
                        <td className="text-right py-3 px-4 font-semibold">₹{payment.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                            {payment.status}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <Button variant="outline" size="sm">
                            View Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Renewal Dialog */}
        <Dialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renew Your Plan</DialogTitle>
              <DialogDescription>Choose how you'd like to renew your subscription</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  checked={renewalType === "same"}
                  onChange={() => setRenewalType("same")}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold text-sm">Renew Same Plan</p>
                  <p className="text-xs text-muted-foreground">Annual Subscription - ₹60,000</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  checked={renewalType === "upgrade"}
                  onChange={() => setRenewalType("upgrade")}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold text-sm">Upgrade Plan</p>
                  <p className="text-xs text-muted-foreground">Get more features and priority support</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  checked={renewalType === "downgrade"}
                  onChange={() => setRenewalType("downgrade")}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold text-sm">Switch to Monthly</p>
                  <p className="text-xs text-muted-foreground">Monthly Subscription - ₹4,999/month</p>
                </div>
              </label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRenewalDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenewal} className="bg-primary hover:bg-primary/90">
                Confirm Renewal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
