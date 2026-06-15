import type { CaseFilter, CaseStage, LoanCase } from './types'

export const stageSequence: Array<{ id: CaseStage; label: string; actor: string }> = [
  { id: 'intake', label: 'Intake', actor: 'DocuMind' },
  { id: 'document_review', label: 'Document Review', actor: 'Action Center' },
  { id: 'verification', label: 'Verification', actor: 'DocValidatorRPA' },
  { id: 'credit', label: 'Credit', actor: 'CreditSage' },
  { id: 'compliance', label: 'Compliance', actor: 'ComplianceGuard' },
  { id: 'decision', label: 'Decision', actor: 'DecisionPilot + Human' },
  { id: 'exception', label: 'Exception', actor: 'ExceptionHandler' },
  { id: 'closed', label: 'Closed', actor: 'Audit trail' },
]

export function buildDashboardMetrics(cases: LoanCase[]) {
  return {
    activeCases: cases.filter((item) => ['in_progress', 'exception', 'awaiting_human'].includes(item.status)).length,
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

export function mapBackendCase(item: import('./types').BackendCase): LoanCase {
  return {
    id: item.id.slice(0, 8).toUpperCase(),
    backendId: item.id,
    applicantName: item.applicant_name,
    loanType: item.loan_type.replace('_', ' '),
    amount: item.loan_amount,
    stage: item.current_stage,
    status: item.case_status,
    riskBand: String(item.credit?.risk_band ?? 'UNKNOWN') as LoanCase['riskBand'],
    assignedTo: item.case_status === 'awaiting_human' ? 'Action Center' : 'FinFlow agents',
    sla: item.case_status === 'closed' ? 'done' : 'live',
    updated: new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    needsHumanApproval: item.case_status === 'awaiting_human',
    hasException: item.exceptions.length > 0 || item.case_status === 'exception',
    recommendation: String(item.decision?.recommendation ?? ''),
    creditScore: item.bureau_score,
    compliancePassed: item.compliance?.passed as boolean | undefined,
  }
}
