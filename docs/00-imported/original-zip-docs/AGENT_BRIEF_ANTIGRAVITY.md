# AGENT_BRIEF_ANTIGRAVITY.md — Briefing for Antigravity

> You are Antigravity. Read this entire document before writing any code.
> Owner/Reviewer: Claude Fable. All output reviewed before merge to main.
> Deadline: June 29, 2026.

---

## Your Identity in This Project

You are the **AI agent engineer** for FinFlow. You own all four AI agents:
- DocuMind (UiPath Agent Builder)
- CreditSage (LangChain + UiPath)
- ComplianceGuard (UiPath Agent Builder)
- DecisionPilot (LangChain + UiPath)

---

## Your Phases

Phases 3, 5, 6, 7 — see TASK_LIST.md for detailed task IDs.

---

## Non-Negotiable Rules

1. **Every Python file ≤ 250 lines.** Split by concern.
2. **All inputs/outputs match schemas in AGENT_CONTRACTS.md exactly.**
3. **Never call external APIs directly in agent files.**
   Use service clients in `backend/services/` or `backend/agents/*/tools.py`.
4. **All LangChain agents have fallback handling** — if LLM fails, return
   `AgentStatus.EXCEPTION_RAISED` with descriptive message. Never crash.
5. **All prompts are in `prompts.py`** — never inline prompts in agent logic files.
6. **Mock mode must work without any API keys** for local testing.
7. **Write unit tests for scorer/policy logic and integration tests for agents.**

---

## Phase 3 — DocuMind Agent (UiPath Agent Builder)

DocuMind lives entirely inside UiPath Agent Builder — no Python.

### What to configure in UiPath Agent Builder

```
Agent Name: DocuMind
Description: Extracts structured data from loan application documents

System Prompt (store in prompts/extract_prompt.txt):
  You are DocuMind, a specialist in financial document extraction for
  Indian banking. You receive document images or PDFs and extract
  structured data with high precision. Always return valid JSON matching
  the ExtractedDocument schema. If a field is unclear or missing, set
  its value to null and confidence to 0.0. Never guess or hallucinate.

Skills to configure:
  1. UiPath Document Understanding — classify + extract
  2. UiPath Storage Buckets — read documents
  3. HTTP POST — callback to backend webhook

Input Variables:
  - case_id: string
  - applicant_id: string
  - document_urls: string (JSON array)
  - expected_doc_types: string (JSON array)
  - callback_url: string

Output: POST to callback_url with DocuMindOutput JSON
```

### Document Understanding model training

For each document type, you need 20+ training samples:
- Aadhaar card: front + back scans
- PAN card: standard format
- Salary slip: last 3 months
- Bank statement: 6 months

Fields to extract per type:
```
Aadhaar:      name, dob, gender, aadhaar_number (masked), address
PAN:          name, father_name, dob, pan_number
Salary slip:  employer, employee_name, month, gross_salary, net_salary, pf_deduction
Bank stmt:    account_holder, account_number (masked), bank_name,
              avg_monthly_balance, avg_monthly_credit, avg_monthly_debit
```

Store training samples in `uipath/agents/documind/training_samples/`.
Document the model endpoint after publishing in `du_model_config.json`.

---

## Phase 5 — CreditSage Agent (LangChain + Python)

CreditSage is a Python LangChain agent called by the backend API.

### File structure

```
backend/agents/creditsage/
├── schemas.py        # Import from AGENT_CONTRACTS — CreditSageInput/Output
├── prompts.py        # LLM prompt templates
├── bureau_client.py  # Credit bureau API client (with mock mode)
├── scorer.py         # DTI + income scoring (pure Python, no LLM)
├── tools.py          # LangChain tools wrapping scorer + bureau_client
└── agent.py          # Main LangChain agent definition
```

### scorer.py — key logic (pure Python, no LLM needed)

```python
def compute_dti_ratio(monthly_income: float, existing_emi: float,
                       proposed_emi: float) -> float:
    """Debt-to-income ratio. Safe threshold: < 0.4"""
    total_emi = existing_emi + proposed_emi
    if monthly_income <= 0:
        return 1.0
    return min(total_emi / monthly_income, 1.0)

def compute_income_stability(salary_slips: list) -> float:
    """Score 0-1 based on consistency of 3-month salary"""
    if len(salary_slips) < 2:
        return 0.5
    amounts = [s["net_salary"] for s in salary_slips]
    variation = (max(amounts) - min(amounts)) / max(amounts)
    return max(0.0, 1.0 - variation * 2)

def compute_risk_score(cibil_score: int, dti: float,
                        income_stability: float) -> float:
    """Weighted composite risk score (0=low risk, 1=high risk)"""
    cibil_norm = 1.0 - ((cibil_score - 300) / 600)  # normalise 300-900
    return (cibil_norm * 0.5) + (dti * 0.3) + ((1 - income_stability) * 0.2)
```

### prompts.py — credit analysis prompt

```python
CREDIT_ANALYSIS_PROMPT = """
You are CreditSage, an expert credit analyst for an Indian bank.
Analyse the following financial profile and provide a structured credit assessment.

Applicant Profile:
{applicant_profile}

Bureau Data:
{bureau_data}

Computed Scores:
- DTI Ratio: {dti_ratio:.2f} (threshold: 0.40)
- Income Stability Score: {income_stability:.2f}
- Composite Risk Score: {risk_score:.2f}
- Risk Band: {risk_band}

Loan Request:
- Amount: ₹{loan_amount:,.0f}
- Type: {loan_type}
- Tenure: {tenure_months} months

Write a professional credit analysis narrative (150-200 words) explaining:
1. Key strengths in the applicant's profile
2. Key risks or concerns
3. Your recommendation: PROCEED / CAUTION / REJECT
4. One-sentence justification for the recommendation

Respond ONLY with valid JSON:
{{"rationale": str, "recommendation": "PROCEED"|"CAUTION"|"REJECT"}}
"""
```

### agent.py — LangChain agent pattern

```python
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.prompts import ChatPromptTemplate
from .tools import get_bureau_data_tool, compute_scores_tool
from .schemas import CreditSageInput, CreditSageOutput
import asyncio, os

class CreditSageAgent:
    def __init__(self):
        self.llm = ChatAnthropic(
            model=os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6"),
            max_tokens=int(os.getenv("CLAUDE_MAX_TOKENS", 2000)),
        )
        self.tools = [get_bureau_data_tool, compute_scores_tool]

    async def run(self, input: CreditSageInput) -> CreditSageOutput:
        try:
            result = await asyncio.wait_for(
                self._execute(input), timeout=90.0
            )
            return result
        except asyncio.TimeoutError:
            return CreditSageOutput(
                case_id=input.case_id,
                agent_status=AgentStatus.EXCEPTION_RAISED,
                exception_type="agent_timeout",
                exception_message="CreditSage exceeded 90s timeout",
                execution_ms=90000,
                model_used=os.getenv("CLAUDE_MODEL"),
            )
```

---

## Phase 6 — ComplianceGuard Agent (UiPath Agent Builder)

ComplianceGuard lives in UiPath Agent Builder — similar to DocuMind.

### System prompt (prompts/aml_check_prompt.txt)

```
You are ComplianceGuard, an AML and regulatory compliance specialist
for an Indian bank. You receive applicant details and must check:
1. AML watchlist status (OFAC, UN Sanctions)
2. KYC document authenticity
3. RBI lending norms compliance

Always be conservative — flag for human review if uncertain.
Respond ONLY in valid JSON matching the ComplianceGuardOutput schema.
```

### Skills in Agent Builder

1. HTTP GET — OFAC sanctions API (mock URL in dev)
2. HTTP GET — UIDAI Aadhaar verify API (mock in dev)
3. HTTP POST — callback to backend webhook
4. Calculator — for RBI LTV ratio check

### RBI rules to encode in skill prompts

```
Home loan:     LTV ≤ 75% for loans > ₹30L, LTV ≤ 80% for ≤ ₹30L
Personal loan: No LTV constraint, but DTI must be < 50%
Business loan: Borrower must be GST-registered for amounts > ₹20L
Vehicle loan:  LTV ≤ 85% of on-road price
```

---

## Phase 7 — DecisionPilot Agent (LangChain + Python)

### policy_engine.py — lending policy rules (pure Python)

```python
POLICY_RULES = {
    "personal": {
        "min_cibil": 700,
        "max_dti": 0.45,
        "min_income": 25000,      # Monthly ₹
        "max_amount": 2_000_000,
        "min_tenure_months": 12,
        "max_tenure_months": 60,
    },
    "home": {
        "min_cibil": 720,
        "max_dti": 0.40,
        "min_income": 40000,
        "max_amount": 50_000_000,
        "min_tenure_months": 60,
        "max_tenure_months": 360,
    },
    # ... other loan types
}

def evaluate_policy(loan_type: str, credit_result: dict,
                     applicant: dict) -> dict:
    """Returns {passed: bool, violations: list, conditions: list}"""
    rules = POLICY_RULES.get(loan_type, {})
    violations = []
    conditions = []
    # Check each rule, populate violations/conditions
    ...
    return {"passed": len(violations) == 0,
            "violations": violations, "conditions": conditions}
```

### Decision prompt (prompts.py)

```python
DECISION_PROMPT = """
You are DecisionPilot, the final AI credit decision engine for an Indian bank.
You synthesise all analysis and produce a final recommendation.

Complete Case Summary:
{case_summary}

Your task:
1. Review credit score, risk band, compliance status, and policy check results
2. Recommend: APPROVE / REJECT / REFER (to credit committee)
3. If APPROVE: suggest approved amount, tenure, and interest rate band
4. If REJECT: list the top 3 specific reasons
5. If REFER: explain what additional review is needed

Write an executive summary (2-3 sentences max) for the human officer.
Write a detailed rationale (200-300 words) shown in the approval interface.

Respond ONLY in valid JSON matching the DecisionPilotOutput schema.
"""
```

---

## Deliverable Checklist

- [ ] DocuMind configured in UiPath Agent Builder + DU model trained + published
- [ ] CreditSage: all 6 Python files created, unit + integration tests pass
- [ ] ComplianceGuard configured in UiPath Agent Builder + published
- [ ] DecisionPilot: all 5 Python files created, unit + integration tests pass
- [ ] All agents work in mock mode (no external APIs needed)
- [ ] All agent outputs match schemas in AGENT_CONTRACTS.md exactly
- [ ] No Python file exceeds 250 lines
- [ ] LLM calls have timeout + fallback in all agent.py files
- [ ] REVIEW_LOG.md updated with completed task IDs
