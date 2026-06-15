import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App render', () => {
  it('renders the FinFlow login shell', () => {
    const html = renderToString(<App />)

    expect(html).toContain('FinFlow')
    expect(html).toContain('Sign in')
  })
})
