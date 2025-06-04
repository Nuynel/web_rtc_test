import {StrictMode} from 'react'
import {PageContextProvider} from './usePageContext'
import type { PageContext } from 'vike/types'
import './index.css'

function Layout({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {

  return (
    <StrictMode>
      <PageContextProvider pageContext={pageContext}>
          {children}
      </PageContextProvider>
    </StrictMode>
  )
}

export { Layout }
