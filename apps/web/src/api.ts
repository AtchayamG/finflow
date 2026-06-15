import type { BackendCase } from './model/types'

export const apiBase = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8781'

export type BackendEvent = {
  event_type: string
  stage: string
  actor: string
  message: string
  timestamp: string
}

export type AnalyticsSummary = {
  total_cases: number
  in_progress: number
  awaiting_human: number
  exceptions: number
  approved: number
  rejected: number
  referred: number
  average_risk_score: number
  stage_counts: Record<string, number>
}

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`)
  if (!response.ok) throw new Error(`GET ${path} failed`)
  return response.json()
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`POST ${path} failed`)
  return response.json()
}

export function listCases() {
  return getJson<BackendCase[]>('/cases')
}

export function getEvents(caseId: string) {
  return getJson<BackendEvent[]>(`/cases/${caseId}/events`)
}

export function getAnalytics() {
  return getJson<AnalyticsSummary>('/analytics/summary')
}

export function getExceptions() {
  return getJson<Array<Record<string, unknown>>>('/exceptions')
}
