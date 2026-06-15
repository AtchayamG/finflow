import { describe, expect, it } from 'vitest'

import {
  buildDashboardMetrics,
  filterCases,
  formatCurrency,
  stageSequence,
} from './workflow'
import { demoCases } from '../data/demoCases'

describe('workflow view model', () => {
  it('derives dashboard metrics from case state', () => {
    const metrics = buildDashboardMetrics(demoCases)

    expect(metrics.activeCases).toBe(4)
    expect(metrics.exceptions).toBe(1)
    expect(metrics.humanApprovals).toBe(2)
    expect(metrics.completed).toBe(1)
  })

  it('filters cases by stage and search text', () => {
    const matches = filterCases(demoCases, {
      query: 'priya',
      stage: 'decision',
    })

    expect(matches).toHaveLength(1)
    expect(matches[0].applicantName).toBe('Priya Sharma')
  })

  it('keeps the required stage sequence explicit', () => {
    expect(stageSequence.map((stage) => stage.id)).toEqual([
      'intake',
      'document_review',
      'verification',
      'credit',
      'compliance',
      'decision',
      'exception',
      'closed',
    ])
  })

  it('formats rupee amounts for compact loan cards', () => {
    expect(formatCurrency(500000)).toBe('₹5,00,000')
  })
})
