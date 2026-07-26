import React, { useState } from 'react'
import { calculate, getStatusColor } from '../lib/calculations.js'
import StatusBadge from './StatusBadge.jsx'

function fmt(n, prefix = '$') {
  if (!isFinite(n) || isNaN(n) || n === 0) return '—'
  return prefix + Math.round(n).toLocaleString()
}

function fmtRatio(n) {
  if (!isFinite(n) || isNaN(n)) return '—'
  return n.toFixed(1) + ':1'
}

function MetricBox({ label, value, highlight, sub }) {
  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid #21262d',
      borderRadius: 6,
      padding: '12px 16px',
      minWidth: 110,
      flex: 1,
    }}>
      <div style={{
        fontFamily: "'Oswald', Arial Black, sans-serif",
        fontSize: 22,
        fontWeight: 700,
        fontStyle: highlight ? 'italic' : 'normal',
        color: highlight || '#e6edf3',
        lineHeight: 1.1,
      }}>{value}</div>
      <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 10, color: '#8b949e', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      {sub && <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 10, color: '#8b949e', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function AutoTag({ label, active }) {
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: "'Montserrat', Arial, sans-serif",
      fontSize: 10,
      padding: '2px 8px',
      borderRadius: 3,
      background: active ? '#1baf7a22' : '#21262d',
      color: active ? '#1baf7a' : '#8b949e',
      border: `1px solid ${active ? '#1baf7a44' : '#21262d'}`,
      marginRight: 4,
    }}>{active ? '✓' : '✗'} {label}</span>
  )
}

export default function BusinessCard({ business, onEdit, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const c = calculate(business)
  const statusColor = getStatusColor(c.status)

  return (
    <div style={{
      background: '#161b22',
      border: `1px solid #21262d`,
      borderLeft: `3px solid ${statusColor}`,
      borderRadius: 6,
      overflow: 'hidden',
      transition: 'box-shadow 0.15s',
    }}>
      {/* Collapsed header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 18px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Ratio badge */}
        <div style={{
          fontFamily: "'Oswald', Arial Black, sans-serif",
          fontSize: 24,
          fontWeight: 700,
          fontStyle: 'italic',
          color: statusColor,
          minWidth: 72,
          lineHeight: 1,
        }}>
          {fmtRatio(c.ratio)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: "'Oswald', Arial Black, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: '#e6edf3',
              letterSpacing: '0.04em',
            }}>{business.name}</span>
            <StatusBadge status={c.status} size="sm" />
            <span style={{
              fontFamily: "'Montserrat', Arial, sans-serif",
              fontSize: 10,
              color: '#8b949e',
              background: '#21262d',
              borderRadius: 3,
              padding: '1px 6px',
            }}>{business.portfolio}</span>
          </div>
          <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 12, color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.lever}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 13, color: '#8b949e', letterSpacing: '0.04em' }}>
              MIN {c.minRatio}:1
            </div>
            <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 11, color: '#8b949e' }}>
              {c.automatedCount}/3 automated
            </div>
          </div>
          <div style={{
            color: '#8b949e',
            fontSize: 16,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            lineHeight: 1,
          }}>▾</div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid #21262d' }}>
          <div style={{ marginTop: 14, marginBottom: 14 }}>
            {/* Primary metrics */}
            <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 10, color: '#8b949e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Primary Metrics</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <MetricBox label="LTGP / Member" value={fmt(c.LTGP)} highlight={statusColor} />
              <MetricBox label="CAC" value={fmt(c.CAC)} />
              <MetricBox label="LTV:CAC Ratio" value={fmtRatio(c.ratio)} highlight={statusColor} sub={`Min: ${c.minRatio}:1`} />
              {c.thirtyDayLTGP !== null && (
                <MetricBox label="30-Day LTGP" value={fmt(c.thirtyDayLTGP)} highlight="#58a6ff" />
              )}
            </div>
          </div>

          {/* Secondary metrics */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 10, color: '#8b949e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Business Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
              {[
                { label: 'Revenue / Member', value: fmt(c.lifetimeRevPerMember) },
                { label: 'COGS / Member', value: fmt(c.costPerMember) },
                { label: 'Gross Profit %', value: c.effectiveGP.toFixed(1) + '%' },
                { label: 'Annual Revenue', value: fmt(business.annualRevenue) },
                { label: 'Total Members', value: (business.totalMembers || 0).toLocaleString() },
                { label: 'New Members', value: (business.newMembers || 0).toLocaleString() },
              ].map(m => (
                <div key={m.label} style={{
                  background: '#0d1117',
                  border: '1px solid #21262d',
                  borderRadius: 4,
                  padding: '8px 12px',
                }}>
                  <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>{m.value}</div>
                  <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 10, color: '#8b949e', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 30-day cash flow bar */}
          {c.thirtyDayLTGP !== null && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 10, color: '#8b949e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>30-Day Cash Flow vs CAC</div>
              {(() => {
                const profitable = c.thirtyDayLTGP >= c.CAC
                const pct = c.CAC > 0 ? Math.min((c.thirtyDayLTGP / c.CAC) * 100, 100) : 0
                return (
                  <div>
                    <div style={{
                      background: '#0d1117',
                      border: `1px solid ${profitable ? '#1baf7a44' : '#e3494844'}`,
                      borderRadius: 4,
                      padding: '8px 12px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, fontFamily: "'Montserrat', Arial, sans-serif" }}>
                        <span style={{ color: '#8b949e' }}>30-Day LTGP covers {pct.toFixed(0)}% of CAC</span>
                        <span style={{ color: profitable ? '#1baf7a' : '#e34948', fontWeight: 600 }}>
                          {profitable ? '✓ Cash Flow Positive' : '✗ Deficit: ' + fmt(c.CAC - c.thirtyDayLTGP)}
                        </span>
                      </div>
                      <div style={{ height: 6, background: '#21262d', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: pct + '%',
                          background: profitable ? '#1baf7a' : '#e34948',
                          borderRadius: 3,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Automation tags */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 10, color: '#8b949e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Automation Level</div>
            <div>
              <AutoTag label="Lead Gen" active={business.leadGenAutomated} />
              <AutoTag label="Conversion" active={business.conversionAutomated} />
              <AutoTag label="Delivery" active={business.deliveryAutomated} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onEdit(business)}
              style={{
                background: 'transparent',
                border: '1px solid #21262d',
                color: '#8b949e',
                borderRadius: 4,
                padding: '7px 16px',
                fontFamily: "'Oswald', Arial Black, sans-serif",
                fontSize: 12,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >EDIT</button>
            <button
              onClick={() => {
                if (window.confirm(`Remove ${business.name}?`)) onRemove(business.id)
              }}
              style={{
                background: 'transparent',
                border: '1px solid #e3494844',
                color: '#e34948',
                borderRadius: 4,
                padding: '7px 16px',
                fontFamily: "'Oswald', Arial Black, sans-serif",
                fontSize: 12,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >REMOVE</button>
          </div>
        </div>
      )}
    </div>
  )
}
