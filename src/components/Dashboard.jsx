import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import { calculate, getStatusColor, getStatusLabel } from '../lib/calculations.js'
import StatusBadge from './StatusBadge.jsx'

function fmt(n, prefix = '$') {
  if (!isFinite(n) || isNaN(n) || n === 0) return '—'
  if (n >= 1000000) return prefix + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return prefix + (n / 1000).toFixed(0) + 'K'
  return prefix + Math.round(n).toLocaleString()
}

function fmtRatio(n) {
  if (!isFinite(n) || isNaN(n)) return '—'
  return n.toFixed(1) + ':1'
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #21262d',
      borderRadius: 6,
      padding: '18px 20px',
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{
        fontFamily: "'Oswald', Arial Black, sans-serif",
        fontSize: 32,
        fontWeight: 700,
        fontStyle: 'italic',
        color: accent || '#e6edf3',
        lineHeight: 1.1,
      }}>{value}</div>
      <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 11, color: '#8b949e', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
      {sub && <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 11, color: '#8b949e', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div style={{
        background: '#161b22',
        border: '1px solid #21262d',
        borderRadius: 6,
        padding: '10px 14px',
        fontFamily: "'Montserrat', Arial, sans-serif",
        fontSize: 12,
      }}>
        <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 14, color: '#e6edf3', marginBottom: 4 }}>{d.name}</div>
        <div style={{ color: getStatusColor(d.status) }}>Ratio: {fmtRatio(d.ratio)}</div>
        <div style={{ color: '#8b949e' }}>Min: {d.minRatio}:1</div>
        <div style={{ color: '#8b949e' }}>CAC: {fmt(d.cac)}</div>
        <div style={{ color: '#8b949e' }}>LTGP: {fmt(d.ltgp)}</div>
      </div>
    )
  }
  return null
}

export default function Dashboard({ businesses }) {
  if (businesses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b949e', fontFamily: "'Montserrat', Arial, sans-serif" }}>
        <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 20, color: '#21262d', marginBottom: 8 }}>NO BUSINESSES YET</div>
        <div>Add your first business to see dashboard analytics.</div>
      </div>
    )
  }

  const calcs = businesses.map(b => ({ b, c: calculate(b) }))
  const totalRev = businesses.reduce((s, b) => s + (b.annualRevenue || 0), 0)
  const avgRatio = calcs.reduce((s, { c }) => s + c.ratio, 0) / calcs.length
  const critCount = calcs.filter(({ c }) => c.status === 'critical').length
  const warnCount = calcs.filter(({ c }) => c.status === 'warning').length
  const excCount = calcs.filter(({ c }) => c.status === 'excellent').length

  const chartData = [...calcs]
    .sort((a, b) => b.c.ratio - a.c.ratio)
    .map(({ b, c }) => ({
      name: b.name.length > 16 ? b.name.slice(0, 14) + '…' : b.name,
      fullName: b.name,
      ratio: parseFloat(c.ratio.toFixed(2)),
      status: c.status,
      minRatio: c.minRatio,
      cac: c.CAC,
      ltgp: c.LTGP,
    }))

  // Portfolio summaries
  const portfolioMap = {}
  calcs.forEach(({ b, c }) => {
    const p = b.portfolio || 'Other'
    if (!portfolioMap[p]) portfolioMap[p] = { totalRev: 0, ratios: [], count: 0 }
    portfolioMap[p].totalRev += b.annualRevenue || 0
    portfolioMap[p].ratios.push(c.ratio)
    portfolioMap[p].count++
  })

  const sortedLeaderboard = [...calcs].sort((a, b) => b.c.ratio - a.c.ratio)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard label="Total Portfolio Revenue" value={fmt(totalRev)} accent="#e6edf3" />
        <KpiCard label="Avg LTV:CAC Ratio" value={fmtRatio(avgRatio)} accent={getStatusColor(avgRatio >= 6 ? 'excellent' : avgRatio >= 3 ? 'good' : 'warning')} />
        <KpiCard label="Critical / At Risk" value={critCount + warnCount} accent={critCount + warnCount > 0 ? '#e34948' : '#1baf7a'} sub={`${critCount} critical, ${warnCount} at risk`} />
        <KpiCard label="Excellent" value={excCount} accent={excCount > 0 ? '#1baf7a' : '#8b949e'} sub={`of ${businesses.length} businesses`} />
      </div>

      {/* Bar Chart */}
      <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 6, padding: '20px 20px 12px' }}>
        <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 14, color: '#8b949e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          LTV:CAC RATIO BY BUSINESS
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#8b949e', fontSize: 10, fontFamily: 'Montserrat, Arial, sans-serif' }}
              axisLine={{ stroke: '#21262d' }}
              tickLine={false}
              angle={-35}
              textAnchor="end"
            />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 10, fontFamily: 'Montserrat, Arial, sans-serif' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v + ':1'}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <ReferenceLine y={3} stroke="#C8102E" strokeDasharray="4 4" label={{ value: '3:1 Min', fill: '#C8102E', fontSize: 10, fontFamily: 'Montserrat' }} />
            <Bar dataKey="ratio" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getStatusColor(entry.status)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leaderboard Table */}
      <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #21262d' }}>
          <span style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 14, color: '#8b949e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            PORTFOLIO LEADERBOARD
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0d1117' }}>
                {['#', 'Business', 'Portfolio', 'LTGP', 'CAC', 'Ratio', 'Min Target', 'Status', 'Key Lever'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontFamily: "'Oswald', Arial Black, sans-serif",
                    fontSize: 10,
                    color: '#8b949e',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #21262d',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map(({ b, c }, i) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #21262d', background: i % 2 === 0 ? 'transparent' : '#0d111722' }}>
                  <td style={{ padding: '11px 14px', fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 13, color: '#8b949e' }}>{i + 1}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 14, color: '#e6edf3', whiteSpace: 'nowrap' }}>{b.name}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 11, color: '#8b949e', whiteSpace: 'nowrap' }}>{b.portfolio}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 14, color: '#e6edf3' }}>{fmt(c.LTGP)}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 14, color: '#e6edf3' }}>{fmt(c.CAC)}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 15, fontWeight: 700, fontStyle: 'italic', color: getStatusColor(c.status) }}>{fmtRatio(c.ratio)}</td>
                  <td style={{ padding: '11px 14px', fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 13, color: '#8b949e' }}>{c.minRatio}:1</td>
                  <td style={{ padding: '11px 14px' }}><StatusBadge status={c.status} size="sm" /></td>
                  <td style={{ padding: '11px 14px', fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 11, color: '#8b949e', minWidth: 200 }}>{c.lever}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portfolio Group Cards */}
      <div>
        <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 14, color: '#8b949e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          BY PORTFOLIO
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(portfolioMap).map(([name, data]) => {
            const avgR = data.ratios.reduce((a, b) => a + b, 0) / data.ratios.length
            const statusC = avgR >= 9 ? 'excellent' : avgR >= 6 ? 'good' : avgR >= 3 ? 'warning' : 'critical'
            return (
              <div key={name} style={{
                background: '#161b22',
                border: '1px solid #21262d',
                borderTop: `2px solid ${getStatusColor(statusC)}`,
                borderRadius: 6,
                padding: '16px 20px',
                minWidth: 180,
                flex: 1,
              }}>
                <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 13, color: '#e6edf3', marginBottom: 10, letterSpacing: '0.04em' }}>{name}</div>
                <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 26, fontWeight: 700, fontStyle: 'italic', color: getStatusColor(statusC), marginBottom: 4 }}>
                  {fmtRatio(avgR)}
                </div>
                <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Ratio</div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #21262d' }}>
                  <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 16, color: '#e6edf3' }}>{fmt(data.totalRev)}</div>
                  <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Revenue · {data.count} {data.count === 1 ? 'business' : 'businesses'}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
