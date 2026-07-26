import React, { useState, useRef, useCallback } from 'react'
import { parseFile } from '../lib/fileParser.js'

const PORTFOLIOS = ['45 Sports Holdings', 'D1 Corporate', 'Consulting Clients', 'Other']

const INPUT_STYLE = {
  width: '100%',
  background: '#0d1117',
  border: '1px solid #21262d',
  borderRadius: 4,
  color: '#e6edf3',
  fontFamily: "'Montserrat', Arial, sans-serif",
  fontSize: 13,
  padding: '8px 10px',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const LABEL_STYLE = {
  display: 'block',
  fontFamily: "'Montserrat', Arial, sans-serif",
  fontSize: 11,
  color: '#8b949e',
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

function Field({ label, name, value, onChange, type = 'number', required, placeholder, step }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={LABEL_STYLE}>{label}{required && <span style={{ color: '#C8102E' }}> *</span>}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        required={required}
        style={{ ...INPUT_STYLE, borderColor: focused ? '#C8102E' : '#21262d' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

const EMPTY = {
  name: '',
  portfolio: '45 Sports Holdings',
  annualRevenue: '',
  totalMembers: '',
  newMembers: '',
  grossProfitPct: 60,
  totalCOGS: '',
  totalMarketingSpend: '',
  thirtyDayRevenue: '',
  leadGenAutomated: false,
  conversionAutomated: false,
  deliveryAutomated: false,
}

function calcMinRatio(lead, conv, del) {
  const count = [lead, conv, del].filter(Boolean).length
  return count === 3 ? 3 : count === 2 ? 6 : count === 1 ? 9 : 12
}

export default function BusinessForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : { ...EMPTY })
  const [parseMsg, setParseMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    set(name, type === 'checkbox' ? checked : value)
  }

  const processFile = useCallback(async (file) => {
    try {
      const result = await parseFile(file)
      setParseMsg(`✓ ${result.source}: ${result.message}`)
      setForm(f => ({ ...f, ...Object.fromEntries(Object.entries(result.fields).map(([k, v]) => [k, String(v)])) }))
    } catch (err) {
      setParseMsg(`✗ ${err.message}`)
    }
  }, [])

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) processFile(file)
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleSubmit = e => {
    e.preventDefault()
    setSaving(true)
    const out = {
      ...form,
      annualRevenue: parseFloat(form.annualRevenue) || 0,
      totalMembers: parseFloat(form.totalMembers) || 0,
      newMembers: parseFloat(form.newMembers) || 0,
      grossProfitPct: parseFloat(form.grossProfitPct) || 60,
      totalCOGS: parseFloat(form.totalCOGS) || 0,
      totalMarketingSpend: parseFloat(form.totalMarketingSpend) || 0,
      thirtyDayRevenue: parseFloat(form.thirtyDayRevenue) || 0,
    }
    onSave(out)
    setSaving(false)
  }

  const minRatio = calcMinRatio(form.leadGenAutomated, form.conversionAutomated, form.deliveryAutomated)
  const automatedCount = [form.leadGenAutomated, form.conversionAutomated, form.deliveryAutomated].filter(Boolean).length

  const sectionHeader = (text) => (
    <div style={{
      fontFamily: "'Oswald', Arial Black, sans-serif",
      fontSize: 11,
      color: '#8b949e',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      borderBottom: '1px solid #21262d',
      paddingBottom: 6,
      marginBottom: 14,
      marginTop: 20,
    }}>{text}</div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {sectionHeader('Business Info')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={LABEL_STYLE}>Business Name <span style={{ color: '#C8102E' }}>*</span></label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g. D1 Arlington"
            style={{ ...INPUT_STYLE, borderColor: '#21262d' }}
            onFocus={e => e.target.style.borderColor = '#C8102E'}
            onBlur={e => e.target.style.borderColor = '#21262d'}
          />
        </div>
        <div>
          <label style={LABEL_STYLE}>Portfolio</label>
          <select
            name="portfolio"
            value={form.portfolio}
            onChange={handleChange}
            style={{ ...INPUT_STYLE, cursor: 'pointer' }}
          >
            {PORTFOLIOS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {sectionHeader('Import Data (Optional)')}
      <div
        onClick={() => fileRef.current.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? '#C8102E' : '#21262d'}`,
          borderRadius: 6,
          padding: '18px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? '#C8102E11' : '#0d1117',
          transition: 'all 0.15s',
          marginBottom: 8,
        }}
      >
        <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 13, color: '#8b949e', marginBottom: 4 }}>
          DROP CSV / EXCEL FILE HERE
        </div>
        <div style={{ fontSize: 11, color: '#8b949e' }}>Auto-detects QBO P&L, GHL Pipeline, or Generic CSV</div>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>
      {parseMsg && (
        <div style={{
          fontSize: 11,
          color: parseMsg.startsWith('✓') ? '#1baf7a' : '#e34948',
          background: parseMsg.startsWith('✓') ? '#1baf7a11' : '#e3494811',
          border: `1px solid ${parseMsg.startsWith('✓') ? '#1baf7a33' : '#e3494833'}`,
          borderRadius: 4,
          padding: '6px 10px',
          marginBottom: 8,
          fontFamily: "'Montserrat', Arial, sans-serif",
        }}>{parseMsg}</div>
      )}

      {sectionHeader('Revenue & Members')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Annual Revenue ($)" name="annualRevenue" value={form.annualRevenue} onChange={handleChange} required placeholder="500000" />
        <Field label="Total Members" name="totalMembers" value={form.totalMembers} onChange={handleChange} required placeholder="200" />
        <Field label="New Members (period)" name="newMembers" value={form.newMembers} onChange={handleChange} required placeholder="50" />
      </div>

      {sectionHeader('Costs & Marketing')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Gross Profit %" name="grossProfitPct" value={form.grossProfitPct} onChange={handleChange} step="0.1" placeholder="60" />
        <Field label="Total COGS ($) — overrides GP%" name="totalCOGS" value={form.totalCOGS} onChange={handleChange} placeholder="Leave blank to use GP%" />
        <Field label="Total Marketing Spend ($)" name="totalMarketingSpend" value={form.totalMarketingSpend} onChange={handleChange} required placeholder="10000" />
      </div>

      {sectionHeader('30-Day Cash Flow (Optional)')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
        <Field label="Avg Revenue / Member First 30 Days ($)" name="thirtyDayRevenue" value={form.thirtyDayRevenue} onChange={handleChange} placeholder="250" />
      </div>

      {sectionHeader('Automation Level')}
      <div style={{ display: 'flex', gap: 24, marginBottom: 8, flexWrap: 'wrap' }}>
        {[
          { key: 'leadGenAutomated', label: 'Lead Generation' },
          { key: 'conversionAutomated', label: 'Conversion' },
          { key: 'deliveryAutomated', label: 'Delivery' },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 13, color: '#e6edf3' }}>
            <input
              type="checkbox"
              name={key}
              checked={form[key]}
              onChange={handleChange}
              style={{ accentColor: '#C8102E', width: 15, height: 15 }}
            />
            {label} Automated
          </label>
        ))}
      </div>
      <div style={{
        background: '#0d1117',
        border: '1px solid #21262d',
        borderRadius: 4,
        padding: '8px 12px',
        marginBottom: 20,
        fontSize: 12,
        color: '#8b949e',
        fontFamily: "'Montserrat', Arial, sans-serif",
      }}>
        <span style={{ color: '#e6edf3' }}>{automatedCount}/3 automated</span>
        {' — '}Minimum LTV:CAC target:{' '}
        <span style={{ color: '#C8102E', fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 14, fontWeight: 700 }}>
          {minRatio}:1
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: '1px solid #21262d',
            color: '#8b949e',
            borderRadius: 4,
            padding: '9px 20px',
            fontFamily: "'Oswald', Arial Black, sans-serif",
            fontSize: 13,
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: '#C8102E',
            border: 'none',
            color: '#fff',
            borderRadius: 4,
            padding: '9px 24px',
            fontFamily: "'Oswald', Arial Black, sans-serif",
            fontSize: 13,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          {saving ? 'SAVING...' : initial ? 'UPDATE BUSINESS' : 'ADD BUSINESS'}
        </button>
      </div>
    </form>
  )
}
