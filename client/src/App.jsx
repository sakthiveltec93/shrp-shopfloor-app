import { Routes, Route } from 'react-router-dom'
import './app.css'
import { useAuth } from './AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import MouldSetup from './pages/MouldSetup'
import Approvals from './pages/Approvals'
import ProductionEntry from './pages/ProductionEntry'
import TodayLog from './pages/TodayLog'
import BagEntry from './pages/BagEntry'
import Trimming from './pages/Trimming'
import Inspection from './pages/Inspection'
import Packing from './pages/Packing'
import PartsList from './pages/PartsList'
import PartForm from './pages/PartForm'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/mould-setup" element={<ProtectedRoute><MouldSetup /></ProtectedRoute>} />
        <Route
          path="/approvals"
          element={<ProtectedRoute roles={['supervisor', 'admin']}><Approvals /></ProtectedRoute>}
        />
        <Route path="/entry" element={<ProtectedRoute><ProductionEntry /></ProtectedRoute>} />
        <Route path="/bag-entry" element={<ProtectedRoute><BagEntry /></ProtectedRoute>} />
        <Route path="/trimming" element={<ProtectedRoute><Trimming /></ProtectedRoute>} />
        <Route path="/inspection" element={<ProtectedRoute><Inspection /></ProtectedRoute>} />
        <Route path="/packing" element={<ProtectedRoute><Packing /></ProtectedRoute>} />
        <Route path="/log" element={<ProtectedRoute><TodayLog /></ProtectedRoute>} />
        <Route
          path="/parts"
          element={<ProtectedRoute roles={['supervisor', 'admin']}><PartsList /></ProtectedRoute>}
        />
        <Route
          path="/parts/new"
          element={<ProtectedRoute roles={['supervisor', 'admin']}><PartForm /></ProtectedRoute>}
        />
        <Route
          path="/parts/:id/edit"
          element={<ProtectedRoute roles={['supervisor', 'admin']}><PartForm /></ProtectedRoute>}
        />
      </Routes>
    </Layout>
  )
}
