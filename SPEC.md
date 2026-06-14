# HealthTech Dashboard Specification

## Project Overview
- **Project Name**: VitalityAI Health Dashboard
- **Type**: Responsive HealthTech SaaS Dashboard
- **Core Functionality**: Premium health monitoring dashboard with AI-driven insights, risk alerts, and trend visualization
- **Target Users**: Health-conscious individuals, wellness apps, HealthTech startups

## Visual & Rendering Specification

### Color Palette
- **Primary**: `#10B981` (Emerald green - vitality/health)
- **Secondary**: `#6366F1` (Indigo - AI/tech accent)
- **Accent**: `#F59E0B` (Amber - alerts/warnings)
- **Danger**: `#EF4444` (Red - critical alerts)
- **Background**: `#0F172A` (Dark slate)
- **Surface**: `#1E293B` (Elevated cards)
- **Text Primary**: `#F8FAFC`
- **Text Secondary**: `#94A3B8`

### Typography
- **Headings**: Inter (700, 600)
- **Body**: Inter (400, 500)
- **Monospace metrics**: JetBrains Mono

### Layout
- Responsive grid: 1 column mobile, 2 columns tablet, 3-4 columns desktop
- Card-based UI with subtle glassmorphism effects
- Smooth animations with Framer Motion

## Components Specification

### 1. Health Score Card
- Large circular progress indicator (0-100)
- Animated score number with gradient text
- Trend indicator (up/down arrow with percentage)
- Color coded: green (80+), amber (60-79), red (<60)

### 2. Health Age Card
- Display estimated biological age vs chronological age
- Circular gauge visualization
- Difference indicator (younger/older than actual)
- Motivational message

### 3. AI Priorities Panel
- 3-4 priority health items
- Progress bars with animated fill
- Category icons (heart, brain, muscles, sleep)
- Percentage completion

### 4. AI Insight Card
- Generative-style health insight text
- Animated text reveal
- Category tag (Nutrition, Fitness, Sleep, Stress)
- Confidence score

### 5. Risk Alerts Section
- Scrollable list of health risks
- Severity badges (Low/Medium/High/Critical)
- Animated attention indicator for critical items
- Action buttons

### 6. Medication Summary
- List of current medications
- Dosage and schedule
- Compliance indicator
- Next dose countdown

### 7. Weekly Trend Charts
- Multi-line chart showing weekly trends
- Metrics: Sleep, Activity, Heart Rate, Stress
- Interactive tooltips
- Smooth animated lines with Recharts

## Interaction Specification

### Animations
- Card entrance: fade-up with stagger (100ms delay between cards)
- Score animations: count-up on mount
- Chart animations: draw-in from left
- Hover: subtle scale (1.02) with shadow lift

### Responsiveness
- Mobile: Single column stack
- Tablet (768px+): 2-column grid
- Desktop (1280px+): 3-4 column grid with sidebar

## Technical Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- Recharts

## Mock Data Structure
```typescript
interface HealthData {
  healthScore: number;
  healthAge: number;
  chronologicalAge: number;
  priorities: Priority[];
  aiInsight: Insight;
  riskAlerts: RiskAlert[];
  medications: Medication[];
  weeklyTrends: WeeklyDataPoint[];
}
```