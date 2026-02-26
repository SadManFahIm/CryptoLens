'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

const data = [
  { time: '10:00', price: 43000 },
  { time: '11:00', price: 43250 },
  { time: '12:00', price: 42980 },
  { time: '13:00', price: 43510 },
  { time: '14:00', price: 44100 }
]

export default function PriceChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

          <XAxis dataKey="time" tick={{ fill: '#888' }} tickLine={false} axisLine={false} />

          <YAxis
            domain={['dataMin - 200', 'dataMax + 200']}
            tick={{ fill: '#888' }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(20, 20, 20, 0.85)',
              borderRadius: 8,
              border: 'none',
              backdropFilter: 'blur(10px)'
            }}
          />

          <Line
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
