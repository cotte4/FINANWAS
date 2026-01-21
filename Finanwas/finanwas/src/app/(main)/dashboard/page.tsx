'use client'

import * as React from "react"
import { useUser } from '@/contexts/UserContext'
import { PageHeader } from "@/components/ui/PageHeader"
import { PortfolioWidget } from "@/components/dashboard/PortfolioWidget"
import { LearningWidget } from "@/components/dashboard/LearningWidget"
import { GoalsWidget } from "@/components/dashboard/GoalsWidget"
import { TipWidget } from "@/components/dashboard/TipWidget"
import { ProfileBanner } from "@/components/dashboard/ProfileBanner"
import { NewsFeedWidget } from "@/components/dashboard/NewsFeedWidget"

/**
 * Dashboard Page
 * Main landing page after login with overview widgets
 *
 * Features:
 * - US-050: Tip of the Day Widget
 * - US-084: Portfolio Summary Widget
 * - US-085: Learning Progress Widget
 * - US-086: Goals Progress Widget
 * - US-087: Profile Completion Banner
 * - News Feed Widget: Personalized financial news
 */
export default function DashboardPage() {
  const { user } = useUser()

  // Get questionnaire completion status from user context
  const questionnaireCompleted = user.questionnaireCompleted ?? false

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      <PageHeader
        title={`Bienvenido, ${user.name}`}
        description="Aquí tienes un resumen de tu actividad financiera"
      />

      {/* Profile Completion Banner - US-087 */}
      <ProfileBanner questionnaireCompleted={questionnaireCompleted} />

      {/* Dashboard Widgets Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tip of the Day Widget - US-050 */}
        <TipWidget />

        {/* Portfolio Widget - US-084 */}
        <PortfolioWidget />

        {/* Learning Widget - US-085 */}
        <LearningWidget />

        {/* News Feed Widget */}
        <NewsFeedWidget className="md:col-span-2" />

        {/* Goals Widget - US-086 */}
        <GoalsWidget className="md:col-span-2" />
      </div>
    </div>
  )
}
