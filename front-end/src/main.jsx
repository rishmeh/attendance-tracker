import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppState from '../context/AppState.jsx'
import Configure from './Configure.jsx'
import Login from './Login.jsx'
import Stats from './Stats.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppState>
      <Login/>
      <Stats/>
      <App />
      <Configure/>
    </AppState>
  </StrictMode>,
)
