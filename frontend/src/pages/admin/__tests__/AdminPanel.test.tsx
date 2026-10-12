import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import AdminPanel from '../AdminPanel'
import * as api from '../../../api'
import { setAdminToken } from '../../../hooks/useAdminSession'

vi.mock('../../../api', async importOriginal => ({
  ...await importOriginal<typeof api>(),
  adminGetPeople: vi.fn().mockResolvedValue([]),
  getWheelData: vi.fn().mockResolvedValue({ entries: [], history: [], forced_spin: null }),
  getNextNightDate: vi.fn().mockResolvedValue({ date: null, time: null }),
  getNights: vi.fn().mockResolvedValue([]),
  adminSetNextNightDate: vi.fn(),
  adminLogin: vi.fn().mockResolvedValue({ token: 'verified-login' }),
}))
beforeEach(() => {
  setAdminToken(null)
  vi.mocked(api.adminGetPeople).mockResolvedValue([])
  vi.mocked(api.getWheelData).mockResolvedValue({ entries: [], history: [], forced_spin: null } as unknown as Awaited<ReturnType<typeof api.getWheelData>>)
  vi.mocked(api.getNextNightDate).mockResolvedValue({ date: null, time: null })
  vi.mocked(api.getNights).mockResolvedValue([])
  vi.mocked(api.adminLogin).mockResolvedValue({ token: 'verified-login' })
})
it('shows restricted controls disabled while keeping the login available', async () => {
  render(<MemoryRouter><AdminPanel /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText(/Tylko dla administratora/)).toBeVisible())
  const save = screen.getByRole('button', { name: 'Zapisz' })
  expect(save).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Ustaw zwycięzcę' })).toBeDisabled()
  fireEvent.click(save)
  expect(api.adminSetNextNightDate).not.toHaveBeenCalled()
  const password = screen.getByPlaceholderText('Hasło administratora')
  expect(password).toBeEnabled()
  fireEvent.change(password, { target: { value: 'test-password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }))
  await waitFor(() => expect(save).toBeEnabled())
  expect(api.adminLogin).toHaveBeenCalledWith('test-password')
})
