import {
  AlertTriangle, BarChart3, Bell, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight,
  ClipboardCheck, Clock3, Download, FileCheck2, Filter, LayoutDashboard,
  LockKeyhole, Mail, Moon, MoreVertical, Phone, Search, Settings as SettingsIcon, ShieldCheck,
  Sun, UserRound, Workflow,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { getAnalytics, getEvents, getExceptions, listCases, postJson, type AnalyticsSummary, type BackendEvent } from './api'
import { BarsH } from './components/BarsH'
import { Donut } from './components/Donut'
import { Gauge } from './components/Gauge'
import { Heatmap } from './components/Heatmap'
import { LineTrend } from './components/LineTrend'
import { StatTile } from './components/StatTile'
import { demoCases } from './data/demoCases'
import type { BackendCase, CaseStage, LoanCase } from './model/types'
import { buildDashboardMetrics, filterCases, formatCurrency, mapBackendCase, stageProgress, stageSequence } from './model/workflow'

const screens = ['dashboard', 'cases', 'case-details', 'document-review', 'decision', 'exceptions', 'analytics', 'settings', 'profile'] as const
type Screen = (typeof screens)[number]
const cols = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const heatRows = ['KYC', 'Income', 'Address', 'Credit', 'Document', 'Fraud', 'Policy']

function App() {
  const [authed, setAuthed] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<CaseStage | 'all'>('all')
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState('Mock providers ready')
  const [backendCases, setBackendCases] = useState<BackendCase[]>([])
  const [events, setEvents] = useState<BackendEvent[]>([])
  const [exceptions, setExceptions] = useState<Array<Record<string, unknown>>>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)

  async function refresh(nextId = selectedId) {
    try {
      const [caseRows, summary, exceptionRows] = await Promise.all([listCases(), getAnalytics(), getExceptions()])
      setBackendCases(caseRows); setAnalytics(summary); setExceptions(exceptionRows)
      const target = nextId || caseRows[0]?.id || ''
      setSelectedId(target)
      if (target) setEvents(await getEvents(target))
      setStatus(`Live API synced: ${caseRows.length} case(s)`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Backend unavailable; showing synthetic reference data')
    }
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void refresh() }, [])

  const liveCases = backendCases.map(mapBackendCase)
  const viewCases = useMemo(() => expandCases(liveCases.length ? liveCases : demoCases), [liveCases])
  const cases = useMemo(() => filterCases(viewCases, { query, stage: stageFilter }), [query, stageFilter, viewCases])
  const selected = cases.find((item) => item.backendId === selectedId || item.id === selectedId) ?? cases[0] ?? demoCases[0]
  const selectedBackendId = selected.backendId ?? backendCases[0]?.id ?? ''
  const metrics = buildDashboardMetrics(viewCases)
  const pick = (item: LoanCase, next: Screen = 'case-details') => { setSelectedId(item.backendId ?? item.id); setScreen(next) }

  async function createDemoCase(profile: 'strong' | 'weak' = 'strong') {
    const payload = profile === 'strong'
      ? { applicant_name: 'Priya Sharma', loan_type: 'personal', loan_amount: 500000, tenure_months: 36, monthly_income: 125000 }
      : { applicant_name: 'Watch Listed', loan_type: 'personal', loan_amount: 3000000, tenure_months: 36, monthly_income: 45000 }
    const created = await postJson<BackendCase>('/cases', payload)
    await refresh(created.id)
    return created.id
  }
  async function runE2EDemo(profile: 'strong' | 'weak' = 'strong') {
    setStatus(`Running ${profile} case workflow...`)
    try {
      const id = await createDemoCase(profile)
      await postJson(`/cases/${id}/run/documents`, {})
      await submitDocumentDecision(id, 'APPROVE_DOCS', '', false)
      for (const step of ['verification', 'credit', 'compliance', 'decision']) await postJson(`/cases/${id}/run/${step}`, {})
      await submitLoanDecision(id, profile === 'weak' ? 'refer' : 'approve', false)
      await refresh(id); setStatus(`Backend case ${id.slice(0, 8).toUpperCase()} completed`)
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Backend workflow unavailable') }
  }
  async function submitDocumentDecision(id = selectedBackendId, decision = 'APPROVE_DOCS', notes = '', doRefresh = true) {
    if (!id) return
    await postJson('/webhooks/action-center', { case_id: id, task_type: 'document_review', decision, reviewer: 'demo.officer', reason: notes || 'Synthetic document review action recorded.' })
    if (doRefresh) await refresh(id)
  }
  async function submitLoanDecision(id = selectedBackendId, decision = 'approve', doRefresh = true) {
    if (!id) return
    await postJson('/webhooks/action-center', { case_id: id, task_type: 'final_decision', decision, reviewer: 'demo.officer', reason: `Officer selected ${decision} after reviewing mock provider evidence.` })
    if (doRefresh) await refresh(id)
  }
  if (!authed) return <Login theme={theme} setTheme={setTheme} onLogin={() => setAuthed(true)} />

  return <main className={`app ${theme}`}><Sidebar screen={screen} setScreen={setScreen} /><section className="workspace ui-shell"><Topbar screen={screen} theme={theme} setTheme={setTheme} /><StatusRail status={status} analytics={analytics} onRun={runE2EDemo} />
    {screen === 'dashboard' && <Dashboard metrics={metrics} cases={viewCases} events={events} exceptions={exceptions} onSelect={pick} />}
    {screen === 'cases' && <Cases cases={cases} selected={selected} query={query} stageFilter={stageFilter} setQuery={setQuery} setStageFilter={setStageFilter} onSelect={pick} onCreate={createDemoCase} />}
    {screen === 'case-details' && <CaseDetails caseItem={selected} events={events} onDecision={() => setScreen('decision')} />}
    {screen === 'document-review' && <DocumentReview caseItem={selected} onDecision={submitDocumentDecision} />}
    {screen === 'decision' && <Decision caseItem={selected} events={events} onDecision={submitLoanDecision} />}
    {screen === 'exceptions' && <Exceptions exceptions={exceptions} cases={viewCases} selected={selected} />}
    {screen === 'analytics' && <Analytics analytics={analytics} cases={viewCases} exceptions={exceptions} />}
    {screen === 'settings' && <SettingsView />}
    {screen === 'profile' && <Profile events={events} />}
  </section></main>
}

function Login({ theme, setTheme, onLogin }: { theme: string; setTheme: (theme: 'dark' | 'light') => void; onLogin: () => void }) {
  const [email, setEmail] = useState(import.meta.env.VITE_DEMO_EMAIL ?? 'demo@finflow.local')
  const [password, setPassword] = useState(import.meta.env.VITE_DEMO_PASSWORD ?? 'finflow-demo')
  const [error, setError] = useState('')
  function submit() { if (email.includes('@') && password.length >= 6) onLogin(); else setError('Use the demo login shown in this screen.') }
  return <main className={`login ${theme}`}><section className="login-panel"><Brand /><h1>Sign in</h1><p>Demo login for the local mock provider workspace.</p><label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></label><div className="login-row"><span><CheckCircle2 size={16} /> Demo mode</span><a>Mock auth only</a></div>{error && <span className="form-error">{error}</span>}<button className="primary" onClick={submit}><LockKeyhole size={18} /> Secure access</button><button className="secondary"><ShieldCheck size={18} /> Sign in with SSO</button><div className="trust"><ShieldCheck /><strong>Audit ready</strong><span>Simulated UiPath client, synthetic data only</span></div><button className="theme-link" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Switch theme</button></section><section className="login-visual"><div className="auth-ring"><ShieldCheck size={130} /></div><div className="login-float top"><b>Human approval gate</b><span>Action Center task preview</span></div><div className="login-float bottom"><b>Mock provider chain</b><span>DocuMind - CreditSage - ComplianceGuard</span></div></section></main>
}

function Dashboard({ metrics, cases, events, exceptions, onSelect }: { metrics: ReturnType<typeof buildDashboardMetrics>; cases: LoanCase[]; events: BackendEvent[]; exceptions: Array<Record<string, unknown>>; onSelect: (item: LoanCase, next?: Screen) => void }) {
  const kpis = [{ icon: <BriefcaseBusiness />, label: 'Active cases', value: metrics.activeCases, delta: '+12% vs yesterday' }, { icon: <FileCheck2 />, label: 'Pending review', value: metrics.humanApprovals, delta: '+8% in queue' }, { icon: <CheckCircle2 />, label: 'Completion', value: `${Math.round((metrics.completed / Math.max(cases.length, 1)) * 100)}%`, delta: '+15% vs yesterday', tone: 'green' }, { icon: <AlertTriangle />, label: 'Exceptions', value: metrics.exceptions, delta: '6 near SLA', tone: 'amber' }, { icon: <Clock3 />, label: 'Avg cycle time', value: '3.7d', delta: '-0.6d vs yesterday' }, { icon: <BarChart3 />, label: 'Approval rate', value: '61.8%', delta: '+2.4% vs yesterday', tone: 'green' }]
  return <div className="ui-grid dashboard-dense"><div className="stat-row">{kpis.map((kpi) => <StatTile key={kpi.label} {...kpi} />)}</div><PipelineTable cases={cases.slice(0, 8)} onSelect={onSelect} /><Panel title="SLA risk"><Donut label="At risk" value={metrics.exceptions + 28} segments={[{ label: 'Critical <4h', value: 12, tone: 'red' }, { label: 'High 4h-1d', value: 13, tone: 'amber' }, { label: 'Medium 1d-2d', value: 6, tone: 'yellow' }, { label: 'Low >2d', value: 3, tone: 'green' }]} /></Panel><AgentActivity events={events} /><ApprovalQueue cases={cases.filter((c) => c.needsHumanApproval).slice(0, 5)} onSelect={onSelect} /><Panel title="Exceptions"><Heatmap rows={heatRows} cols={cols} cells={heatCells(exceptions.length)} /></Panel><CaseInsights /></div>
}

function Cases({ cases, selected, query, stageFilter, setQuery, setStageFilter, onSelect, onCreate }: { cases: LoanCase[]; selected: LoanCase; query: string; stageFilter: CaseStage | 'all'; setQuery: (q: string) => void; setStageFilter: (s: CaseStage | 'all') => void; onSelect: (item: LoanCase, next?: Screen) => void; onCreate: (profile?: 'strong' | 'weak') => void }) {
  return <div className="cases-layout"><section className="panel table-card"><div className="filterbar"><div className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cases, customers, products" /></div><button><Filter size={16} /> Filters</button><button><Download size={16} /> Export</button><button onClick={() => void onCreate('strong')}>New strong case</button><button onClick={() => void onCreate('weak')}>New weak case</button></div><div className="chipbar">{(['all', ...stageSequence.map((s) => s.id)] as Array<CaseStage | 'all'>).map((stage) => <button className={stageFilter === stage ? 'chip active' : 'chip'} key={stage} onClick={() => setStageFilter(stage)}>{stage === 'all' ? 'All stages' : label(stage)}</button>)}</div><DenseCaseTable cases={cases.slice(0, 12)} onSelect={(item) => onSelect(item, 'cases')} /><footer className="table-footer"><span>Showing 1-12 of {cases.length}</span><div><button>Prev</button><button className="active">1</button><button>2</button><button>Next</button></div></footer></section><CaseDrawer caseItem={selected} /></div>
}

function CaseDetails({ caseItem, events, onDecision }: { caseItem: LoanCase; events: BackendEvent[]; onDecision: () => void }) {
  return <div className="details-dense"><HeaderCard caseItem={caseItem} actions={<><button>Edit case</button><button><MoreVertical size={16} /></button></>} /><StageStepper caseItem={caseItem} /><Panel title="Documents & extraction"><DocsList /></Panel><Panel title="Credit profile"><Gauge score={caseItem.creditScore ?? 742} band={caseItem.riskBand} /><SignalGrid caseItem={caseItem} /></Panel><Panel title="Compliance checks"><Checklist rows={['AML screening passed', 'KYC consistency checked', 'RBI exposure within mock policy']} flagged={caseItem.compliancePassed === false} /></Panel><SignalStrip caseItem={caseItem} /><Timeline events={events} /><Panel title="Next action"><p>{caseItem.needsHumanApproval ? 'Human review is waiting in Action Center.' : 'Agents can continue the next stage.'}</p><button className="primary" onClick={onDecision}>Open decision center</button></Panel></div>
}

function DocumentReview({ caseItem, onDecision }: { caseItem: LoanCase; onDecision: (id?: string, decision?: string, notes?: string) => void }) {
  const [decision, setDecision] = useState('APPROVE_DOCS'); const [notes, setNotes] = useState('Synthetic masked field reviewed.')
  return <div className="review-dense"><HeaderCard caseItem={caseItem} actions={<><button>Close review</button><button>Previous</button><button>Next</button></>} /><Panel title="Flagged documents"><FlaggedDocs /></Panel><section className="panel synthetic-viewer"><b>SYNTHETIC DOCUMENT VIEWER</b><span>No real identity replica rendered</span><div className="synthetic-page"><i /><i /><i /><i /></div></section><Panel title="Extraction confidence"><Donut label="Confidence" value="72%" segments={[{ label: 'Matched fields', value: 72, tone: 'teal' }, { label: 'Needs review', value: 28, tone: 'amber' }]} /><ExtractedFields /></Panel><section className="panel decision-panel"><h2>Review decision</h2>{['APPROVE_DOCS', 'REQUEST_RESUBMIT', 'ESCALATE'].map((option) => <label key={option}><input type="radio" checked={decision === option} onChange={() => setDecision(option)} />{label(option.toLowerCase())}</label>)}<textarea value={notes} onChange={(e) => setNotes(e.target.value)} /><button className="primary" onClick={() => void onDecision(undefined, decision, notes)}>Submit review</button><button className="secondary" onClick={() => setDecision('REQUEST_RESUBMIT')}>Request documents</button></section></div>
}

function Decision({ caseItem, events, onDecision }: { caseItem: LoanCase; events: BackendEvent[]; onDecision: (id?: string, decision?: string) => void }) {
  return <div className="decision-dense"><HeaderCard caseItem={caseItem} actions={<><button>Case history</button><button><Download size={16} /> Report</button></>} /><Panel title="Credit profile"><Gauge score={caseItem.creditScore ?? 742} band={caseItem.riskBand} /><SignalGrid caseItem={caseItem} /></Panel><Panel title="Risk assessment"><RiskFactors caseItem={caseItem} /></Panel><Panel title="Compliance cleared"><Checklist rows={['AML mock check', 'KYC synthetic match', 'RBI policy guardrail']} flagged={caseItem.compliancePassed === false} /></Panel><Panel title="Policy & conditions"><Checklist rows={['DTI threshold reviewed', 'Income stability scored', 'Reduced exposure condition available']} flagged={caseItem.riskBand === 'HIGH'} /></Panel><Panel title="Key rationale"><ul className="dense-list"><li>Recommendation is deterministic; narrative is explanation-only.</li><li>Mock bureau and compliance providers are visible in the audit trail.</li><li>Human officer remains the final decision maker.</li></ul></Panel><section className="panel ai-card"><h2>AI recommendation</h2><Chip tone={caseItem.recommendation === 'REJECT' ? 'warn' : 'ok'}>{caseItem.recommendation || 'REFER'}</Chip><b>{caseItem.recommendation === 'REJECT' ? '0' : formatCurrency(Math.round(caseItem.amount * 0.82))}</b><span>Confidence 84% - simulated recommendation</span><div className="button-row"><button className="primary" onClick={() => void onDecision(undefined, 'approve')}>Approve</button><button onClick={() => void onDecision(undefined, 'reject')}>Reject</button><button onClick={() => void onDecision(undefined, 'refer')}>Refer</button></div></section><Panel title="Documents considered"><MiniTable rows={['PAN synthetic placeholder', 'Masked Aadhaar placeholder', 'Salary slip synthetic']} /></Panel><Timeline events={events} /><Panel title="Audit information"><Field label="Model" value="deterministic-policy-v1" /><Field label="Provider" value="mock provider" /><Field label="UiPath" value="simulated client" /></Panel></div>
}

function Exceptions({ exceptions, cases, selected }: { exceptions: Array<Record<string, unknown>>; cases: LoanCase[]; selected: LoanCase }) {
  const rows = exceptionRows(exceptions, cases)
  return <div className="exceptions-dense"><div className="stat-row">{['Total', 'Open', 'In review', 'Auto-resolved', 'Escalated', 'Resolved'].map((x, i) => <StatTile key={x} icon={<AlertTriangle />} label={x} value={i === 0 ? rows.length : Math.max(1, rows.length - i)} delta="synthetic ops" tone={i > 3 ? 'green' : 'amber'} />)}</div><section className="panel table-card"><div className="filterbar"><button>Type</button><button>Severity</button><button>Stage</button><button>Status</button><button><CalendarDays size={16} /> Date</button></div><ExceptionTable rows={rows} /></section><section className="panel drawer"><h2>Exception detail</h2><Field label="Case" value={selected.id} /><Field label="Customer" value={selected.applicantName} /><Field label="Description" value="Synthetic low-confidence extraction requires review." /><BarsH rows={[{ label: 'Auto retry', value: 2 }, { label: 'Human review', value: 4, tone: 'amber' }, { label: 'Escalation', value: 1, tone: 'red' }]} /><Timeline events={[]} /><div className="button-row"><button>Escalate</button><button>Reassign</button><button className="primary">Resolve</button></div></section></div>
}

function Analytics({ analytics, cases, exceptions }: { analytics: AnalyticsSummary | null; cases: LoanCase[]; exceptions: Array<Record<string, unknown>> }) {
  return <div className="analytics-dense"><div className="stat-row">{[{ l: 'Total cases', v: analytics?.total_cases ?? cases.length }, { l: 'Approval rate', v: '61.8%' }, { l: 'Avg cycle time', v: '3.7d' }, { l: 'Exception rate', v: `${Math.round((exceptions.length / Math.max(cases.length, 1)) * 100)}%` }, { l: 'Automation savings', v: '82h' }].map((k) => <StatTile key={k.l} icon={<BarChart3 />} label={k.l} value={k.v} delta="+2.4% trend" />)}</div><Panel title="Loan throughput trend"><LineTrend label="Loan throughput" points={[18, 24, 22, 31, 38, 35, 44, 49]} /></Panel><Panel title="Cycle time trend"><LineTrend label="Cycle time" points={[5.2, 4.9, 4.5, 4.2, 3.9, 3.7, 3.6]} /></Panel><Panel title="Stage bottlenecks"><BarsH rows={Object.entries(analytics?.stage_counts ?? { intake: 2, verification: 4, credit: 3, compliance: 2, decision: 5 }).map(([label, value]) => ({ label, value: Number(value) }))} /></Panel><Panel title="Risk distribution"><Donut label="Risk" value="Mix" segments={[{ label: 'Low', value: cases.filter((c) => c.riskBand === 'LOW').length, tone: 'green' }, { label: 'Medium', value: cases.filter((c) => c.riskBand === 'MEDIUM').length, tone: 'amber' }, { label: 'High', value: cases.filter((c) => c.riskBand === 'HIGH').length || 1, tone: 'red' }]} /></Panel><Panel title="Automation savings"><BarsH rows={[{ label: 'Docs', value: 42 }, { label: 'Credit', value: 31 }, { label: 'Compliance', value: 24 }, { label: 'Decision', value: 18 }]} /></Panel><Panel title="Compliance audit summary"><SignalGrid caseItem={cases[0] ?? demoCases[0]} /></Panel><Panel title="Exception breakdown"><Donut label="Exceptions" value={exceptions.length || 6} segments={[{ label: 'Docs', value: 3, tone: 'amber' }, { label: 'KYC', value: 1, tone: 'red' }, { label: 'Policy', value: 2, tone: 'teal' }]} /></Panel></div>
}

function SettingsView() {
  return <div className="settings-dense"><header className="settings-head"><h2>Workspace settings</h2><div><button>Discard</button><button className="primary">Save changes</button></div></header><Panel title="Workspace"><FormGrid items={['Organization: FinFlow Demo Bank', 'Region: India', 'Currency: INR', 'Timezone: Asia/Kolkata', 'Language: English']} /></Panel><Panel title="UiPath connection"><Field label="Status" value="simulated client" /><Field label="Endpoint" value="configured by env" /><Field label="Mode" value="MOCK" /></Panel><Panel title="Agents">{['DocuMind', 'CreditSage', 'ComplianceGuard', 'DecisionPilot', 'ExceptionHandler'].map((x) => <Toggle key={x} label={x} />)}</Panel><Panel title="Workflow rules">{['Require human final decision', 'Route low confidence docs', 'Escalate critical compliance flags'].map((x) => <Toggle key={x} label={x} />)}</Panel><Panel title="Notifications">{['Email queue alerts', 'SLA breach warnings', 'Daily audit digest'].map((x) => <Toggle key={x} label={x} />)}</Panel><Panel title="Audit logging"><Field label="Retention" value="Synthetic local audit retained in SQLite" /><Field label="Webhook auth" value="bypassed only in local mock mode" /></Panel></div>
}

function Profile({ events }: { events: BackendEvent[] }) {
  return <div className="profile-dense"><section className="panel profile-hero"><div className="big-avatar">AM</div><div><h2>Atchayam Demo Officer</h2><Chip>Senior Loan Officer</Chip><p><Mail size={14} /> demo@finflow.local <Phone size={14} /> +91 synthetic</p></div><button>Edit profile</button></section><Panel title="Role & permissions"><Field label="Role" value="Credit Analyst" /><Field label="Scope" value="Retail loan cases" /><button>View permissions</button></Panel><Panel title="Approval authority"><Gauge score={760} band="LOW" /><Field label="Per-case limit" value="INR 20,00,000" /></Panel><Panel title="Security"><Checklist rows={['MFA enabled', 'Trusted device registered', 'Account active']} /></Panel><Panel title="Team & branch"><Field label="Branch" value="Digital Lending" /><Field label="Team" value="Loan Operations" /></Panel><Panel title="Audit signature"><Field label="Signature" value="AM-FINFLOW-DEMO" /><Field label="Mode" value="synthetic local demo" /></Panel><Timeline events={events} /><Panel title="Preferences">{['Compact tables', 'Dark theme alerts', 'Daily queue summary'].map((x) => <Toggle key={x} label={x} />)}</Panel></div>
}

function Sidebar({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) { return <aside className="sidebar"><Brand /><nav>{screens.map((item) => <button className={screen === item ? 'active' : ''} key={item} onClick={() => setScreen(item)}>{navIcon(item)}<span>{label(item)}</span></button>)}</nav></aside> }
function Topbar({ screen, theme, setTheme }: { screen: Screen; theme: 'dark' | 'light'; setTheme: (theme: 'dark' | 'light') => void }) { return <header className="topbar"><div><p className="eyebrow">UiPath-ready orchestration boundary</p><h1>{label(screen)}</h1></div><div className="top-actions"><button className="icon-btn"><Search size={18} /></button><button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button><Bell size={18} /><span className="avatar">AM</span></div></header> }
function StatusRail({ status, analytics, onRun }: { status: string; analytics: AnalyticsSummary | null; onRun: (profile?: 'strong' | 'weak') => void }) { return <section className="status-rail"><span>{status}</span><span>{analytics ? `${analytics.total_cases} live case(s)` : 'Synthetic fallback available'}</span><button onClick={() => onRun('strong')}>Run approve demo <ChevronRight size={16} /></button><button onClick={() => onRun('weak')}>Run weak demo</button></section> }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="panel dense-panel"><h2>{title}</h2>{children}</section> }
function Brand() { return <div className="brand"><span>F</span><div><b>FinFlow</b><small>Loan Case Intelligence</small></div></div> }
function Chip({ children, tone = 'ok' }: { children: React.ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{children}</span> }
function Field({ label, value }: { label: string; value: string | number }) { return <p className="field"><span>{label}</span><b>{value}</b></p> }
function Toggle({ label }: { label: string }) { return <label className="toggle-row"><span>{label}</span><input type="checkbox" defaultChecked /></label> }
function HeaderCard({ caseItem, actions }: { caseItem: LoanCase; actions: React.ReactNode }) { return <section className="panel header-card"><div className="big-avatar">{caseItem.applicantName.slice(0, 2).toUpperCase()}</div><div><h2>{caseItem.applicantName}</h2><Chip tone={caseItem.hasException ? 'warn' : 'ok'}>{caseItem.status}</Chip></div><Field label="Amount" value={formatCurrency(caseItem.amount)} /><Field label="Product" value={caseItem.loanType} /><Field label="Tenure" value="36 months" /><div className="button-row">{actions}</div></section> }
function StageStepper({ caseItem }: { caseItem: LoanCase }) { return <section className="panel stage-stepper">{stageSequence.filter((s) => s.id !== 'exception').map((stage) => <div className={stage.id === caseItem.stage ? 'step active' : 'step'} key={stage.id}><i /><b>{stage.label}</b><span>{stage.actor}</span></div>)}</section> }
function PipelineTable({ cases, onSelect }: { cases: LoanCase[]; onSelect: (item: LoanCase, next?: Screen) => void }) { return <section className="panel pipeline-table"><h2>Active loan cases pipeline</h2><div className="stage-summary">{stageSequence.slice(0, 6).map((s, i) => <span key={s.id}><b>{cases.filter((c) => c.stage === s.id).length + i * 12}</b>{s.label}</span>)}</div><DenseCaseTable cases={cases} onSelect={(item) => onSelect(item)} compact /></section> }
function DenseCaseTable({ cases, onSelect, compact = false }: { cases: LoanCase[]; onSelect: (item: LoanCase) => void; compact?: boolean }) { const headers = compact ? ['Case ID', 'Customer', 'Product', 'Stage', 'SLA', 'Owner'] : ['Case ID', 'Customer', 'Product', 'Amount', 'Stage', 'Risk', 'SLA', 'Assigned', 'Agent status', 'Updated', '']; return <div className="dense-table"><div className="dense-row head">{headers.map((h) => <b key={h}>{h}</b>)}</div>{cases.map((item, i) => <button className="dense-row" key={`${item.id}-${i}`} onClick={() => onSelect(item)}><span>{item.id}</span><span>{item.applicantName}</span><span>{item.loanType}</span>{!compact && <span>{formatCurrency(item.amount)}</span>}<Chip>{label(item.stage)}</Chip>{!compact && <Chip tone={item.riskBand === 'HIGH' || item.riskBand === 'VERY_HIGH' ? 'warn' : 'ok'}>{item.riskBand}</Chip>}<span>{item.sla}</span><span>{item.assignedTo}</span>{!compact && <span>{item.needsHumanApproval ? 'Awaiting input' : 'Completed'}</span>}{!compact && <span>{item.updated}</span>}<MoreVertical size={15} /></button>)}</div> }
function CaseDrawer({ caseItem }: { caseItem: LoanCase }) { return <aside className="panel drawer"><h2>{caseItem.id}</h2><Chip tone={caseItem.riskBand === 'HIGH' ? 'warn' : 'ok'}>{caseItem.riskBand}</Chip><Field label="Customer" value={caseItem.applicantName} /><Field label="Product" value={caseItem.loanType} /><Field label="Amount" value={formatCurrency(caseItem.amount)} /><Field label="Stage" value={label(caseItem.stage)} /><div className="mini-progress"><span style={{ width: `${stageProgress(caseItem)}%` }} /></div><Field label="SLA" value={caseItem.sla} /><Field label="Assigned" value={caseItem.assignedTo} /><button className="primary">Review now</button></aside> }
function AgentActivity({ events }: { events: BackendEvent[] }) { const fallback = ['DocuMind extracted 42 documents', 'CreditSage scored 37 applications', 'ComplianceGuard flagged 6 cases', 'DecisionPilot generated 24 recommendations', 'ExceptionHandler routed 8 tasks']; const rows = events.length ? events.slice(-5).map((e) => `${e.actor}: ${e.event_type}`) : fallback; return <Panel title="Agent activity (24h)">{rows.map((row) => <p className="activity-row" key={row}><span className="dot" />{row}<small>live/synthetic</small></p>)}</Panel> }
function ApprovalQueue({ cases, onSelect }: { cases: LoanCase[]; onSelect: (item: LoanCase, next?: Screen) => void }) { return <Panel title="Approval queue"><MiniRows rows={(cases.length ? cases : demoCases.slice(0, 5)).map((c) => [c.id, c.applicantName, label(c.stage), c.sla])} onClick={(index) => onSelect((cases.length ? cases : demoCases)[index], 'decision')} /></Panel> }
function CaseInsights() { return <Panel title="Case insights"><p className="insight">Personal loan approvals are up 14% this week.</p><p className="insight warn">23 cases are approaching SLA breach; prioritize document review.</p><p className="insight">Document extraction accuracy is labeled synthetic at 98.6%.</p></Panel> }
function Timeline({ events }: { events: BackendEvent[] }) { const rows = events.length ? events.map((e) => `${e.actor}: ${e.message}`) : ['Case created', 'Document exception raised', 'Human review completed', 'Decision generated']; return <Panel title="Audit trail">{rows.slice(-8).map((x) => <p className="timeline-row" key={x}>{x}</p>)}</Panel> }
function DocsList() { return <div className="doc-list">{['PAN placeholder', 'Masked Aadhaar placeholder', 'Salary slip synthetic', 'Bank statement synthetic'].map((x, i) => <p key={x}><FileCheck2 size={16} />{x}<Chip tone={i === 1 ? 'warn' : 'ok'}>{i === 1 ? '72%' : '94%'}</Chip></p>)}</div> }
function FlaggedDocs() { return <div className="doc-list">{['Aadhaar: masked field confidence 72%', 'PAN: name consistency verified', 'Salary slip: income extracted'].map((x) => <p key={x}><AlertTriangle size={16} />{x}<Chip tone="warn">review</Chip></p>)}</div> }
function ExtractedFields() { return <div className="extract-fields">{['Applicant name', 'PAN synthetic', 'Aadhaar last four', 'Monthly income', 'Employer'].map((x, i) => <Field key={x} label={x} value={i === 2 ? '72% confidence' : '94% confidence'} />)}</div> }
function SignalGrid({ caseItem }: { caseItem: LoanCase }) { return <div className="signal-grid"><Field label="Score" value={caseItem.creditScore ?? 742} /><Field label="DTI" value="36.9%" /><Field label="Risk" value={caseItem.riskBand} /><Field label="Active loans" value="2" /></div> }
function SignalStrip({ caseItem }: { caseItem: LoanCase }) { return <section className="panel signal-strip">{[['Income', 'INR 1.25L'], ['EMI', 'INR 16K'], ['DTI', '36.9%'], ['Active loans', '2'], ['DPD', '0'], ['Tenure', '36m']].map(([l, v]) => <Field key={l} label={l} value={caseItem.riskBand === 'HIGH' && l === 'DPD' ? '1' : v} />)}</section> }
function Checklist({ rows, flagged = false }: { rows: string[]; flagged?: boolean }) { return <div className="check-list">{rows.map((row, i) => <p key={row}><CheckCircle2 size={16} /><span>{row}</span><Chip tone={flagged && i === 0 ? 'warn' : 'ok'}>{flagged && i === 0 ? 'flag' : 'pass'}</Chip></p>)}</div> }
function RiskFactors({ caseItem }: { caseItem: LoanCase }) { return <div className="risk-factors"><Chip tone={caseItem.riskBand === 'HIGH' ? 'warn' : 'ok'}>{caseItem.riskBand}</Chip><BarsH rows={[{ label: 'Affordability', value: caseItem.riskBand === 'HIGH' ? 78 : 32, tone: caseItem.riskBand === 'HIGH' ? 'red' : 'teal' }, { label: 'Bureau', value: caseItem.creditScore ?? 742 }, { label: 'Compliance', value: caseItem.compliancePassed === false ? 90 : 18, tone: caseItem.compliancePassed === false ? 'red' : 'green' }]} /></div> }
function MiniTable({ rows }: { rows: string[] }) { return <div className="mini-table">{rows.map((row) => <p key={row}><span>{row}</span><Chip>synthetic</Chip></p>)}</div> }
function MiniRows({ rows, onClick }: { rows: string[][]; onClick?: (index: number) => void }) { return <div className="mini-table">{rows.map((row, i) => <button key={row.join('-')} onClick={() => onClick?.(i)}>{row.map((cell) => <span key={cell}>{cell}</span>)}</button>)}</div> }
function ExceptionTable({ rows }: { rows: string[][] }) { return <div className="dense-table exception-table"><div className="dense-row head">{['ID', 'Type', 'Case', 'Customer', 'Stage', 'SLA', 'Severity', 'Status', 'Assignee', 'Actions'].map((h) => <b key={h}>{h}</b>)}</div>{rows.slice(0, 12).map((row) => <div className="dense-row" key={row[0]}>{row.map((cell, i) => i === 6 || i === 7 ? <Chip key={cell} tone={i === 6 ? 'warn' : 'ok'}>{cell}</Chip> : <span key={`${cell}-${i}`}>{cell}</span>)}<MoreVertical size={15} /></div>)}</div> }
function FormGrid({ items }: { items: string[] }) { return <div className="form-grid">{items.map((item) => { const [labelText, value] = item.split(': '); return <label key={item}><span>{labelText}</span><input defaultValue={value} /></label> })}</div> }
function label(screen: string) { return screen.split(/[-_]/).map((x) => x[0].toUpperCase() + x.slice(1)).join(' ') }
function navIcon(screen: Screen) { const icons = { dashboard: <LayoutDashboard />, cases: <BriefcaseBusiness />, 'case-details': <Workflow />, 'document-review': <FileCheck2 />, decision: <ClipboardCheck />, exceptions: <AlertTriangle />, analytics: <BarChart3 />, settings: <SettingsIcon />, profile: <UserRound /> }; return icons[screen] }
function expandCases(base: LoanCase[]) { const people = ['Rohit Sharma', 'Neha Verma', 'Amit Patel', 'Sneha Iyer', 'Karan Mehta', 'Pooja Nair', 'Sanjay Singh', 'Rahul Das', 'Meera Kulkarni', 'Vivek Menon', 'Jyoti Malhotra', 'Daniel Kim']; const products = ['Personal loan', 'Home loan', 'Business loan', 'Vehicle loan', 'Working capital']; return Array.from({ length: Math.max(12, base.length) }, (_, i) => ({ ...(base[i % base.length] ?? demoCases[i % demoCases.length]), id: base[i]?.id ?? `LN-2026-${(1478 - i).toString().padStart(5, '0')}`, applicantName: base[i]?.applicantName ?? people[i % people.length], loanType: base[i]?.loanType ?? products[i % products.length], amount: base[i]?.amount ?? 300000 + i * 125000, assignedTo: ['Arjun K.', 'Priya M.', 'Vikram R.', 'Sara N.'][i % 4], sla: base[i]?.sla ?? ['1d 4h', '2d 6h', '6h 15m', '3h'][i % 4], updated: base[i]?.updated ?? `${i * 15 + 2}m ago` })) }
function heatCells(seed: number) { return heatRows.flatMap((row, r) => cols.map((col, c) => ({ row, col, value: ((r + 2) * (c + 3) + seed) % 9 }))) }
function exceptionRows(exceptions: Array<Record<string, unknown>>, cases: LoanCase[]) { const source = exceptions.length ? exceptions : Array.from({ length: 12 }, (_, i) => ({ exception_type: ['low_confidence_extraction', 'policy_breach', 'kyc_mismatch'][i % 3], severity: ['HUMAN_REQUIRED', 'CRITICAL', 'AUTO_RESOLVABLE'][i % 3], source_stage: stageSequence[i % stageSequence.length].id })); return source.map((item, i) => { const c = cases[i % cases.length] ?? demoCases[0]; return [`EX-${String(i + 1).padStart(3, '0')}`, String(item.exception_type), c.id, c.applicantName, String(item.source_stage ?? c.stage), c.sla, String(item.severity), i % 3 ? 'open' : 'resolved', c.assignedTo] }) }

export default App
