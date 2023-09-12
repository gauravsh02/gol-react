import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {ParamsContextProvider} from './context/gol-context.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ParamsContextProvider>
      <App />
    </ParamsContextProvider>
  </React.StrictMode>,
)
