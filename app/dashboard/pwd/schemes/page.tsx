"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

const schemesData = [
  {
    id: 1,
    name: "ADIP Scheme",
    provider: "Government of India",
    description: "Assistance to Disabled Persons for purchasing/fitting of aids and appliances",
    benefits: "Up to ₹15,000 for assistive devices",
    eligibility: "PWDs with 40% or more disability",
    documents: ["Disability Certificate", "Income Proof", "Aadhar Card"],
    status: "Eligible",
    amount: "₹15,000",
  },
  {
    id: 2,
    name: "Smart Stick Rehabilitation",
    provider: "Ministry of Social Justice",
    description: "Smart stick and rehabilitation services for visually impaired individuals",
    benefits: "Free smart stick + rehabilitation training",
    eligibility: "Visually impaired persons",
    documents: ["Medical Certificate", "Disability ID", "Address Proof"],
    status: "Applied",
    amount: "Free Device",
  },
  {
    id: 3,
    name: "Cochlear Implant Assistance",
    provider: "State Government",
    description: "Financial assistance for cochlear implant surgery and rehabilitation",
    benefits: "Up to ₹10,00,000 coverage",
    eligibility: "Hearing impaired individuals with income <₹5 lakh",
    documents: ["Medical Reports", "Income Certificate", "Disability Certificate"],
    status: "Not Applied",
    amount: "₹10,00,000",
  },
  {
    id: 4,
    name: "Locomotor Disability Assistance",
    provider: "Government of India",
    description: "Support for mobility aids and accessibility modifications",
    benefits: "Wheelchair, walker, or mobility aid + installation",
    eligibility: "Persons with locomotor disabilities",
    documents: ["Disability Certificate", "Medical Report", "Bank Details"],
    status: "Eligible",
    amount: "₹50,000",
  },
  {
    id: 5,
    name: "Skill Development for PWDs",
    provider: "National Skill Development Corporation",
    description: "Free vocational training and skill development programs",
    benefits: "Training + Job placement assistance",
    eligibility: "All PWDs aged 18-45 years",
    documents: ["Disability Certificate", "Educational Proof", "ID Proof"],
    status: "In Progress",
    amount: "Free Training",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Eligible":
      return "bg-green-100 text-green-800"
    case "Applied":
      return "bg-blue-100 text-blue-800"
    case "In Progress":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function SchemesPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar role="pwd" />
      <div className="flex-1 overflow-auto">
        <DashboardHeader userName="User" />

        <main className="p-8 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Government Schemes & Benefits</h2>
            <p className="text-muted-foreground">
              Discover and apply for schemes specifically designed for persons with disabilities
            </p>
          </div>

          <div className="grid gap-6">
            {schemesData.map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{scheme.name}</h3>
                      <p className="text-sm text-muted-foreground">{scheme.provider}</p>
                    </div>
                    <Badge className={getStatusColor(scheme.status)}>{scheme.status}</Badge>
                  </div>

                  <p className="text-sm text-foreground">{scheme.description}</p>

                  <div className="grid md:grid-cols-2 gap-4 py-4 bg-muted/50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">Benefit Amount</p>
                      <p className="text-lg font-bold text-primary">{scheme.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">Eligibility</p>
                      <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Required Documents
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {scheme.documents.map((doc, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      {scheme.status === "Applied" || scheme.status === "In Progress"
                        ? "View Application"
                        : "Apply Now"}
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
