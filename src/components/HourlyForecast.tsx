import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, ReferenceLine,
} from 'recharts';
import type { HourlyForecast as HourlyForecastData } from '../types/weather';
import { getWindDirectionText } from '../types/weather';

interface HourlyForecastProps {
  data: HourlyForecastData[];
  theme: 'light' | 'dark';
}

type Tab = 'temperature' | 'precipitation' | 'wind';

const TABS: { key: Tab; label: string }[] = [
  { key: 'temperature', label: '기온' },
  { key: 'precipitation', label: '강수확률' },
  { key: 'wind', label: '바람' },
];

const POINT_WIDTH = 55;

function formatTimeLabel(time: string): string {
  const h = parseInt(time.slice(0, 2), 10);
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 || 12;
  return `${ampm} ${h12}시`;
}

function formatDateLabel(date: string): string {
  const m = parseInt(date.slice(4, 6), 10);
  const d = parseInt(date.slice(6, 8), 10);
  return `${m}/${d}`;
}

const COLORS = {
  light: {
    grid: '#f3f4f6',
    tick: '#9ca3af',
    label: '#6b7280',
    dateLine: '#d1d5db',
    dateLabel: '#6b7280',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e5e7eb',
    tooltipText: '#374151',
  },
  dark: {
    grid: '#374151',
    tick: '#9ca3af',
    label: '#d1d5db',
    dateLine: '#6b7280',
    dateLabel: '#9ca3af',
    tooltipBg: '#1f2937',
    tooltipBorder: '#374151',
    tooltipText: '#f3f4f6',
  },
} as const;

export function HourlyForecast({ data, theme }: HourlyForecastProps) {
  const [tab, setTab] = useState<Tab>('temperature');

  if (data.length === 0) return null;

  const c = COLORS[theme];

  const chartData = data.map((item) => ({
    timeKey: `${item.date}_${item.time}`,
    displayTime: formatTimeLabel(item.time),
    temperature: item.temperature,
    precipitation: item.precipitationProbability,
    windSpeed: item.windSpeed,
    windLabel: `${getWindDirectionText(item.windDirection)} ${item.windSpeed}`,
  }));

  // 날짜가 바뀌는 지점 찾기
  const dateBoundaries = data
    .filter((item, i) => i > 0 && item.date !== data[i - 1].date)
    .map((item) => ({
      timeKey: `${item.date}_${item.time}`,
      label: formatDateLabel(item.date),
    }));

  const displayMap = new Map(chartData.map((d) => [d.timeKey, d.displayTime]));
  const tickFormatter = (key: unknown) => displayMap.get(String(key)) ?? '';

  const chartMinWidth = chartData.length * POINT_WIDTH;
  const chartMargin = { top: 20, right: 30, left: 30, bottom: 0 };

  const dateLines = dateBoundaries.map((b) => (
    <ReferenceLine
      key={b.timeKey}
      x={b.timeKey}
      stroke={c.dateLine}
      strokeDasharray="4 4"
      label={{ value: b.label, position: 'insideTopRight', fontSize: 10, fill: c.dateLabel, fontWeight: 500 }}
    />
  ));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              tab === t.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 차트 */}
      <div className="h-48 overflow-x-auto custom-scrollbar">
        <div style={{ minWidth: chartMinWidth, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {tab === 'temperature' ? (
              <AreaChart data={chartData} margin={chartMargin}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={c.grid} />
                <XAxis
                  dataKey="timeKey"
                  tickFormatter={tickFormatter}
                  tick={{ fontSize: 11, fill: c.tick }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis hide domain={['dataMin - 3', 'dataMax + 3']} />
                <Tooltip
                  labelFormatter={tickFormatter}
                  formatter={(value) => [`${value}°C`, '기온']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', backgroundColor: c.tooltipBg, borderColor: c.tooltipBorder, color: c.tooltipText }}
                  labelStyle={{ color: c.tooltipText }}
                />
                {dateLines}
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#tempGrad)"
                >
                  <LabelList
                    dataKey="temperature"
                    position="top"
                    formatter={(v) => `${v}°`}
                    style={{ fontSize: 11, fill: c.label }}
                  />
                </Area>
              </AreaChart>
            ) : tab === 'precipitation' ? (
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={c.grid} />
                <XAxis
                  dataKey="timeKey"
                  tickFormatter={tickFormatter}
                  tick={{ fontSize: 11, fill: c.tick }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  labelFormatter={tickFormatter}
                  formatter={(value) => [`${value}%`, '강수확률']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', backgroundColor: c.tooltipBg, borderColor: c.tooltipBorder, color: c.tooltipText }}
                  labelStyle={{ color: c.tooltipText }}
                />
                {dateLines}
                <Bar dataKey="precipitation" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="precipitation"
                    position="top"
                    formatter={(v) => `${v}%`}
                    style={{ fontSize: 11, fill: c.label }}
                  />
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={chartMargin}>
                <defs>
                  <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={c.grid} />
                <XAxis
                  dataKey="timeKey"
                  tickFormatter={tickFormatter}
                  tick={{ fontSize: 11, fill: c.tick }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis hide domain={[0, 'dataMax + 2']} />
                <Tooltip
                  labelFormatter={tickFormatter}
                  formatter={(value) => [`${value} m/s`, '풍속']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', backgroundColor: c.tooltipBg, borderColor: c.tooltipBorder, color: c.tooltipText }}
                  labelStyle={{ color: c.tooltipText }}
                />
                {dateLines}
                <Area
                  type="monotone"
                  dataKey="windSpeed"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#windGrad)"
                >
                  <LabelList
                    dataKey="windSpeed"
                    position="top"
                    formatter={(v) => `${v}`}
                    style={{ fontSize: 11, fill: c.label }}
                  />
                </Area>
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
