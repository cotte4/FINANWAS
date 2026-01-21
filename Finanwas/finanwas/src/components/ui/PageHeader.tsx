"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

/**
 * PageHeader Component
 *
 * A consistent page header with title, description, and breadcrumbs.
 * Supports optional actions (e.g., buttons) in the top-right.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Transactions"
 *   description="View and manage your transactions"
 *   breadcrumbs={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Transactions" }
 *   ]}
 *   action={<Button>New Transaction</Button>}
 * />
 * ```
 */

export interface Breadcrumb {
  /** Breadcrumb label */
  label: string
  /** Optional link (if not provided, renders as text) */
  href?: string
}

export interface PageHeaderProps {
  /** Page title */
  title: string | React.ReactNode
  /** Optional page description */
  description?: string | React.ReactNode
  /** Optional breadcrumbs */
  breadcrumbs?: Breadcrumb[]
  /** Optional action element (e.g., button) */
  action?: React.ReactNode
  /** Additional CSS classes for the container */
  className?: string
  /** Additional CSS classes for the title */
  titleClassName?: string
  /** Additional CSS classes for the description */
  descriptionClassName?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  className,
  titleClassName,
  descriptionClassName,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1

              return (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRightIcon
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(isLast && "font-medium text-foreground")}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-1">
          <h1
            className={cn(
              "text-3xl font-bold tracking-tight text-foreground",
              titleClassName
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "text-muted-foreground max-w-2xl",
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  )
}
