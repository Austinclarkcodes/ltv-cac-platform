import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard.jsx'
import BusinessCard from './components/BusinessCard.jsx'
import BusinessForm from './components/BusinessForm.jsx'
import { exportPDF } from './lib/pdfExport.js'
import { calculate } from './lib/calculations.js'

const STORAGE_KEY = 'ltv_cac_businesses_v1'

const SAMPLE_BUSINESSES = [
  {
    id: 'sample-1',
    name: 'D1 Arlington',
    portfolio: '45 Sports Holdings',
    annualRevenue: 780000,
    totalMembers: 310,
    newMembers: 72,
    grossProfitPct: 62,
    totalCOGS: 0,
    totalMarketingSpend: 14400,
    thirtyDayRevenue: 290,
    leadGenAutomated: true,
    conversionAutomated: false,
    deliveryAutomated: false,
  },
  {
    id: 'sample-2',
    name: 'D1 Bloomingdale',
    portfolio: '45 Sports Holdings',
    annualRevenue: 540000,
    totalMembers: 220,
    newMembers: 44,
    grossProfitPct: 58,
    totalCOGS: 0,
    totalMarketingSpend: 9200,
    thirtyDayRevenue: 240,
    leadGenAutomated: true,
    conversionAutomated: true,
    deliveryAutomated: false,
  },
  {
    id: 'sample-3',
    name: 'D1 Sandy Springs',
    portfolio: 'D1 Corporate',
    annualRevenue: 920000,
    totalMembers: 380,
    newMembers: 95,
    grossProfitPct: 65,
    totalCOGS: 0,
    totalMarketingSpend: 22000,
    thirtyDayRevenue: 310,
    leadGenAutomated: true,
    conversionAutomated: true,
    deliveryAutomated: true,
  },
]

const PORTFOLIOS = ['All Portfolios', '45 Sports Holdings', 'D1 Corporate', 'Consulting Clients', 'Other']

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000cc', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 16px', overflowY: 'auto',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: '#161b22',
        border: '1px solid #21262d',
        borderRadius: 8,
        width: '100%',
        maxWidth: 640,
        padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 18, color: '#e6edf3', letterSpacing: '0.06em', fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: '#8b949e',
            fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function HowItWorks() {
  const section = (n, title, children) => (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          background: '#C8102E',
          color: '#fff',
          fontFamily: "'Oswald', Arial Black, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          width: 32,
          height: 32,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>{n}</div>
        <h2 style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 18, color: '#e6edf3', fontWeight: 700, letterSpacing: '0.04em' }}>{title}</h2>
      </div>
      <div style={{ paddingLeft: 44 }}>{children}</div>
    </div>
  )

  const para = (text) => (
    <p style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 13, color: '#8b949e', lineHeight: 1.7, marginBottom: 10 }}>{text}</p>
  )

  const formula = (label, expr, note) => (
    <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: '12px 16px', marginBottom: 8 }}>
      <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 11, color: '#8b949e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 16, color: '#C8102E', fontStyle: 'italic' }}>{expr}</div>
      {note && <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 11, color: '#8b949e', marginTop: 6 }}>{note}</div>}
    </div>
  )

  const row = (cols) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 1, marginBottom: 1 }}>
      {cols.map((c, i) => (
        <div key={i} style={{
          background: '#0d1117',
          border: '1px solid #21262d',
          padding: '8px 12px',
          fontFamily: i === 0 ? "'Oswald', Arial Black, sans-serif" : "'Montserrat', Arial, sans-serif",
          fontSize: i === 0 ? 14 : 12,
          color: i === 0 ? '#e6edf3' : '#8b949e',
        }}>{c}</div>
      ))}
    </div>
  )

  const lever = (title, desc) => (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
      <div style={{
        background: '#C8102E22',
        border: '1px solid #C8102E44',
        color: '#C8102E',
        fontFamily: "'Oswald', Arial Black, sans-serif",
        fontSize: 11,
        padding: '3px 8px',
        borderRadius: 3,
        whiteSpace: 'nowrap',
        height: 'fit-content',
        marginTop: 1,
      }}>LEVER</div>
      <div>
        <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 13, color: '#e6edf3', marginBottom: 2 }}>{title}</div>
        <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 12, color: '#8b949e' }}>{desc}</div>
      </div>
    </div>
  )

  const source = (system, field, how) => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 140px 1fr', gap: 1, marginBottom: 1 }}>
      {[system, field, how].map((v, i) => (
        <div key={i} style={{
          background: '#0d1117',
          border: '1px solid #21262d',
          padding: '7px 10px',
          fontFamily: "'Montserrat', Arial, sans-serif",
          fontSize: 11,
          color: i === 0 ? '#58a6ff' : i === 1 ? '#C8102E' : '#8b949e',
        }}>{v}</div>
      ))}
    </div>
  )

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 0 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 28, color: '#e6edf3', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 8 }}>HOW IT WORKS</h1>
        <div style={{ height: 3, width: 48, background: '#C8102E', borderRadius: 2, marginBottom: 16 }} />
        <p style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 13, color: '#8b949e', lineHeight: 1.7 }}>
          This platform gives you a single economic health score for every business in your portfolio. Two numbers — LTGP and CAC — tell you whether you're building wealth or burning cash.
        </p>
      </div>

      {section(1, 'The Two Numbers That Run Everything',
        <>
          {para('Every business ultimately lives or dies by two metrics. Master these and you control your growth.')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#0d1117', border: '1px solid #1baf7a44', borderRadius: 6, padding: '16px' }}>
              <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 20, color: '#1baf7a', fontStyle: 'italic', marginBottom: 6 }}>LTGP</div>
              <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 11, color: '#8b949e', letterSpacing: '0.1em', marginBottom: 8 }}>LIFETIME GROSS PROFIT</div>
              <p style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>
                How much gross profit a single member generates over their lifetime with your business. This is the money you actually keep after delivering the service.
              </p>
            </div>
            <div style={{ background: '#0d1117', border: '1px solid #e3494844', borderRadius: 6, padding: '16px' }}>
              <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 20, color: '#e34948', fontStyle: 'italic', marginBottom: 6 }}>CAC</div>
              <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 11, color: '#8b949e', letterSpacing: '0.1em', marginBottom: 8 }}>CUSTOMER ACQUISITION COST</div>
              <p style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>
                What it costs you in marketing and sales to acquire one new paying member. Every dollar of ad spend, commissions, and promotion counts here.
              </p>
            </div>
          </div>
        </>
      )}

      {section(2, 'The Formulas',
        <>
          {para('These four calculations are the complete engine behind every number you see on this platform.')}
          {formula('Lifetime Revenue Per Member', 'Annual Revenue ÷ Total Members', 'Averages out revenue across your entire active member base for the year.')}
          {formula('Cost Per Member', 'Total COGS ÷ Total Members  (or  Revenue/Member × (1 − GP%))', 'Use actual COGS if you have them; otherwise derive from gross profit percentage.')}
          {formula('LTGP', 'Revenue/Member − Cost/Member', 'The net gross profit you keep per member. This is what funds growth.')}
          {formula('LTV:CAC Ratio', 'LTGP ÷ CAC', 'Your core health metric. Higher is better. See Section 3 for minimum targets.')}
        </>
      )}

      {section(3, 'Minimum Ratio by Automation Level',
        <>
          {para('Manual operations require higher ratios because your time is a hidden cost. Automate more to lower the threshold — and unlock faster scaling.')}
          <div style={{ marginBottom: 4 }}>
            {row(['Automation Level', 'Automated Systems', 'Minimum Ratio', 'Why'])}
            {row(['Fully Automated', 'Lead Gen + Conversion + Delivery', '3:1', 'Machine handles all — lean overhead'])}
            {row(['2 of 3 Automated', 'Any two systems', '6:1', 'One manual loop costs margin'])}
            {row(['1 of 3 Automated', 'Any one system', '9:1', 'Two manual loops — higher burn'])}
            {row(['Fully Manual', 'None automated', '12:1', 'All human — highest overhead risk'])}
          </div>
          {para('At "Excellent" (1.5× minimum), the platform recommends scaling ad spend. Below the minimum, fix the economics first.')}
        </>
      )}

      {section(4, 'How to Improve Your Ratio',
        <>
          {para('When your ratio is below target, you have 8 primary levers. Work top-to-bottom — the earlier levers have the highest leverage.')}
          {lever('Raise Prices', 'Most D1 locations are under-priced relative to the transformation they deliver. A 10% price increase with flat churn directly grows LTGP 10%+')}
          {lever('Add Upsells & Programs', 'Personal training, camps, nutrition — ancillary revenue from existing members has zero CAC. Pure LTGP improvement.')}
          {lever('Improve Close Rate', 'If your sales conversion is below 30%, fixing it cuts CAC without spending another dollar on ads.')}
          {lever('Cross-Sell to Existing Members', 'Refer-a-friend programs and family plans grow membership without proportional marketing spend.')}
          {lever('Front-Load Cash Flow', 'Offer annual/semi-annual memberships at a slight discount. Recover CAC in 30 days instead of 6+ months.')}
          {lever('Reduce COGS', 'Review staffing ratios, class sizes, and supply costs. Even a 5% COGS reduction can move the ratio significantly.')}
          {lever('Better Creative & Targeting', 'Improve ad creative quality and audience targeting to increase conversion rate and lower CPL before raising spend.')}
          {lever('Reduce CPMs via Platform Diversification', 'Spread spend across Meta, Google, TikTok, and organic. Relying on one channel creates fragility and inflated CPMs.')}
        </>
      )}

      {section(5, 'Where to Pull Your Data',
        <>
          {para('Every input field maps to a specific report in your existing tools. Here\'s the fastest path to populating each field.')}
          <div style={{ marginBottom: 4 }}>
            {row(['System', 'Field', 'Where to find it'])}
          </div>
          {source('QuickBooks Online', 'Annual Revenue', 'P&L Report → Total Income (export as CSV and upload above)')}
          {source('QuickBooks Online', 'Total COGS', 'P&L Report → Total Cost of Goods Sold row')}
          {source('MindBody / PushPress', 'Total Members', 'Reports → Active Members count for the period')}
          {source('MindBody / PushPress', 'New Members', 'Reports → New Clients / New Members for the period')}
          {source('GoHighLevel (GHL)', 'New Members', 'Pipeline view → Won/Converted stage count (export & upload)')}
          {source('GoHighLevel (GHL)', '30-Day Revenue', 'Pipeline → Avg deal value of converted contacts')}
          {source('Meta / Google Ads', 'Marketing Spend', 'All ad spend for the period — include agency fees if applicable')}
          {source('Your records', 'Gross Profit %', 'If you don\'t have COGS: (Revenue − Costs) ÷ Revenue × 100')}
        </>
      )}
    </div>
  )
}

export default function App() {
  const [businesses, setBusinesses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return SAMPLE_BUSINESSES
  })
  const [view, setView] = useState('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [portfolioFilter, setPortfolioFilter] = useState('All Portfolios')
  const [exportingPDF, setExportingPDF] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses)) } catch (e) {}
  }, [businesses])

  const addBusiness = (data) => {
    setBusinesses(prev => [...prev, { ...data, id: Date.now().toString() }])
    setShowForm(false)
  }

  const updateBusiness = (data) => {
    setBusinesses(prev => prev.map(b => b.id === data.id ? data : b))
    setEditTarget(null)
  }

  const removeBusiness = (id) => {
    setBusinesses(prev => prev.filter(b => b.id !== id))
  }

  const handleEdit = (b) => {
    setEditTarget(b)
    setView('businesses')
  }

  const filtered = businesses
    .filter(b => {
      const q = search.toLowerCase()
      return !q || b.name.toLowerCase().includes(q) || (b.portfolio || '').toLowerCase().includes(q)
    })
    .filter(b => portfolioFilter === 'All Portfolios' || b.portfolio === portfolioFilter)
    .sort((a, b) => {
      const ca = calculate(a)
      const cb = calculate(b)
      return cb.ratio - ca.ratio
    })

  const handleExportPDF = async () => {
    setExportingPDF(true)
    try { exportPDF(businesses) } catch (e) { alert('PDF export error: ' + e.message) }
    setExportingPDF(false)
  }

  const NAV = [
    { key: 'dashboard', label: 'DASHBOARD' },
    { key: 'businesses', label: 'BUSINESSES' },
    { key: 'howItWorks', label: 'HOW IT WORKS' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      {/* Top nav */}
      <div style={{ background: '#101820', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* D1 Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', marginRight: 28 }}>
            <div style={{
              background: '#C8102E',
              color: '#fff',
              fontFamily: "'Oswald', Arial Black, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              width: 36,
              height: 36,
              borderRadius: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>D1</div>
            <div>
              <div style={{ fontFamily: "'Oswald', Arial Black, sans-serif", fontSize: 14, color: '#e6edf3', fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1.1 }}>LTV:CAC</div>
              <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 9, color: '#888B8D', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Intelligence Platform</div>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ display: 'flex', flex: 1, gap: 0 }}>
            {NAV.map(n => (
              <button
                key={n.key}
                onClick={() => setView(n.key)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: view === n.key ? '2px solid #C8102E' : '2px solid transparent',
                  color: view === n.key ? '#e6edf3' : '#8b949e',
                  fontFamily: "'Oswald', Arial Black, sans-serif",
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  padding: '16px 14px 14px',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
              >{n.label}</button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF || businesses.length === 0}
              style={{
                background: 'transparent',
                border: '1px solid #21262d',
                color: '#8b949e',
                borderRadius: 4,
                padding: '7px 14px',
                fontFamily: "'Oswald', Arial Black, sans-serif",
                fontSize: 11,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >{exportingPDF ? 'EXPORTING...' : 'EXPORT PDF'}</button>
            <button
              onClick={() => { setEditTarget(null); setShowForm(true) }}
              style={{
                background: '#C8102E',
                border: 'none',
                color: '#fff',
                borderRadius: 4,
                padding: '7px 16px',
                fontFamily: "'Oswald', Arial Black, sans-serif",
                fontSize: 11,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >+ ADD BUSINESS</button>
          </div>
        </div>
        {/* Red accent line */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, #C8102E 0%, #C8102E44 60%, transparent 100%)' }} />
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {view === 'dashboard' && <Dashboard businesses={businesses} />}

        {view === 'businesses' && (
          <div>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search businesses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  background: '#161b22',
                  border: '1px solid #21262d',
                  borderRadius: 4,
                  color: '#e6edf3',
                  fontFamily: "'Montserrat', Arial, sans-serif",
                  fontSize: 13,
                  padding: '8px 12px',
                  outline: 'none',
                }}
              />
              <select
                value={portfolioFilter}
                onChange={e => setPortfolioFilter(e.target.value)}
                style={{
                  background: '#161b22',
                  border: '1px solid #21262d',
                  borderRadius: 4,
                  color: '#e6edf3',
                  fontFamily: "'Montserrat', Arial, sans-serif",
                  fontSize: 13,
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                {PORTFOLIOS.map(p => <option key={p}>{p}</option>)}
              </select>
              <div style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center' }}>
                {filtered.length} of {businesses.length} shown
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#8b949e', fontFamily: "'Montserrat', Arial, sans-serif" }}>
                  No businesses match your filter.
                </div>
              )}
              {filtered.map(b => (
                <BusinessCard key={b.id} business={b} onEdit={handleEdit} onRemove={removeBusiness} />
              ))}
            </div>
          </div>
        )}

        {view === 'howItWorks' && <HowItWorks />}
      </div>

      {/* Add modal */}
      {showForm && (
        <Modal title="ADD BUSINESS" onClose={() => setShowForm(false)}>
          <BusinessForm onSave={addBusiness} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal title="EDIT BUSINESS" onClose={() => setEditTarget(null)}>
          <BusinessForm initial={editTarget} onSave={updateBusiness} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}
    </div>
  )
}
