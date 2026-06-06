import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NutritionProvider } from './context/NutritionContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NutritionProvider>
          <App />
        </NutritionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
