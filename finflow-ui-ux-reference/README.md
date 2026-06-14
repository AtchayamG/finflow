# FinFlow UI/UX Reference Pack

Generated: 2026-06-14

This folder is the approved visual reference area for FinFlow implementation.
The product UI should follow these screens closely in layout density, visual
hierarchy, workflow clarity, and dark/light theme parity.

## Structure

```text
finflow-ui-ux-reference/
├── dark/
│   ├── login.png
│   ├── dashboard.png
│   ├── cases.png
│   ├── case-details.png
│   ├── document-review.png
│   ├── decision.png
│   ├── exceptions.png
│   ├── analytics.png
│   ├── settings.png
│   └── profile.png
└── light/
    ├── login.png
    ├── dashboard.png
    ├── cases.png
    ├── case-details.png
    ├── document-review.png
    ├── decision.png
    ├── exceptions.png
    ├── analytics.png
    ├── settings.png
    └── profile.png
```

## Implementation Rules

- Login screens must remain pure authentication screens.
- Do not embed dashboard, cases, metrics, or logged-in navigation inside login.
- Use only synthetic demo data in implementation and screenshots.
- Avoid realistic identity document replicas, real email addresses, phone numbers,
  account numbers, API keys, or private user data.
- Keep FinFlow visually enterprise-focused: dense, readable, operational, and
  audit-ready rather than marketing-style.
- Dark and light themes must share layout, spacing, and content hierarchy.
- Human-in-the-loop screens must clearly show evidence, rationale, and decision
  controls.
