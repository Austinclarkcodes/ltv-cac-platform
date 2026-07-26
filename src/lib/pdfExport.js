import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calculate, getStatusLabel } from './calculations.js'

const COLORS = {
  black: [16, 24, 32],
  red: [200, 16, 46],
  gray: [136, 139, 141],
  white: [255, 255, 255],
  excellent: [27, 175, 122],
  good: [88, 166, 255],
  warning: [237, 161, 0],
  critical: [227, 73, 72],
  surface: [22, 27, 34],
  border: [33, 38, 45],
}

function fmt(n, prefix = '$') {
  if (!isFinite(n) || isNaN(n)) return '—'
  return prefix + Math.round(n).toLocaleString()
}

function fmtRatio(n) {
  if (!isFinite(n) || isNaN(n)) return '—'
  return n.toFixed(1) + ':1'
}

function statusColor(status) {
  return COLORS[status] || COLORS.gray
}

export function exportPDF(businesses, date = new Date()) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Header bar
  doc.setFillColor(...COLORS.black)
  doc.rect(0, 0, pw, 52, 'F')

  // Red accent line
  doc.setFillColor(...COLORS.red)
  doc.rect(0, 52, pw, 3, 'F')

  // D1 badge
  doc.setFillColor(...COLORS.red)
  doc.roundedRect(20, 10, 32, 32, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...COLORS.white)
  doc.text('D1', 36, 31, { align: 'center' })

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...COLORS.white)
  doc.text('LTV:CAC INTELLIGENCE PLATFORM', 62, 24)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.gray)
  doc.text(`D1 Training Portfolio Report  •  Generated ${dateStr}`, 62, 38)

  // KPI summary row
  const calcs = businesses.map(b => ({ b, c: calculate(b) }))
  const totalRev = businesses.reduce((s, b) => s + (b.annualRevenue || 0), 0)
  const avgRatio = calcs.length > 0 ? calcs.reduce((s, { c }) => s + c.ratio, 0) / calcs.length : 0
  const criticalCount = calcs.filter(({ c }) => c.status === 'critical' || c.status === 'warning').length
  const excellentCount = calcs.filter(({ c }) => c.status === 'excellent').length

  const kpis = [
    { label: 'PORTFOLIO REVENUE', value: fmt(totalRev) },
    { label: 'AVG LTV:CAC RATIO', value: fmtRatio(avgRatio) },
    { label: 'NEEDS ATTENTION', value: String(criticalCount) },
    { label: 'EXCELLENT', value: String(excellentCount) },
  ]

  const kpiW = pw / 4
  kpis.forEach((kpi, i) => {
    const x = i * kpiW
    doc.setFillColor(...COLORS.surface)
    doc.rect(x, 55, kpiW, 44, 'F')
    doc.setDrawColor(...COLORS.border)
    doc.rect(x, 55, kpiW, 44, 'S')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...COLORS.red)
    doc.text(kpi.value, x + kpiW / 2, 77, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.gray)
    doc.text(kpi.label, x + kpiW / 2, 90, { align: 'center' })
  })

  // Table
  const sorted = [...calcs].sort((a, b) => b.c.ratio - a.c.ratio)

  const tableBody = sorted.map(({ b, c }, i) => [
    `${i + 1}. ${b.name}`,
    b.portfolio || '—',
    fmt(c.LTGP),
    fmt(c.CAC),
    fmtRatio(c.ratio),
    `${c.minRatio}:1`,
    getStatusLabel(c.status),
    c.lever,
  ])

  autoTable(doc, {
    startY: 104,
    head: [['Business', 'Portfolio', 'LTGP', 'CAC', 'Ratio', 'Min Target', 'Status', 'Key Lever']],
    body: tableBody,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 6,
      textColor: [230, 237, 243],
      fillColor: [22, 27, 34],
      lineColor: [33, 38, 45],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: COLORS.black,
      textColor: COLORS.gray,
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: { fillColor: [16, 20, 26] },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 90 },
      2: { cellWidth: 60 },
      3: { cellWidth: 60 },
      4: { cellWidth: 50 },
      5: { cellWidth: 55 },
      6: { cellWidth: 60 },
      7: { cellWidth: 'auto' },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const status = sorted[data.row.index]?.c?.status
        if (status) {
          const col = statusColor(status)
          doc.setTextColor(...col)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(7)
          doc.text(getStatusLabel(status), data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 2.5, { align: 'center' })
        }
      }
    },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...COLORS.black)
    doc.rect(0, ph - 22, pw, 22, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.gray)
    doc.text('D1 Training — LTV:CAC Intelligence Platform — Confidential', 20, ph - 8)
    doc.text(`Page ${i} of ${pageCount}`, pw - 20, ph - 8, { align: 'right' })
  }

  doc.save(`D1-LTV-CAC-Report-${date.toISOString().split('T')[0]}.pdf`)
}
