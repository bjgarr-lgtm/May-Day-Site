import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MayDayWelcomeCenter from './pages/MayDayWelcomeCenter'
import HuntHome from './pages/HuntHome'
import HuntStopPage from './pages/HuntStopPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MayDayWelcomeCenter />} />
      <Route path="/hunt" element={<HuntHome />} />
      <Route path="/hunt/:category/:stopId" element={<HuntStopPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
