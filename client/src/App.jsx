import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './app.css'
import { api } from './api'
import { useAuth } from './AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import MouldSetup from './pages/MouldSetup'
import Approvals from './pages/Approvals'
import ProductionEntry from './pages/ProductionEntry'
import EntryHub from './pages/EntryHub'
import TodayLog from './pages/TodayLog'
import BagEntry from './pages/BagEntry'
import Trimming from './pages/Trimming'
import Inspection from './pages/Inspection'
import Packing from './pages/Packing'
import Dispatch from './pages/Dispatch'
import PartsList from './pages/PartsList'
import PartForm from './pages/PartForm'
import BagLabel from './pages/BagLabel'
import UsersList from './pages/UsersList'
import UserForm from './pages/UserForm'
import PinChange from './pages/PinChange'
import Attendance from './pages/Attendance'
import Reports from './pages/Reports'
import MachinesDashboard from './pages/MachinesDashboard'
import MouldsDashboard from './pages/MouldsDashboard'
import Rework from './pages/Rework'
import RMInward from './pages/RMInward'
import RMStockRegister from './pages/RMStockRegister'
import PartRecipes from './pages/PartRecipes'
import Profile from './pages/Profile'
import MastersHub from './pages/MastersHub'
import ProductionPlanning from './pages/ProductionPlanning'
import Alerts from './pages/Alerts'
import ErrorBoundary from './components/ErrorBoundary'

function HeartbeatTracker() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    api.sendHeartbeat(location.pathname);

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        api.sendHeartbeat(location.pathname);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user, location.pathname]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <HeartbeatTracker />
        <ErrorBoundary>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute roles={['admin', 'supervisor']} page="reports"><Reports /></ProtectedRoute>} />
          <Route path="/machines" element={<ProtectedRoute roles={['admin', 'supervisor']}><MachinesDashboard /></ProtectedRoute>} />
          <Route path="/moulds" element={<ProtectedRoute roles={['admin', 'supervisor']}><MouldsDashboard /></ProtectedRoute>} />
          <Route path="/rm-inward" element={<ProtectedRoute roles={['admin', 'supervisor']}><RMInward /></ProtectedRoute>} />
          <Route path="/rm-stock" element={<ProtectedRoute roles={['admin', 'supervisor']}><RMStockRegister /></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute roles={['admin', 'supervisor']}><PartRecipes /></ProtectedRoute>} />
          <Route path="/planning" element={<ProtectedRoute roles={['admin', 'supervisor']}><ProductionPlanning /></ProtectedRoute>} />
          <Route path="/production-planning" element={<ProtectedRoute roles={['admin', 'supervisor']}><ProductionPlanning /></ProtectedRoute>} />
          <Route path="/mould-setup" element={<ProtectedRoute roles={['admin', 'supervisor']} page="mould_setup"><MouldSetup /></ProtectedRoute>} />
          <Route path="/masters" element={<ProtectedRoute roles={['admin', 'supervisor']}><MastersHub /></ProtectedRoute>} />
          <Route
            path="/approvals"
            element={<ProtectedRoute roles={['supervisor', 'admin']} page="approvals"><Approvals /></ProtectedRoute>}
          />
          <Route path="/entry" element={<ProtectedRoute page="entry"><EntryHub /></ProtectedRoute>} />
          <Route path="/production-entry" element={<ProtectedRoute page="entry"><ProductionEntry /></ProtectedRoute>} />
          <Route path="/bag-entry" element={<ProtectedRoute page="bag_entry"><BagEntry /></ProtectedRoute>} />
          <Route path="/trimming" element={<ProtectedRoute page="trimming"><Trimming /></ProtectedRoute>} />
          <Route path="/inspection" element={<ProtectedRoute page="inspection"><Inspection /></ProtectedRoute>} />
          <Route path="/rework" element={<ProtectedRoute><Rework /></ProtectedRoute>} />
          <Route path="/packing" element={<ProtectedRoute page="packing"><Packing /></ProtectedRoute>} />
          <Route path="/dispatch" element={<ProtectedRoute page="dispatch"><Dispatch /></ProtectedRoute>} />
          <Route path="/log" element={<ProtectedRoute page="log"><TodayLog /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute page="attendance"><Attendance /></ProtectedRoute>} />
          <Route
            path="/parts"
            element={<ProtectedRoute roles={['supervisor', 'admin']} page="parts"><PartsList /></ProtectedRoute>}
          />
          <Route
            path="/parts/new"
            element={<ProtectedRoute roles={['supervisor', 'admin']} page="parts"><PartForm /></ProtectedRoute>}
          />
          <Route
            path="/parts/:id/edit"
            element={<ProtectedRoute roles={['supervisor', 'admin']} page="parts"><PartForm /></ProtectedRoute>}
          />
          <Route path="/bags/:id/label" element={<ProtectedRoute><BagLabel /></ProtectedRoute>} />
          <Route
            path="/users"
            element={<ProtectedRoute roles={['admin']} page="users"><UsersList /></ProtectedRoute>}
          />
          <Route
            path="/users/new"
            element={<ProtectedRoute roles={['admin']} page="users"><UserForm /></ProtectedRoute>}
          />
          <Route
            path="/users/:id/edit"
            element={<ProtectedRoute roles={['admin']} page="users"><UserForm /></ProtectedRoute>}
          />
          <Route path="/change-pin" element={<ProtectedRoute><PinChange /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  )
}
