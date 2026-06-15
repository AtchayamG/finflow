export type CaseStage =
  | 'intake'
  | 'document_review'
  | 'verification'
  | 'credit'
  | 'compliance'
  | 'decision'
  | 'exception'
  | 'closed'

export type CaseStatus = 'open' | 'in_progress' | 'awaiting_human' | 'exception' | 'approved' | 'rejected' | 'referred' | 'closed'

export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN'

export type LoanCase = {
  id: string
  applicantName: string
  loanType: string
  amount: number
  stage: CaseStage
  status: CaseStatus
  riskBand: RiskBand
  assignedTo: string
  sla: string
  updated: string
  needsHumanApproval: boolean
  hasException: boolean
  backendId?: string
  recommendation?: string
  creditScore?: number
  compliancePassed?: boolean
}

export type CaseFilter = {
  query?: string
  stage?: CaseStage | 'all'
}

export type BackendCase = {
  id: string
  applicant_name: string
  loan_type: string
  loan_amount: number
  current_stage: CaseStage
  case_status: CaseStatus
  updated_at: string
  bureau_score?: number
  credit?: Record<string, unknown>
  compliance?: Record<string, unknown>
  decision?: Record<string, unknown>
  exceptions: Array<Record<string, unknown>>
}
