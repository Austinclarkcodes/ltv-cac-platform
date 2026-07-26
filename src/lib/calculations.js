export function calculate(inputs) {
  const {
    annualRevenue = 0,
    totalMembers = 1,
    newMembers = 1,
    grossProfitPct = 60,
    totalMarketingSpend = 0,
    totalCOGS = 0,
    thirtyDayRevenue = 0,
    leadGenAutomated = false,
    conversionAutomated = false,
    deliveryAutomated = false,
  } = inputs

  const gpFraction = grossProfitPct / 100
  const members = Math.max(totalMembers, 1)
  const leads = Math.max(newMembers, 1)

  const lifetimeRevPerMember = annualRevenue / members
  const costPerMember =
    totalCOGS > 0
      ? totalCOGS / members
      : lifetimeRevPerMember * (1 - gpFraction)

  const LTGP = lifetimeRevPerMember - costPerMember
  const CAC = totalMarketingSpend / leads
  const ratio = CAC > 0 ? LTGP / CAC : 0

  const thirtyDayLTGP = thirtyDayRevenue > 0 ? thirtyDayRevenue * gpFraction : null

  const automatedCount = [leadGenAutomated, conversionAutomated, deliveryAutomated].filter(Boolean).length
  const minRatio =
    automatedCount === 3 ? 3 :
    automatedCount === 2 ? 6 :
    automatedCount === 1 ? 9 : 12

  let status
  if (ratio >= minRatio * 1.5) status = 'excellent'
  else if (ratio >= minRatio) status = 'good'
  else if (ratio >= minRatio * 0.6) status = 'warning'
  else status = 'critical'

  let lever
  if (status === 'excellent') {
    lever = 'Scale ad spend — economics support aggressive growth'
  } else if (status === 'good') {
    lever = 'Maintain current mix; test incremental spend increases'
  } else if (status === 'warning') {
    lever = 'Improve front-end offer or reduce CPMs before scaling'
  } else {
    lever = 'Fix pricing/upsell before increasing ad spend'
  }

  const effectiveGP =
    totalCOGS > 0
      ? ((lifetimeRevPerMember - costPerMember) / lifetimeRevPerMember) * 100
      : grossProfitPct

  return {
    lifetimeRevPerMember,
    costPerMember,
    LTGP,
    CAC,
    ratio,
    thirtyDayLTGP,
    automatedCount,
    minRatio,
    status,
    lever,
    effectiveGP,
  }
}

export function getStatusColor(status) {
  const map = {
    excellent: '#1baf7a',
    good: '#58a6ff',
    warning: '#eda100',
    critical: '#e34948',
  }
  return map[status] || '#888B8D'
}

export function getStatusLabel(status) {
  const map = {
    excellent: 'EXCELLENT',
    good: 'ON TARGET',
    warning: 'AT RISK',
    critical: 'CRITICAL',
  }
  return map[status] || status.toUpperCase()
}
