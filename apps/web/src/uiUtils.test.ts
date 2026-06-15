import { describe, expect, it, vi } from 'vitest'

import { demoCases } from './data/demoCases'
import { paginateRows, rowsToCsv, safeLoad, safeSave, updateExceptionStatus } from './uiUtils'

describe('ui utilities', () => {
  it('pagination changes visible rows', () => {
    expect(paginateRows(demoCases, 1, 2).map((item) => item.id)).toEqual(['FF-2026-001', 'FF-2026-002'])
    expect(paginateRows(demoCases, 2, 2).map((item) => item.id)).toEqual(['FF-2026-003', 'FF-2026-004'])
  })

  it('exports cases as csv', () => {
    const csv = rowsToCsv([demoCases[0]])

    expect(csv).toContain('Case ID,Customer,Product')
    expect(csv).toContain('FF-2026-001,Priya Sharma')
  })

  it('binds exception row status by selected id', () => {
    const rows = [{ id: 'EX-001', status: 'open' }, { id: 'EX-002', status: 'open' }] as never

    expect(updateExceptionStatus(rows, 'EX-002', 'resolved')[1].status).toBe('resolved')
  })

  it('persists settings-like state to localStorage', () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() } as unknown as Storage
    safeSave('finflow-test', { compact: true }, storage)

    expect(storage.setItem).toHaveBeenCalledWith('finflow-test', '{"compact":true}')
  })

  it('loads fallback when storage is empty', () => {
    const storage = { getItem: vi.fn(() => null) } as unknown as Storage

    expect(safeLoad('finflow-test', { compact: false }, storage)).toEqual({ compact: false })
  })
})
