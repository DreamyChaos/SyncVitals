<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-context -->
# Project: SyncVitals

**Name:** SyncVitals
**Tagline:** "Your body shouldn't be a mystery."

**Description:** SyncVitals is an explainable AI-powered preventive healthcare companion that transforms static health data into intelligent, actionable health insights.

**Key Features:**
- Health Score Engine with weighted scoring and explainability
- Health Age Engine with trend-based biological age calculation
- Silent Risk Detection for burnout, fatigue, dehydration, medication non-compliance, poor sleep
- AI-generated insights from health patterns
- Auto-generated timeline events
- Weekly and monthly health reports

**Architecture:**
- Next.js 16 with App Router
- TypeScript strict mode
- Tailwind CSS v4
- Framer Motion for animations
- Recharts for data visualization
- Context-based state management (AppProvider, ThemeProvider)

**Intelligence Services:**
- `src/lib/intelligence/HealthScoreService.ts`
- `src/lib/intelligence/HealthAgeService.ts`
- `src/lib/intelligence/RiskDetectionService.ts`
- `src/lib/intelligence/InsightGenerationService.ts`
- `src/lib/intelligence/AIPrioritiesService.ts`
- `src/lib/intelligence/TimelineGenerationService.ts`
- `src/lib/intelligence/ReportServices.ts`

**Important Conventions:**
- Product name is "SyncVitals" (not VitalityAI)
- Timeline events use Date | string type for date field
- All AI-generated content must be data-driven, not placeholder text
- Components use semantic health colors: Sleep (purple), Hydration (blue), Mood (pink), Energy (teal), Medication (emerald), Stress (orange), Risk (amber/red)

<!-- END:project-context -->