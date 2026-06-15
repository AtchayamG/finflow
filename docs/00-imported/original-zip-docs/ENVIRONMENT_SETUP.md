# ENVIRONMENT_SETUP.md — FinFlow Environment & Bootstrap Guide

---

## .env.example — Copy to .env and fill all values

```bash
# ================================================================
# UIPATH AUTOMATION CLOUD
# ================================================================
UIPATH_ACCOUNT_NAME=your_account_name
UIPATH_TENANT_NAME=FinFlowTenant
UIPATH_CLIENT_ID=your_client_id
UIPATH_CLIENT_SECRET=
UIPATH_ORCHESTRATOR_URL=https://cloud.uipath.com/{account}/{tenant}
UIPATH_FOLDER_NAME=FinFlow_Production

# ================================================================
# LLM (Claude via Anthropic API)
# ================================================================
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-sonnet-4-6
CLAUDE_MAX_TOKENS=2000

# ================================================================
# DATABASE (PostgreSQL)
# ================================================================
DATABASE_URL=postgresql+asyncpg://finflow:password@localhost:5432/finflow
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finflow
DB_USER=finflow
DB_PASSWORD=changeme_local

# ================================================================
# REDIS
# ================================================================
REDIS_URL=redis://localhost:6379/0

# ================================================================
# BACKEND API
# ================================================================
API_KEY=changeme-local-dev-key
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
ENVIRONMENT=development

# ================================================================
# CREDIT BUREAU (use mock=true for development)
# ================================================================
BUREAU_API_MOCK=true
BUREAU_API_URL=https://api.cibil.com/v1
BUREAU_API_KEY=your_cibil_api_key

# ================================================================
# GOVT / KYC APIS (use mock=true for development)
# ================================================================
AADHAAR_API_MOCK=true
AADHAAR_API_URL=https://prod.idrix.co.in/uidai
PAN_API_MOCK=true
PAN_API_URL=https://api.pan-verify.co.in/v1

# ================================================================
# AML WATCHLIST
# ================================================================
AML_API_MOCK=true
OFAC_API_URL=https://api.ofac.treasury.gov/v1

# ================================================================
# DOCUMENT STORAGE (UiPath Storage / local for dev)
# ================================================================
STORAGE_TYPE=local              # "local" | "uipath_storage" | "s3"
LOCAL_STORAGE_PATH=./tmp/docs

# ================================================================
# NOTIFICATIONS (stub for hackathon)
# ================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
NOTIFICATION_FROM=noreply@finflow.in
```

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- Docker Desktop (for PostgreSQL + Redis)
- UiPath Studio (Community Edition is fine for XAML editing)
- UiPath Automation Cloud account (Labs access via hackathon form)

### Step 1 — Clone and set up environment

```bash
git clone https://github.com/YOUR_ORG/finflow.git
cd finflow
cp .env.example .env
# Fill in your .env values — at minimum set ANTHROPIC_API_KEY
```

### Step 2 — Start local infrastructure

```bash
docker-compose up -d
# Starts: PostgreSQL on 5432, Redis on 6379
```

### Step 3 — Backend Python setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run DB migrations
psql -U finflow -d finflow -f db/migrations/001_initial.sql

# Start API server
uvicorn api.main:app --reload --port 8000
```

### Step 4 — Verify backend health

```bash
curl http://localhost:8000/health
# Expected: {"status": "ok", "version": "1.0.0"}
```

### Step 5 — Run tests

```bash
pytest tests/unit/ -v --tb=short
pytest tests/integration/ -v --tb=short    # requires DB + Redis running
```

---

## Python Requirements (backend/requirements.txt)

```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
redis[asyncio]==5.0.3
pydantic==2.7.1
pydantic-settings==2.2.1
langchain==0.2.0
langchain-anthropic==0.1.15
anthropic==0.28.0
httpx==0.27.0
python-dotenv==1.0.1
alembic==1.13.1
pytest==8.2.0
pytest-asyncio==0.23.6
pytest-mock==3.14.0
```

---

## docker-compose.yml (local dev)

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: finflow
      POSTGRES_USER: finflow
      POSTGRES_PASSWORD: changeme_local
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## UiPath Automation Cloud Setup (Labs)

### Step 1 — Request Labs access
Submit form at: https://bit.ly/agenthack26form
Wait for email with credentials (≤3 business days).

### Step 2 — Create Orchestrator Folder
1. Log into cloud.uipath.com with Labs credentials
2. Go to Orchestrator → Folders → Create folder
3. Name: `FinFlow_Production`

### Step 3 — Create Orchestrator Assets
Navigate to Assets in `FinFlow_Production` folder and create:

| Asset Name | Type | Value |
|---|---|---|
| `FinFlow_APIBaseURL` | Text | `http://YOUR_IP:8000` |
| `FinFlow_APIKey` | Credential | `changeme-local-dev-key` |
| `Bureau_APIKey` | Credential | (mock mode: any string) |
| `Aadhaar_APIKey` | Credential | (mock mode: any string) |
| `BankPolicy_Version` | Text | `v2.1` |

### Step 4 — Set up Maestro Case
1. Go to Maestro → Cases → New Case Definition
2. Name: `LoanApplication`
3. Add stages per ARCHITECTURE.md Section 3
4. Configure transitions per `uipath/maestro/case_definition/stage_transitions.md`

### Step 5 — Set up Action Center
1. Go to Apps → Create two apps:
   - "FinFlow Document Review" (see Phase 9 in TASK_LIST)
   - "FinFlow Loan Decision" (see Phase 9 in TASK_LIST)

---

## GitHub Actions CI (.github/workflows/ci.yml)

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: finflow_test
          POSTGRES_USER: finflow
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
      redis:
        image: redis:7
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r backend/requirements.txt
      - run: cd backend && pytest tests/unit/ --tb=short
        env:
          DATABASE_URL: postgresql+asyncpg://finflow:test@localhost:5432/finflow_test
          REDIS_URL: redis://localhost:6379/0
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          BUREAU_API_MOCK: "true"
          AADHAAR_API_MOCK: "true"
          AML_API_MOCK: "true"
```

---

## Key URLs

| Resource | URL |
|---|---|
| UiPath Automation Cloud | https://cloud.uipath.com |
| Devpost registration | https://uipath-agenthack.devpost.com |
| Labs access form | https://bit.ly/agenthack26form |
| UiPath Community Forum | https://forum.uipath.com |
| Submission deadline | June 29, 2026 @ 11:45 PM EDT |
