"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, TrendingUp } from "lucide-react"

const regionImpactData = [
  { region: "Delhi", beneficiaries: 45, devices: 48, amount: 850000 },
  { region: "Maharashtra", beneficiaries: 38, devices: 40, amount: 720000 },
  { region: "Karnataka", beneficiaries: 35, devices: 38, amount: 680000 },
  { region: "Tamil Nadu", beneficiaries: 22, devices: 28, amount: 490000 },
  { region: "West Bengal", beneficiaries: 16, devices: 18, amount: 360000 },
]

const disabilityImpactData = [
  { name: "Hearing Impairment", beneficiaries: 52, fill: "#00A15D" },
  { name: "Mobility Issues", beneficiaries: 68, fill: "#FF5E4B" },
  { name: "Visual Impairment", beneficiaries: 21, fill: "#4F9BED" },
  { name: "Cognitive Support", beneficiaries: 15, fill: "#FFB839" },
]

const progressData = [
  { stage: "Supported", count: 156, color: "#00A15D" },
  { stage: "Delivered", count: 148, color: "#FF5E4B" },
  { stage: "Verified", count: 142, color: "#4F9BED" },
]

export default function ImpactTracker() {
  const handleDownloadReport = () => {
    console.log("[v0] Downloading impact report PDF")
    // Mock download
    const element = document.createElement("a")
    element.href = "data:text/plain;charset=utf-8,%23SakshamSetu%20CSR%20Impact%20Report"
    element.download = "impact-report.pdf"
    element.click()
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar role="donor" />
      <div className="flex-1 overflow-auto">
        <DashboardHeader userName="Impact Tracker" />

        <main className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Impact Tracker</h1>
              <p className="text-muted-foreground">Visualize your CSR impact across regions</p>
            </div>
            {/* <Button onClick={handleDownloadReport} className="bg-accent hover:bg-accent/90 gap-2">
              <Download className="h-5 w-5" />
              Download Report
            </Button> */}
          </div>

          {/* Progress Stages */}
          <div className="grid md:grid-cols-3 gap-6">
            {progressData.map((stage) => (
              <Card key={stage.stage} className="border-l-4" style={{ borderLeftColor: stage.color }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stage.stage}</p>
                      <p className="text-3xl font-bold" style={{ color: stage.color }}>
                        {stage.count}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Region-wise Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionImpactData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beneficiaries" stackId="a" fill="#00A15D" />
                    <Bar dataKey="devices" stackId="a" fill="#FF5E4B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disability Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={disabilityImpactData} cx="50%" cy="50%" labelLine={false} label dataKey="beneficiaries">
                      {disabilityImpactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Regional Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Region</th>
                      <th className="text-right py-3 px-4 font-semibold">Beneficiaries</th>
                      <th className="text-right py-3 px-4 font-semibold">Devices</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount Utilized</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionImpactData.map((row) => (
                      <tr key={row.region} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{row.region}</td>
                        <td className="text-right py-3 px-4">{row.beneficiaries}</td>
                        <td className="text-right py-3 px-4">{row.devices}</td>
                        <td className="text-right py-3 px-4 font-semibold">₹{row.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
