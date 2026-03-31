import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MayDayWelcomeCenter from './pages/MayDayWelcomeCenter'
import HuntHome from './pages/HuntHome'
import HuntStopPage from './pages/HuntStopPage'
import LaborHistoryPage from './pages/LaborHistoryPage'
import VendorApplicationPage from './pages/VendorApplicationPage'
import PerformerApplicationPage from './pages/PerformerApplicationPage'
import ApplicationsDashboardPage from './pages/ApplicationsDashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MayDayWelcomeCenter />} />
      <Route path="/hunt" element={<HuntHome />} />
      <Route path="/hunt/:category/:stopId" element={<HuntStopPage />} />
      <Route path="/labor-history" element={<LaborHistoryPage />} />
      <Route path="/vendor-application" element={<VendorApplicationPage />} />
      <Route path="/performer-application" element={<PerformerApplicationPage />} />
      <Route path="/applications" element={<ApplicationsDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
