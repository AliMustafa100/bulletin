export type ApplicationStatus =
  | 'not_applied'
  | 'applied'
  | 'awaiting_response'
  | 'interview'
  | 'accepted'
  | 'rejected'

export interface StatusConfig {
  value: ApplicationStatus
  label: string
  hint: string
  tone: 'neutral' | 'info' | 'pending' | 'active' | 'success' | 'danger'
}

export const DEFAULT_STATUS: ApplicationStatus = 'not_applied'

export const APPLICATION_STATUSES: StatusConfig[] = [
  {
    value: 'not_applied',
    label: 'Not Applied',
    hint: "Haven't submitted yet",
    tone: 'neutral',
  },
  {
    value: 'applied',
    label: 'Applied',
    hint: 'Application submitted',
    tone: 'info',
  },
  {
    value: 'awaiting_response',
    label: 'Awaiting Response',
    hint: 'Waiting to hear back',
    tone: 'pending',
  },
  {
    value: 'interview',
    label: 'Interview',
    hint: 'In the interview process',
    tone: 'active',
  },
  {
    value: 'accepted',
    label: 'Accepted',
    hint: 'Offer received',
    tone: 'success',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    hint: 'No longer moving forward',
    tone: 'danger',
  },
]

export function getStatusConfig(status: ApplicationStatus): StatusConfig {
  return (
    APPLICATION_STATUSES.find((s) => s.value === status) ??
    APPLICATION_STATUSES[0]
  )
}

export function normalizeStatus(value: unknown): ApplicationStatus {
  if (
    typeof value === 'string' &&
    APPLICATION_STATUSES.some((s) => s.value === value)
  ) {
    return value as ApplicationStatus
  }
  return DEFAULT_STATUS
}

export function countByStatus(
  applications: { status: ApplicationStatus }[]
): Record<ApplicationStatus, number> {
  const counts = Object.fromEntries(
    APPLICATION_STATUSES.map((s) => [s.value, 0])
  ) as Record<ApplicationStatus, number>

  for (const app of applications) {
    counts[app.status] += 1
  }

  return counts
}
