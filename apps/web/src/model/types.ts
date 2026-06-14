export type CaseStage =
  | 'intake'
  | 'document_review'
  | 'verification'
  | 'credit'
  | 'compliance'
  | 'decision'
  | 'closed'

export type CaseStatus = 'open' | 'in_progress' | 'exception' | 'approved' | 'rejected' | 'referred'

export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH'

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
}

export type CaseFilter = {
  query?: string
  stage?: CaseStage | 'all'
}
