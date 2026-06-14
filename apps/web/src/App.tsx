import {
  AlertTriangle,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  Workflow,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import './App.css'
import { demoCases } from './data/demoCases'
import type { LoanCase } from './model/types'
import { buildDashboardMetrics, filterCases, formatCurrency, stageProgress, stageSequence } from './model/workflow'

const apiBase = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8781'
const screens = ['dashboard', 'cases', 'case-details', 'document-review', 'decision', 'exceptions', 'analytics', 'settings', 'profile'] as const
type Screen = (typeof screens)[number]

function App() {
  const [authed, setAuthed] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [query, setQuery] = useState('')
  const [apiStatus, setApiStatus] = useState('Backend ready for mock workflow')
  const [backendCase, setBackendCase] = useState<Record<string, unknown> | null>(null)
  const cases = useMemo(() => filterCases(demoCases, { query, stage: 'all' }), [query])
  const selected = cases[0] ?? demoCases[0]
  const metrics = buildDashboardMetrics(demoCases)

  async function runE2EDemo() {
    setApiStatus('Running backend workflow...')
    try {
      const created = await post('/cases', {
        applicant_name: 'Priya Sharma',
        loan_type: 'personal',
        loan_amount: 500000,
        tenure_months: 36,
        monthly_income: 65000,
      })
      const id = String(created.id)
      await post(`/cases/${id}/run/documents`, {})
      await post('/webhooks/action-center', {
        case_id: id,
        task_type: 'document_review',
        decision: 'approve_documents',
        reviewer: 'demo.officer',
        reason: 'Synthetic document exception reviewed and approved.',
      })
      for (const step of ['verification', 'credit', 'compliance', 'decision']) {
        await post(`/cases/${id}/run/${step}`, {})
      }
      const finalCase = await post('/webhooks/action-center', {
        case_id: id,
        task_type: 'final_decision',
        decision: 'approve',
        reviewer: 'demo.officer',
        reason: 'Policy checks passed and risk is low.',
      })
      setBackendCase(finalCase)
      setApiStatus(`Backend case ${id} closed as ${String(finalCase.case_status).toUpperCase()}`)
    } catch (error) {
      setApiStatus(error instanceof Error ? error.message : 'Backend workflow unavailable')
    }
  }

  if (!authed) return <Login theme={theme} setTheme={setTheme} onLogin={() => setAuthed(true)} />

  return (
    <main className={`app ${theme}`}>
      <aside className="sidebar">
        <Brand />
        <nav>
          {screens.map((item) => (
            <button className={screen === item ? 'active' : ''} key={item} onClick={() => setScreen(item)}>
              {navIcon(item)}
              <span>{label(item)}</span>
            </button>
          ))}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">UiPath Maestro Case demo</p>
            <h1>{label(screen)}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Bell size={18} />
            <span className="avatar">AM</span>
          </div>
        </header>
        <StatusRail apiStatus={apiStatus} backendCase={backendCase} onRun={runE2EDemo} />
        {screen === 'dashboard' && <Dashboard metrics={metrics} cases={demoCases} />}
        {screen === 'cases' && <Cases cases={cases} query={query} setQuery={setQuery} />}
        {screen === 'case-details' && <CaseDetails caseItem={selected} />}
        {screen === 'document-review' && <DocumentReview />}
        {screen === 'decision' && <Decision caseItem={selected} backendCase={backendCase} />}
        {screen === 'exceptions' && <Exceptions />}
        {screen === 'analytics' && <Analytics />}
        {screen === 'settings' && <SettingsView />}
        {screen === 'profile' && <Profile />}
      </section>
    </main>
  )
}

function Login({ theme, setTheme, onLogin }: { theme: string; setTheme: (theme: 'dark' | 'light') => void; onLogin: () => void }) {
  return (
    <main className={`login ${theme}`}>
      <section className="login-panel">
        <Brand />
        <h1>Sign in</h1>
        <p>Access your secure workspace</p>
        <label>Email<input placeholder="you@company.com" /></label>
        <label>Password<input placeholder="••••••••••••" type="password" /></label>
        <div className="login-row"><span><CheckCircle2 size={16} /> Remember me</span><a>Forgot password?</a></div>
        <button className="primary" onClick={onLogin}><LockKeyhole size={18} /> Secure access</button>
        <button className="secondary"><ShieldCheck size={18} /> Sign in with SSO</button>
        <div className="trust"><ShieldCheck /><strong>Audit ready</strong><span>Encrypted workspace</span></div>
        <button className="theme-link" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Switch theme</button>
      </section>
      <section className="secure-art">
        <div className="loan-card"><p>LOAN APPLICATION</p><b>Verified identity & income</b><span>Masked ID · Synthetic preview</span></div>
        <ShieldCheck className="shield" size={180} />
        <div className="checklist"><b>Compliance check</b><span>KYC verification</span><span>Income verified</span><span>AML screening</span></div>
      </section>
    </main>
  )
}

function Dashboard({ metrics, cases }: { metrics: ReturnType<typeof buildDashboardMetrics>; cases: LoanCase[] }) {
  return <div className="grid dashboard-grid">
    <Metric icon={<BriefcaseBusiness />} label="Active cases" value={metrics.activeCases} />
    <Metric icon={<AlertTriangle />} label="Exceptions" value={metrics.exceptions} tone="warn" />
    <Metric icon={<ClipboardCheck />} label="Human approvals" value={metrics.humanApprovals} />
    <Metric icon={<CheckCircle2 />} label="Completed" value={metrics.completed} tone="ok" />
    <Pipeline caseItem={cases[0]} />
    <CaseTable cases={cases.slice(0, 5)} />
  </div>
}

function Cases({ cases, query, setQuery }: { cases: LoanCase[]; query: string; setQuery: (query: string) => void }) {
  return <section className="panel stack"><div className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cases" /></div><CaseTable cases={cases} /></section>
}

function CaseDetails({ caseItem }: { caseItem: LoanCase }) {
  return <div className="grid details-grid"><section className="panel"><h2>{caseItem.applicantName}</h2><p>{caseItem.loanType} · {formatCurrency(caseItem.amount)}</p><div className="progress"><span style={{ width: `${stageProgress(caseItem)}%` }} /></div><Pipeline caseItem={caseItem} /></section><Timeline /></div>
}

function DocumentReview() {
  return <div className="grid review-grid"><section className="document-preview panel"><FileCheck2 size={44} /><h2>Masked ID document</h2><p>Synthetic preview · confidence 71%</p><div className="doc-lines" /></section><section className="panel stack"><h2>Document review</h2><Badge tone="warn">Low confidence extraction</Badge><p>Masked field requires officer confirmation before verification continues.</p><button className="primary">Approve documents</button><button className="secondary">Request resubmission</button><button className="secondary">Escalate</button></section></div>
}

function Decision({ caseItem, backendCase }: { caseItem: LoanCase; backendCase: Record<string, unknown> | null }) {
  return <div className="grid review-grid"><section className="panel stack"><h2>AI recommendation</h2><Badge>APPROVE</Badge><p>Risk is low, compliance cleared, deterministic policy checks passed.</p><Metric icon={<Gauge />} label="Credit score" value={backendCase ? '762' : 'Demo'} /><Metric icon={<ShieldCheck />} label="Compliance" value="Cleared" /></section><section className="panel stack"><h2>Officer decision</h2><p>{caseItem.applicantName} · {formatCurrency(caseItem.amount)}</p><button className="primary">Approve loan</button><button className="secondary">Reject</button><button className="secondary">Refer</button></section></div>
}

function Exceptions() { return <section className="panel stack"><h2>Exceptions</h2><ExceptionRow title="Low confidence extraction" severity="HUMAN_REQUIRED" /><ExceptionRow title="Bureau retry completed" severity="AUTO_RESOLVABLE" /><ExceptionRow title="Compliance watchlist clear" severity="RESOLVED" /></section> }
function Analytics() { return <div className="grid dashboard-grid"><Metric icon={<BarChart3 />} label="Cycle time" value="4.2m" /><Metric icon={<Gauge />} label="Approval rate" value="78%" /><Metric icon={<Workflow />} label="Automation savings" value="82h" /><section className="panel chart"><h2>Stage bottlenecks</h2><div /><div /><div /></section></div> }
function SettingsView() { return <section className="panel settings stack"><h2>Settings</h2>{['UiPath connection: simulated', 'Provider mode: MOCK', 'Audit logging: enabled', 'Webhook protection: demo token'].map((x) => <label key={x}><span>{x}</span><input type="checkbox" defaultChecked /></label>)}</section> }
function Profile() { return <section className="panel profile stack"><UserRound size={52} /><h2>Demo Officer</h2><p>Senior Loan Officer · Approval authority ₹20,00,000</p><Badge>MFA enabled</Badge><Timeline /></section> }

function StatusRail({ apiStatus, backendCase, onRun }: { apiStatus: string; backendCase: Record<string, unknown> | null; onRun: () => void }) { return <section className="status-rail"><span>{apiStatus}</span><span>{backendCase ? 'Audit event chain created' : 'Mock providers ready'}</span><button onClick={onRun}>Run E2E demo <ChevronRight size={16} /></button></section> }
function Pipeline({ caseItem }: { caseItem: LoanCase }) { return <section className="panel pipeline"><h2>Loan case pipeline</h2>{stageSequence.map((stage) => <div className={stage.id === caseItem.stage ? 'stage current' : 'stage'} key={stage.id}><span /><div><b>{stage.label}</b><small>{stage.actor}</small></div></div>)}</section> }
function Timeline() { return <section className="panel timeline"><h2>Audit trail</h2>{['Case created', 'Document exception raised', 'Human review completed', 'Credit scored', 'Decision generated'].map((x) => <p key={x}>{x}</p>)}</section> }
function CaseTable({ cases }: { cases: LoanCase[] }) { return <section className="panel table"><h2>Cases</h2>{cases.map((item) => <div className="case-row" key={item.id}><span>{item.id}</span><b>{item.applicantName}</b><span>{item.stage}</span><Badge tone={item.hasException ? 'warn' : 'ok'}>{item.riskBand}</Badge><span>{item.updated}</span></div>)}</section> }
function Metric({ icon, label, value, tone = 'default' }: { icon: React.ReactNode; label: string; value: string | number; tone?: string }) { return <section className={`metric panel ${tone}`}><div>{icon}</div><span>{label}</span><b>{value}</b></section> }
function ExceptionRow({ title, severity }: { title: string; severity: string }) { return <div className="exception-row"><AlertTriangle size={18} /><b>{title}</b><Badge tone={severity === 'HUMAN_REQUIRED' ? 'warn' : 'ok'}>{severity}</Badge></div> }
function Badge({ children, tone = 'ok' }: { children: React.ReactNode; tone?: string }) { return <span className={`badge ${tone}`}>{children}</span> }
function Brand() { return <div className="brand"><span>F</span><div><b>FinFlow</b><small>Loan Case Intelligence</small></div></div> }
function label(screen: string) { return screen.split('-').map((x) => x[0].toUpperCase() + x.slice(1)).join(' ') }
function navIcon(screen: Screen) { const icons = { dashboard: <LayoutDashboard />, cases: <BriefcaseBusiness />, 'case-details': <Workflow />, 'document-review': <FileCheck2 />, decision: <ClipboardCheck />, exceptions: <AlertTriangle />, analytics: <BarChart3 />, settings: <Settings />, profile: <UserRound /> }; return icons[screen] }
async function post(path: string, body: unknown) { const response = await fetch(`${apiBase}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!response.ok) throw new Error(`Backend ${path} failed`); return response.json() }

export default App
