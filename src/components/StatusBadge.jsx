import React from 'react'
import { getStatusColor, getStatusLabel } from '../lib/calculations.js'

export default function StatusBadge({ status, size = 'md' }) {
  const color = getStatusColor(status)
  const label = getStatusLabel(status)

  const sizes = {
    sm: { fontSize: 9, padding: '2px 7px', letterSpacing: '0.08em' },
    md: { fontSize: 10, padding: '3px 10px', letterSpacing: '0.1em' },
    lg: { fontSize: 12, padding: '4px 14px', letterSpacing: '0.12em' },
  }

  const s = sizes[size] || sizes.md

  return (
    <span style={{
      display: 'inline-block',
      background: color + '22',
      color,
      border: `1px solid ${color}55`,
      borderRadius: 3,
      fontFamily: "'Oswald', Arial Black, sans-serif",
      fontWeight: 700,
      fontSize: s.fontSize,
      padding: s.padding,
      letterSpacing: s.letterSpacing,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}
