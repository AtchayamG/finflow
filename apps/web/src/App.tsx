import {
  AlertTriangle, BarChart3, Bell, BriefcaseBusiness, CheckCircle2, ChevronRight,
  ClipboardCheck, FileCheck2, Gauge, LayoutDashboard, LockKeyhole, Moon, Search,
  Settings as SettingsIcon, ShieldCheck, Sun, UserRound, Workflow,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import './App.css'
import { getAnalytics, getEvents, getExceptions, listCases, postJson, type AnalyticsSummary, type BackendEvent } from './api'
import { demoCases } from './data/demoCases'
import type { BackendCase, LoanCase } from './model/types'
import { buildDashboardMetrics, filterCases, formatCurrency, mapBackendCase, stageProgress, stageSequence } from './model/workflow'

const screens = ['dashboard', 'cases', 'case-details', 'document-review', 'decision', 'exceptions', 'analytics', 'settings', 'profile'] as const
type Screen = (typeof screens)[number]

function App() {
  const [authed, setAuthed] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState('Mock providers ready')
  const [backendCases, setBackendCases] = useState<BackendCase[]>([])
  const [events, setEvents] = useState<BackendEvent[]>([])
  const [exceptions, setExceptions] = useState<Array<Record<string, unknown>>>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)

  async function refresh(nextId = selectedId) {
    try {
      const [caseRows, summary, exceptionRows] = await Promise.all([listCases(), getAnalytics(), getExceptions()])
      setBackendCases(caseRows)
      setAnalytics(summary)
      setExceptions(exceptionRows)
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
  const viewCases = liveCases.length ? liveCases : demoCases
  const cases = useMemo(() => filterCases(viewCases, { query, stage: 'all' }), [query, viewCases])
  const selected = cases.find((item) => item.backendId === selectedId || item.id === selectedId) ?? cases[0] ?? demoCases[0]
  const selectedBackendId = selected.backendId ?? backendCases[0]?.id ?? ''
  const metrics = buildDashboardMetrics(viewCases)

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
      await submitDocumentDecision(id, 'APPROVE_DOCS', false)
      for (const step of ['verification', 'credit', 'compliance', 'decision']) await postJson(`/cases/${id}/run/${step}`, {})
      const finalDecision = profile === 'weak' ? 'refer' : 'approve'
      await submitLoanDecision(id, finalDecision, false)
      await refresh(id)
      setStatus(`Backend case ${id.slice(0, 8).toUpperCase()} completed through ${finalDecision.toUpperCase()}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Backend workflow unavailable')
    }
  }

  async function submitDocumentDecision(id = selectedBackendId, decision = 'APPROVE_DOCS', doRefresh = true) {
    if (!id) return
    await postJson('/webhooks/action-center', {
      case_id: id, task_type: 'document_review', decision, reviewer: 'demo.officer',
      reason: decision === 'APPROVE_DOCS' ? 'Synthetic masked field approved.' : 'Needs additional human review.',
    })
    if (doRefresh) await refresh(id)
  }

  async function submitLoanDecision(id = selectedBackendId, decision = 'approve', doRefresh = true) {
    if (!id) return
    await postJson('/webhooks/action-center', {
      case_id: id, task_type: 'final_decision', decision, reviewer: 'demo.officer',
      reason: `Human officer selected ${decision} after reviewing mock provider evidence.`,
    })
    if (doRefresh) await refresh(id)
  }

  if (!authed) return <Login theme={theme} setTheme={setTheme} onLogin={() => setAuthed(true)} />

  return (
    <main className={`app ${theme}`}>
      <aside className="sidebar"><Brand /><nav>{screens.map((item) => <button className={screen === item ? 'active' : ''} key={item} onClick={() => setScreen(item)}>{navIcon(item)}<span>{label(item)}</span></button>)}</nav></aside>
      <section className="workspace">
        <header className="topbar"><div><p className="eyebrow">UiPath-ready orchestration boundary</p><h1>{label(screen)}</h1></div><div className="top-actions"><button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button><Bell size={18} /><span className="avatar">AM</span></div></header>
        <StatusRail status={status} analytics={analytics} onRun={runE2EDemo} />
        {screen === 'dashboard' && <Dashboard metrics={metrics} cases={viewCases} events={events} exceptions={exceptions} />}
        {screen === 'cases' && <Cases cases={cases} query={query} setQuery={setQuery} onSelect={(item) => { setSelectedId(item.backendId ?? item.id); setScreen('case-details') }} onCreate={createDemoCase} />}
        {screen === 'case-details' && <CaseDetails caseItem={selected} events={events} />}
        {screen === 'document-review' && <DocumentReview caseItem={selected} onDecision={submitDocumentDecision} />}
        {screen === 'decision' && <Decision caseItem={selected} onDecision={submitLoanDecision} />}
        {screen === 'exceptions' && <Exceptions exceptions={exceptions} />}
        {screen === 'analytics' && <Analytics analytics={analytics} cases={viewCases} />}
        {screen === 'settings' && <SettingsView />}
        {screen === 'profile' && <Profile events={events} />}
      </section>
    </main>
  )
}

function Login({ theme, setTheme, onLogin }: { theme: string; setTheme: (theme: 'dark' | 'light') => void; onLogin: () => void }) {
  const [email, setEmail] = useState(import.meta.env.VITE_DEMO_EMAIL ?? 'demo@finflow.local')
  const [password, setPassword] = useState(import.meta.env.VITE_DEMO_PASSWORD ?? 'finflow-demo')
  const [error, setError] = useState('')
  function submit() {
    if (email.includes('@') && password.length >= 6) onLogin()
    else setError('Use the demo login shown in this screen.')
  }
  return <main className={`login ${theme}`}><section className="login-panel"><Brand /><h1>Sign in</h1><p>Demo login for the local mock provider workspace.</p><label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></label><div className="login-row"><span><CheckCircle2 size={16} /> Demo mode</span><a>Mock auth only</a></div>{error && <span className="form-error">{error}</span>}<button className="primary" onClick={submit}><LockKeyhole size={18} /> Secure access</button><button className="secondary"><ShieldCheck size={18} /> Sign in with SSO</button><div className="trust"><ShieldCheck /><strong>Audit ready</strong><span>Simulated UiPath client, synthetic data only</span></div><button className="theme-link" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Switch theme</button></section><section className="secure-art"><div className="loan-card"><p>LOAN APPLICATION</p><b>Human approval gate</b><span>Action Center task preview</span></div><ShieldCheck className="shield" size={180} /><div className="checklist"><b>Mock provider chain</b><span>DocuMind</span><span>CreditSage</span><span>ComplianceGuard</span></div></section></main>
}

function Dashboard({ metrics, cases, events, exceptions }: { metrics: ReturnType<typeof buildDashboardMetrics>; cases: LoanCase[]; events: BackendEvent[]; exceptions: Array<Record<string, unknown>> }) {
  return <div className="grid dashboard-grid"><Metric icon={<BriefcaseBusiness />} label="Active cases" value={metrics.activeCases} /><Metric icon={<AlertTriangle />} label="Exceptions" value={metrics.exceptions} tone="warn" /><Metric icon={<ClipboardCheck />} label="Human approvals" value={metrics.humanApprovals} /><Metric icon={<CheckCircle2 />} label="Completed" value={metrics.completed} tone="ok" /><Pipeline caseItem={cases[0] ?? demoCases[0]} /><CaseTable cases={cases.slice(0, 5)} /><Activity events={events} /><Heatmap exceptions={exceptions} /></div>
}

function Cases({ cases, query, setQuery, onSelect, onCreate }: { cases: LoanCase[]; query: string; setQuery: (query: string) => void; onSelect: (item: LoanCase) => void; onCreate: (profile?: 'strong' | 'weak') => void }) {
  return <section className="panel stack"><div className="toolbar"><div className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cases" /></div><button onClick={() => void onCreate('strong')}>New strong case</button><button onClick={() => void onCreate('weak')}>New weak case</button></div><CaseTable cases={cases} onSelect={onSelect} /></section>
}

function CaseDetails({ caseItem, events }: { caseItem: LoanCase; events: BackendEvent[] }) {
  return <div className="grid details-grid"><section className="panel"><h2>{caseItem.applicantName}</h2><p>{caseItem.loanType} - {formatCurrency(caseItem.amount)} - {caseItem.status}</p><div className="progress"><span style={{ width: `${stageProgress(caseItem)}%` }} /></div><Pipeline caseItem={caseItem} /></section><Timeline events={events} /></div>
}

function DocumentReview({ caseItem, onDecision }: { caseItem: LoanCase; onDecision: (id?: string, decision?: string) => void }) {
  return <div className="grid review-grid"><section className="document-preview panel"><FileCheck2 size={44} /><h2>Masked synthetic document</h2><p>No real identity replica rendered. Confidence 72%.</p><div className="doc-lines" /></section><section className="panel stack"><h2>Document review</h2><Badge tone="warn">Low confidence extraction</Badge><p>{caseItem.applicantName} needs officer confirmation before verification continues.</p><button className="primary" onClick={() => void onDecision(undefined, 'APPROVE_DOCS')}>Approve documents</button><button className="secondary" onClick={() => void onDecision(undefined, 'REQUEST_RESUBMIT')}>Request resubmission</button><button className="secondary" onClick={() => void onDecision(undefined, 'ESCALATE')}>Escalate</button></section></div>
}

function Decision({ caseItem, onDecision }: { caseItem: LoanCase; onDecision: (id?: string, decision?: string) => void }) {
  return <div className="grid review-grid"><section className="panel stack"><h2>AI recommendation</h2><Badge tone={caseItem.recommendation === 'REJECT' ? 'warn' : 'ok'}>{caseItem.recommendation || 'PENDING'}</Badge><Metric icon={<Gauge />} label="Credit score" value={caseItem.creditScore ?? 'Pending'} /><Metric icon={<ShieldCheck />} label="Compliance" value={caseItem.compliancePassed === false ? 'Flagged' : 'Cleared'} /></section><section className="panel stack"><h2>Officer decision</h2><p>{caseItem.applicantName} - {formatCurrency(caseItem.amount)}</p><button className="primary" onClick={() => void onDecision(undefined, 'approve')}>Approve loan</button><button className="secondary" onClick={() => void onDecision(undefined, 'reject')}>Reject</button><button className="secondary" onClick={() => void onDecision(undefined, 'refer')}>Refer</button></section></div>
}

function Exceptions({ exceptions }: { exceptions: Array<Record<string, unknown>> }) { return <section className="panel stack"><h2>Exceptions</h2>{(exceptions.length ? exceptions : [{ exception_type: 'low_confidence_extraction', severity: 'HUMAN_REQUIRED' }]).map((item, index) => <ExceptionRow key={index} title={String(item.exception_type)} severity={String(item.severity)} />)}</section> }
function Analytics({ analytics, cases }: { analytics: AnalyticsSummary | null; cases: LoanCase[] }) { return <div className="grid dashboard-grid"><Metric icon={<BarChart3 />} label="Total cases" value={analytics?.total_cases ?? cases.length} /><Metric icon={<Gauge />} label="Avg risk" value={analytics ? `${Math.round(analytics.average_risk_score * 100)}%` : 'Mock'} /><Metric icon={<Workflow />} label="Awaiting human" value={analytics?.awaiting_human ?? cases.filter((c) => c.needsHumanApproval).length} /><section className="panel chart"><h2>Stage bottlenecks</h2>{Object.entries(analytics?.stage_counts ?? { intake: 1, decision: 2, closed: 1 }).map(([stage, count]) => <div key={stage} style={{ width: `${Math.max(18, Number(count) * 22)}%` }}><span>{stage}</span></div>)}</section></div> }
function SettingsView() { return <section className="panel settings stack"><h2>Settings</h2>{['UiPath connection: simulated client', 'Provider mode: MOCK', 'Audit logging: enabled', 'Webhook auth: bypassed only in local mock mode'].map((x) => <label key={x}><span>{x}</span><input type="checkbox" defaultChecked /></label>)}</section> }
function Profile({ events }: { events: BackendEvent[] }) { return <section className="panel profile stack"><UserRound size={52} /><h2>Demo Officer</h2><p>Senior Loan Officer - approval authority INR 20,00,000</p><Badge>MFA enabled</Badge><Timeline events={events} /></section> }

function StatusRail({ status, analytics, onRun }: { status: string; analytics: AnalyticsSummary | null; onRun: (profile?: 'strong' | 'weak') => void }) { return <section className="status-rail"><span>{status}</span><span>{analytics ? `${analytics.total_cases} live case(s)` : 'Synthetic fallback available'}</span><button onClick={() => onRun('strong')}>Run approve demo <ChevronRight size={16} /></button><button onClick={() => onRun('weak')}>Run weak demo</button></section> }
function Pipeline({ caseItem }: { caseItem: LoanCase }) { return <section className="panel pipeline"><h2>Loan case pipeline</h2>{stageSequence.map((stage) => <div className={stage.id === caseItem.stage ? 'stage current' : 'stage'} key={stage.id}><span /><div><b>{stage.label}</b><small>{stage.actor}</small></div></div>)}</section> }
function Timeline({ events }: { events: BackendEvent[] }) { const rows = events.length ? events.map((e) => `${e.actor}: ${e.message}`) : ['Case created', 'Document exception raised', 'Human review completed', 'Decision generated']; return <section className="panel timeline"><h2>Audit trail</h2>{rows.map((x) => <p key={x}>{x}</p>)}</section> }
function CaseTable({ cases, onSelect }: { cases: LoanCase[]; onSelect?: (item: LoanCase) => void }) { return <section className="panel table"><h2>Cases</h2>{cases.map((item) => <button className="case-row" key={item.backendId ?? item.id} onClick={() => onSelect?.(item)}><span>{item.id}</span><b>{item.applicantName}</b><span>{item.stage}</span><Badge tone={item.hasException ? 'warn' : 'ok'}>{item.riskBand}</Badge><span>{item.updated}</span></button>)}</section> }
function Metric({ icon, label, value, tone = 'default' }: { icon: ReactNode; label: string; value: string | number; tone?: string }) { return <section className={`metric panel ${tone}`}><div>{icon}</div><span>{label}</span><b>{value}</b></section> }
function Activity({ events }: { events: BackendEvent[] }) { return <section className="panel stack"><h2>Agent activity</h2>{(events.length ? events.slice(-4) : []).map((event) => <p key={event.timestamp}>{event.actor} - {event.event_type}</p>) || <p>Waiting for live workflow.</p>}</section> }
function Heatmap({ exceptions }: { exceptions: Array<Record<string, unknown>> }) { return <section className="panel heatmap"><h2>Exception heatmap</h2>{['Doc', 'Credit', 'KYC', 'Decision'].map((x, i) => <span key={x} style={{ opacity: exceptions.length ? 0.45 + i * 0.12 : 0.35 }}>{x}</span>)}</section> }
function ExceptionRow({ title, severity }: { title: string; severity: string }) { return <div className="exception-row"><AlertTriangle size={18} /><b>{title}</b><Badge tone={severity.includes('HUMAN') || severity.includes('CRITICAL') ? 'warn' : 'ok'}>{severity}</Badge></div> }
function Badge({ children, tone = 'ok' }: { children: ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{children}</span> }
function Brand() { return <div className="brand"><span>F</span><div><b>FinFlow</b><small>Loan Case Intelligence</small></div></div> }
function label(screen: string) { return screen.split('-').map((x) => x[0].toUpperCase() + x.slice(1)).join(' ') }
function navIcon(screen: Screen) { const icons = { dashboard: <LayoutDashboard />, cases: <BriefcaseBusiness />, 'case-details': <Workflow />, 'document-review': <FileCheck2 />, decision: <ClipboardCheck />, exceptions: <AlertTriangle />, analytics: <BarChart3 />, settings: <SettingsIcon />, profile: <UserRound /> }; return icons[screen] }

export default App
