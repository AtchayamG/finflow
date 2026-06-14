import type { CaseFilter, CaseStage, LoanCase } from './types'

export const stageSequence: Array<{ id: CaseStage; label: string; actor: string }> = [
  { id: 'intake', label: 'Intake', actor: 'DocuMind' },
  { id: 'verification', label: 'Verification', actor: 'DocValidatorRPA' },
  { id: 'credit', label: 'Credit', actor: 'CreditSage' },
  { id: 'compliance', label: 'Compliance', actor: 'ComplianceGuard' },
  { id: 'decision', label: 'Decision', actor: 'DecisionPilot + Human' },
  { id: 'closed', label: 'Closed', actor: 'Audit trail' },
]

export function buildDashboardMetrics(cases: LoanCase[]) {
  return {
    activeCases: cases.filter((item) => item.status === 'in_progress' || item.status === 'exception').length,
    exceptions: cases.filter((item) => item.hasException || item.status === 'exception').length,
    humanApprovals: cases.filter((item) => item.needsHumanApproval).length,
    completed: cases.filter((item) => item.stage === 'closed').length,
  }
}

export function filterCases(cases: LoanCase[], filter: CaseFilter): LoanCase[] {
  const query = filter.query?.trim().toLowerCase() ?? ''
  return cases.filter((item) => {
    const matchesQuery = !query || `${item.id} ${item.applicantName} ${item.loanType}`.toLowerCase().includes(query)
    const matchesStage = !filter.stage || filter.stage === 'all' || item.stage === filter.stage
    return matchesQuery && matchesStage
  })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).format(value)
}

export function stageProgress(caseItem: LoanCase): number {
  const index = stageSequence.findIndex((stage) => stage.id === caseItem.stage)
  return index < 0 ? 0 : Math.round((index / (stageSequence.length - 1)) * 100)
}
