import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminAuthProvider } from './context/AdminAuth'
import { initSimulationPersistence } from './data/initSimulationPersistence'
import { runApiBootstrap } from './services/apiBootstrap'

async function boot() {
  initSimulationPersistence()
  await runApiBootstrap()
}

boot().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    </StrictMode>,
  )
})
