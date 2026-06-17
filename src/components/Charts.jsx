import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

// Custom Tooltip component for consistent aesthetics
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b1c30] text-[#eaf1ff] p-3 rounded-lg border border-[#737686]/30 shadow-xl text-xs font-sans">
        <p className="font-bold border-b border-[#737686]/20 pb-1 mb-1.5">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="flex justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }}></span>
              {item.name}:
            </span>
            <span className="font-bold">
              {item.name.toLowerCase().includes('earn') || item.name.toLowerCase().includes('tips') ? `$${item.value}` : item.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Worker dashboard performance composed chart
export function JobPerformanceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dce9ff" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#737686', fontSize: 11, fontFamily: 'Inter' }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#737686', fontSize: 11, fontFamily: 'Inter' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 74, 198, 0.04)' }} />
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingTop: 15, fontSize: 11, fontFamily: 'Inter' }}
        />
        <Bar
          name="Jobs Completed"
          dataKey="completed"
          fill="#004ac6"
          radius={[4, 4, 0, 0]}
          barSize={24}
        />
        <Line
          name="Earnings Trend ($)"
          type="monotone"
          dataKey="trend"
          stroke="#fd761a"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#fd761a', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// 2. Stacked Bar Chart for Weekly Earnings
export function WeeklyEarningsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eeff" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#737686', fontSize: 11, fontFamily: 'Inter' }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#737686', fontSize: 11, fontFamily: 'Inter' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 74, 198, 0.04)' }} />
        <Legend
          verticalAlign="bottom"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingTop: 15, fontSize: 11, fontFamily: 'Inter' }}
        />
        <Bar
          name="Job Earnings ($)"
          dataKey="jobs"
          stackId="a"
          fill="#004ac6"
          radius={[0, 0, 0, 0]}
          barSize={20}
        />
        <Bar
          name="Tips & Incentives ($)"
          dataKey="tips"
          stackId="a"
          fill="#fd761a"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// 3. Smooth Area Chart for Daily Trends
export function DailyEarningsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
      >
        <defs>
          <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#004ac6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#004ac6" stopOpacity={0.0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eeff" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#737686', fontSize: 11, fontFamily: 'Inter' }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#737686', fontSize: 11, fontFamily: 'Inter' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          name="Revenue Trend ($)"
          type="monotone"
          dataKey="trend"
          stroke="#004ac6"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorTrend)"
          dot={{ r: 3, fill: '#004ac6', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
