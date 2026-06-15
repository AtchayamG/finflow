import type { LoanCase } from './model/types'

export type ExceptionView = {
  id: string
  type: string
  caseId: string
  customer: string
  stage: string
  sla: string
  severity: string
  status: string
  assignee: string
  description: string
}

export type SettingsState = {
  organization: string
  region: string
  currency: string
  timezone: string
  language: string
  toggles: Record<string, boolean>
}

export type ProfileState = {
  name: string
  email: string
  phone: string
  role: string
  prefs: Record<string, boolean>
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number): T[] {
  return rows.slice((page - 1) * pageSize, page * pageSize)
}

export function rowsToCsv(cases: LoanCase[]): string {
  const header = ['Case ID', 'Customer', 'Product', 'Amount', 'Stage', 'Risk', 'SLA', 'Assigned', 'Updated']
  const body = cases.map((item) => [
    item.id,
    item.applicantName,
    item.loanType,
    String(item.amount),
    item.stage,
    item.riskBand,
    item.sla,
    item.assignedTo,
    item.updated,
  ])
  return [header, ...body].map((row) => row.map(csvCell).join(',')).join('\n')
}

export function updateExceptionStatus(rows: ExceptionView[], id: string, status: string): ExceptionView[] {
  return rows.map((row) => row.id === id ? { ...row, status } : row)
}

export function safeLoad<T>(key: string, fallback: T, storage: Storage | undefined = globalThis.localStorage): T {
  try {
    const value = storage?.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

export function safeSave<T>(key: string, value: T, storage: Storage | undefined = globalThis.localStorage): void {
  storage?.setItem(key, JSON.stringify(value))
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}
