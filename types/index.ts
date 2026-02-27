export type UserRole = "pwd" | "donor" | "supplier" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface DonationRecord {
  id: string
  amount: number
  category: string
  date: string
  beneficiaries: number
}

export interface Product {
  id: string
  name: string
  category: string
  stock: number
  price: number
  image: string
  description: string
}

export interface Job {
  id: string
  title: string
  company: string
  salary?: string
  type: string
  status: "available" | "applied" | "saved"
}

export interface Article {
  id: string
  title: string
  description: string
  category: string
  icon: string
}
