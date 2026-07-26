import Papa from 'papaparse'
import * as XLSX from 'xlsx'

function normalizeHeader(h) {
  return String(h).toLowerCase().trim().replace(/[\s_\-\/]+/g, '')
}

function parseRows(rows) {
  if (!rows || rows.length === 0) return { source: 'empty', fields: {}, message: 'No data found in file.' }

  const headers = Object.keys(rows[0]).map(h => ({ original: h, normalized: normalizeHeader(h) }))
  const norm = h => normalizeHeader(h)

  // --- QBO P&L detection ---
  const hasAccount = headers.some(h => h.normalized.includes('account'))
  const hasTotal = headers.some(h => h.normalized.includes('total') || h.normalized.includes('amount'))
  if (hasAccount && hasTotal) {
    return parseQBO(rows, headers)
  }

  // --- GHL pipeline detection ---
  const hasPipeline = headers.some(h => h.normalized.includes('pipeline') || h.normalized.includes('stage') || h.normalized.includes('contact'))
  if (hasPipeline) {
    return parseGHL(rows, headers)
  }

  // --- Generic CSV ---
  return parseGeneric(rows, headers)
}

function parseQBO(rows, headers) {
  const fields = {}
  const totalCol = headers.find(h => h.normalized.includes('total') || h.normalized.includes('amount'))
  const accountCol = headers.find(h => h.normalized.includes('account'))

  if (!totalCol || !accountCol) return { source: 'qbo', fields, message: 'Could not find Account/Total columns.' }

  for (const row of rows) {
    const label = String(row[accountCol.original] || '').toLowerCase()
    const val = parseFloat(String(row[totalCol.original] || '').replace(/[^0-9.\-]/g, ''))
    if (isNaN(val)) continue

    if (label.includes('total income') || label.includes('total revenue') || label.includes('gross revenue')) {
      fields.annualRevenue = val
    }
    if (label.includes('total cost') || label.includes('total cogs') || label.includes('cost of goods')) {
      fields.totalCOGS = val
    }
  }

  return {
    source: 'QBO P&L',
    fields,
    message: `Detected QBO P&L export. Mapped: ${Object.keys(fields).join(', ') || 'no fields matched'}.`,
  }
}

function parseGHL(rows, headers) {
  const fields = {}
  const stageCol = headers.find(h => h.normalized.includes('stage') || h.normalized.includes('status'))
  const valueCol = headers.find(h => h.normalized.includes('value') || h.normalized.includes('amount') || h.normalized.includes('revenue'))

  const wonRows = rows.filter(row => {
    if (!stageCol) return false
    const stage = String(row[stageCol.original] || '').toLowerCase()
    return stage.includes('won') || stage.includes('closed') || stage.includes('converted') || stage.includes('active')
  })

  fields.newMembers = wonRows.length

  if (valueCol && wonRows.length > 0) {
    const vals = wonRows.map(r => parseFloat(String(r[valueCol.original] || '').replace(/[^0-9.\-]/g, ''))).filter(v => !isNaN(v))
    if (vals.length > 0) {
      fields.thirtyDayRevenue = vals.reduce((a, b) => a + b, 0) / vals.length
    }
  }

  return {
    source: 'GHL Pipeline',
    fields,
    message: `Detected GHL pipeline export. Found ${fields.newMembers} won/converted contacts.`,
  }
}

const ALIASES = {
  annualRevenue: ['annualrevenue', 'revenue', 'totalrevenue', 'annualrev', 'grossrevenue', 'sales', 'totalsales'],
  totalMembers: ['totalmembers', 'members', 'totalclients', 'clients', 'customers', 'activemembers'],
  newMembers: ['newmembers', 'newclients', 'newcustomers', 'newleads', 'acquisitions', 'membersacquired'],
  grossProfitPct: ['grossprofitpct', 'grossprofitpercent', 'gp%', 'gpercent', 'grossmargin', 'marginpct'],
  totalCOGS: ['totalcogs', 'cogs', 'costofgoods', 'directcosts', 'variablecosts'],
  totalMarketingSpend: ['totalmarketingspend', 'marketingspend', 'adspend', 'marketingcost', 'advertising'],
  thirtyDayRevenue: ['30dayrevenue', 'thirtyDayRevenue', 'firstmonthrevenue', 'initialrevenue', 'frontendrevenue'],
}

function parseGeneric(rows, headers) {
  const fields = {}
  const row = rows[0]

  for (const [field, aliases] of Object.entries(ALIASES)) {
    const match = headers.find(h => aliases.includes(h.normalized))
    if (match) {
      const val = parseFloat(String(row[match.original] || '').replace(/[^0-9.\-]/g, ''))
      if (!isNaN(val)) fields[field] = val
    }
  }

  return {
    source: 'Generic CSV',
    fields,
    message: `Generic CSV. Mapped: ${Object.keys(fields).join(', ') || 'no columns matched — check headers'}.`,
  }
}

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => resolve(parseRows(results.data)),
        error: err => reject(err),
      })
    })
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
    return parseRows(rows)
  }

  throw new Error('Unsupported file type. Please upload a CSV or Excel file.')
}
