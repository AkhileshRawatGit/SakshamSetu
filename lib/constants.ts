export const NAVIGATION_ITEMS = {
  pwd: [
    { label: "Dashboard", href: "/dashboard/pwd" },
    { label: "My Profile", href: "/dashboard/pwd/profile" },
    { label: "Schemes", href: "/dashboard/pwd/schemes" },
    // { label: "Knowledge Hub", href: "/knowledge-hub" },
    { label: "Request Assistance", href: "/dashboard/pwd/requests" },
    { label: "My Support Status", href: "/dashboard/pwd/status" },
    { label: "Privacy & Data", href: "/dashboard/pwd/privacy" },
    { label: "Support Chat", href: "/dashboard/pwd/support" },
  ],
  donor: [
    { label: "Dashboard", href: "/dashboard/donor" },
    { label: "Explore Needs", href: "/dashboard/donor/explore" },
    { label: "Beneficiaries", href: "/dashboard/donor/beneficiaries" },
    { label: "Support Status", href: "/dashboard/donor/status" },
    { label: "Impact Tracker", href: "/dashboard/donor/impact" },
    { label: "My Plans & Payments", href: "/dashboard/donor/plans" },
    { label: "Help & Support", href: "/dashboard/donor/support" },
    { label: "Privacy & Policy", href: "/dashboard/donor/privacy" },
  ],
  supplier: [
    { label: "My Products", href: "/dashboard/supplier" },
    { label: "Devices", href: "/dashboard/supplier/devices" },
    { label: "Orders", href: "/dashboard/supplier/orders" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Analytics", href: "/dashboard/admin/analytics" },
    { label: "User Management", href: "/dashboard/admin/users" },
    { label: "Request Monitoring", href: "/dashboard/admin/requests" },
    { label: "Verifications", href: "/dashboard/admin/verifications" },
    { label: "Payments & Transactions", href: "/dashboard/admin/payments" },
    { label: "Privacy & Compliance", href: "/dashboard/admin/compliance" },
    { label: "Notifications", href: "/dashboard/admin/notifications" },
  ],
}

export const ROLES = [
  { value: "pwd", label: "Person with Disability" },
  { value: "donor", label: "CSR Donor" },
  // { value: "supplier", label: "Assistive Device Supplier" },
  { value: "admin", label: "Administrator" },
]

export const KNOWLEDGE_HUB_ARTICLES: Array<{
  id: string
  title: string
  description: string
  category: string
  icon: string
}> = []
