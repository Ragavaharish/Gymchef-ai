import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/ui/Layout'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Coach from './pages/Coach'
import Recipes from './pages/Recipes'
import ShakeBuilder from './pages/ShakeBuilder'
import FoodScanner from './pages/FoodScanner'
import WeeklyPlanner from './pages/WeeklyPlanner'
import LandingPage from './pages/LandingPage'

function ProtectedRoute({ children }) {
  const { currentUser, userProfile } = useAuth()
  if (!currentUser) return <Navigate to="/auth" />
  if (!userProfile || !userProfile.onboarded) return <Navigate to="/onboarding" />
  return children
}

export default function App() {
  const { currentUser, userProfile } = useAuth()

  return (
    <Routes>
      <Route path="/auth" element={
        currentUser ? <Navigate to="/" /> : <Auth />
      } />
      <Route path="/onboarding" element={
        !currentUser ? <Navigate to="/auth" /> : <Onboarding />
      } />
      <Route path="/" element={
        currentUser ? (
          !userProfile || !userProfile.onboarded ? (
            <Navigate to="/onboarding" />
          ) : (
            <Layout><Dashboard /></Layout>
          )
        ) : (
          <Layout><LandingPage /></Layout>
        )
      } />
      <Route path="/coach" element={
        <ProtectedRoute><Layout><Coach /></Layout></ProtectedRoute>
      } />
      <Route path="/recipes" element={
        <ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>
      } />
      <Route path="/shake" element={
        <ProtectedRoute><Layout><ShakeBuilder /></Layout></ProtectedRoute>
      } />
      <Route path="/scanner" element={
        <ProtectedRoute><Layout><FoodScanner /></Layout></ProtectedRoute>
      } />
      <Route path="/planner" element={
        <ProtectedRoute><Layout><WeeklyPlanner /></Layout></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
