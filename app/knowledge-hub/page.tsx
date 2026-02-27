"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { KNOWLEDGE_HUB_ARTICLES } from "@/lib/constants"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Scale, Briefcase, Search, Building2, Users, Phone } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  scale: <Scale className="h-8 w-8 text-primary" />,
  briefcase: <Briefcase className="h-8 w-8 text-primary" />,
  search: <Search className="h-8 w-8 text-primary" />,
  building2: <Building2 className="h-8 w-8 text-primary" />,
  users: <Users className="h-8 w-8 text-primary" />,
  phone: <Phone className="h-8 w-8 text-primary" />,
}

export default function KnowledgeHub() {
  const [activeTab, setActiveTab] = useState("All")

  const tabs = ["All", "Rights", "Employment", "Support", "Helplines"]

  const filteredArticles =
    activeTab === "All" ? KNOWLEDGE_HUB_ARTICLES : KNOWLEDGE_HUB_ARTICLES.filter((a) => a.category === activeTab)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <h1 className="text-xl font-bold text-primary">SakshamSetu</h1>
          </Link>
          <span className="text-sm text-muted-foreground">Knowledge Hub</span>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance text-foreground">Knowledge Hub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore comprehensive resources designed to empower persons with disabilities with information about their
            rights, employment opportunities, support services, and community helplines.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 pb-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
              >
                <CardContent className="pt-8 space-y-4 flex-1 flex flex-col">
                  {/* Icon */}
                  <div className="flex justify-center">
                    {iconMap[article.icon as string] || <Briefcase className="h-8 w-8 text-primary" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-2 text-center">{article.title}</h3>
                    <p className="text-sm text-muted-foreground text-center">{article.description}</p>
                  </div>

                  {/* Category Badge */}
                  <div className="flex justify-center">
                    <span className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">
                      {article.category}
                    </span>
                  </div>

                  {/* Button */}
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent transition-all"
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground">No articles found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
