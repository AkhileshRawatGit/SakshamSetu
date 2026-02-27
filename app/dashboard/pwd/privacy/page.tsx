"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Lock, Building2 } from "lucide-react"

export default function PrivacyDataSettingsPage() {
  const [dataSharing, setDataSharing] = useState(false)

  const accessLog = [
    { id: 1, organization: "Green Fund CSR", accessDate: "2024-02-20", purpose: "Device Funding" },
    { id: 2, organization: "Tech for All Foundation", accessDate: "2024-02-15", purpose: "Impact Assessment" },
    { id: 3, organization: "Ministry of Social Justice", accessDate: "2024-02-10", purpose: "Scheme Verification" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar role="pwd" />
      <div className="flex-1 overflow-auto">
        <DashboardHeader userName="User" />

        <main className="p-8 max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">Privacy & Data Settings</h1>

          {/* Data Sharing Toggle */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Sharing Consent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Allow data sharing with verified donors</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your data will help donors better understand impact and allocate resources effectively.
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataSharing}
                    onChange={(e) => setDataSharing(e.target.checked)}
                    className="w-6 h-6 rounded accent-primary"
                    aria-label="Allow data sharing with verified donors"
                  />
                </label>
              </div>
              {dataSharing && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ Data sharing is enabled. Your information helps improve the platform.
                </p>
              )}
              {!dataSharing && (
                <p className="text-sm text-muted-foreground">
                  Data sharing is currently disabled. You can enable it anytime to help donors understand impact.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Access Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Access Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Organizations that have accessed your data with your consent:
              </p>
              <div className="space-y-3">
                {accessLog.map((log) => (
                  <div key={log.id} className="p-4 border border-input rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{log.organization}</p>
                        <p className="text-sm text-muted-foreground mt-1">Purpose: {log.purpose}</p>
                        <p className="text-xs text-muted-foreground mt-1">Accessed: {log.accessDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
