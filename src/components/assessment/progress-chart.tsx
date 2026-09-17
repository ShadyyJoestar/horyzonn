"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Point {
  date: string;
  fullDate: string;
  score: number;
  label: string;
  classification: string;
}

export function ProgressChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            width={36}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${value}/100`, "Score"]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as Point | undefined;
              if (!p) return "";
              return `${p.fullDate} · ${p.label}`;
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}