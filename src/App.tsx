import { useCallback, useEffect, useState } from 'react'
import { getCases } from './api/cases'
import type { ApplicationCase } from './types'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Welcome } from './components/pages/Welcome'
import { Settings } from './components/pages/Settings'
import { Profile } from './components/pages/Profile'
import { CaseCreation } from './components/cases/CaseCreation'
import { CaseWorkspace } from './components/cases/CaseWorkspace'
import { RemoteState } from './components/common/RemoteState'

const pageTitles: Record<string, string> = { home: 'My cases', profile: 'Profile', settings: 'Settings' }

export default function App() {
  const [page, setPage] = useState('home')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [caseOpen, setCaseOpen] = useState(false)
  const [activeCase, setActiveCase] = useState('')
  const [cases, setCases] = useState<ApplicationCase[]>([])
  const [casesLoading, setCasesLoading] = useState(true)
  const [casesError, setCasesError] = useState('')
  const [initialDescription, setInitialDescription] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [createKey, setCreateKey] = useState(0)
  const startCase = (description = '') => { setInitialDescription(description); setCaseOpen(true); setCreateKey(key => key + 1) }
  const loadCases = useCallback(async () => {
    setCasesLoading(true); setCasesError('')
    try { setCases(await getCases()) }
    catch (error) { setCasesError(error instanceof Error ? error.message : 'Unable to load your cases.') }
    finally { setCasesLoading(false) }
  }, [])

  useEffect(() => { void loadCases() }, [loadCases])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); startCase() }
      if (event.key === 'Escape') { setCaseOpen(false); setDrawerOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return <div className="app-shell"><Sidebar active={activeCase ? 'case' : page} onNavigate={next => { setActiveCase(''); setPage(next) }} open={drawerOpen} onClose={() => setDrawerOpen(false)} onNewCase={() => startCase()} cases={cases} casesLoading={casesLoading} casesError={casesError} onSelectCase={id => { setActiveCase(id); setPage('home') }}/>
    <div className="main-column"><Header onMenu={() => setDrawerOpen(true)} onProfile={() => { setActiveCase(''); setPage('profile') }} page={pageTitles[page] ?? 'My cases'}/>
      {activeCase ? <CaseWorkspace key={activeCase} caseId={activeCase} pendingFiles={pendingFiles} onBack={() => { setActiveCase(''); setPendingFiles([]) }}/> : page === 'home' ? <><Welcome onStartCase={startCase} onAttachment={setPendingFiles}/>{casesError && <div className="case-list-error"><RemoteState message="Loading cases…" error={casesError} retry={() => void loadCases()}/></div>}{!casesError && casesLoading && <span className="sr-only" role="status">Loading cases…</span>}{!casesLoading && !casesError && cases.length === 0 && <span className="sr-only">No recovery cases yet.</span>}</> : page === 'profile' ? <Profile/> : <Settings/>}
    </div><CaseCreation key={createKey} open={caseOpen} initialDescription={initialDescription} selectedFileCount={pendingFiles.length} onClose={() => setCaseOpen(false)} onCreated={id => { setActiveCase(id); setCaseOpen(false); void loadCases() }}/>
  </div>
}
