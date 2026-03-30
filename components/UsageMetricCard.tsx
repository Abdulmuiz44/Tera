'use client'

import type { UsageMetricSummary } from '@/lib/profile-usage'

function formatUsageValue(value: number | 'unlimited') {
  return value === 'unlimited' ? 'Unlimited' : value.toLocaleString()
}

function formatResetLabel(resetAt: string | null) {
  if (!resetAt) return 'Reset time unavailable'

  const date = new Date(resetAt)
  return `Resets ${date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`
}

export default function UsageMetricCard({
  title,
  metric,
  accentClassName = 'bg-tera-neon',
  description,
}: {
  title: string
  metric: UsageMetricSummary
  accentClassName?: string
  description?: string
}) {
  const remainingLabel = metric.isUnlimited
    ? 'Unlimited access'
    : `${Math.round(metric.percentageRemaining)}% remaining`

  return (
    <div className="tera-card h-full">
      <div className="flex h-full flex-col justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-tera-secondary">{title}</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-tera-primary">{remainingLabel}</p>
          <p className="mt-3 text-sm text-tera-secondary">
            Used: <span className="text-tera-primary">{metric.used.toLocaleString()}</span>
            {!metric.isUnlimited && (
              <>
                {' '}
                of <span className="text-tera-primary">{formatUsageValue(metric.limit)}</span>
              </>
            )}
          </p>
        </div>

        <div>
          <div className="h-4 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className={`h-full rounded-full ${accentClassName}`}
              style={{ width: `${metric.isUnlimited ? 100 : Math.max(metric.percentageRemaining, 6)}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-sm text-tera-secondary">
            <span>{metric.isUnlimited ? 'Unlimited plan' : `${formatUsageValue(metric.remaining)} left`}</span>
            <span>{formatResetLabel(metric.resetAt)}</span>
          </div>
          {description && <p className="mt-3 text-sm text-tera-secondary">{description}</p>}
        </div>
      </div>
    </div>
  )
}
