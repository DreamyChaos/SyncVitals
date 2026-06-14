"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyDataPoint } from "@/lib/data";
import { cn } from "@/lib/utils";

interface WeeklyTrendChartProps {
  data: WeeklyDataPoint[];
}

const metrics = [
  { key: "sleep", color: "#A78BFA", gradient: ["#A78BFA", "#6366F1"], name: "Sleep" },
  { key: "mood", color: "#F472B6", gradient: ["#F472B6", "#EC4899"], name: "Mood" },
  { key: "stress", color: "#FB923C", gradient: ["#FB923C", "#F59E0B"], name: "Stress" },
  { key: "energy", color: "#2DD4BF", gradient: ["#2DD4BF", "#10B981"], name: "Energy" },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-3 shadow-xl">
      <p className="text-label font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          const metric = metrics.find((m) => m.key === entry.dataKey);
          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: metric?.gradient?.[0] || entry.color }}
                />
                <span className="text-caption text-muted-foreground">{metric?.name}</span>
              </div>
              <span className="text-caption font-semibold text-foreground">{entry.value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="ai-panel p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 9l-5 5-4-4-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-title font-semibold text-foreground">Weekly Trends</h3>
            <p className="text-caption text-muted-foreground">Wellness patterns over time</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {metrics.map((m) => (
            <div key={m.key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})`,
                  boxShadow: `0 0 8px ${m.gradient[0]}40`,
                }}
              />
              <span className="text-caption font-medium text-muted-foreground">
                {m.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {metrics.map((m) => (
                <linearGradient key={m.key} id={`gradient-${m.key}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={m.gradient[0]} stopOpacity={1} />
                  <stop offset="100%" stopColor={m.gradient[1]} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="0"
              stroke="var(--border)"
              opacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="var(--muted-foreground)"
              className="text-caption"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />

            <YAxis
              stroke="var(--muted-foreground)"
              className="text-caption"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />

            <Tooltip content={<CustomTooltip />} />

            {metrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={`url(#gradient-${metric.key})`}
                strokeWidth={3}
                dot={{ fill: metric.gradient[0], r: 3, stroke: "var(--card-background)", strokeWidth: 2 }}
                activeDot={{
                  r: 6,
                  fill: metric.gradient[0],
                  strokeWidth: 0,
                  style: { filter: `drop-shadow(0 0 8px ${metric.gradient[0]}80)` },
                }}
                animationDuration={2000}
                animationEasing="ease-out"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}