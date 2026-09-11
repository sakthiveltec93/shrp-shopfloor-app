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
import BagLabel from './pages/BagLabel'
import UsersList from './pages/UsersList'
import UserForm from './pages/UserForm'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/mould-setup" element={<ProtectedRoute page="mould_setup"><MouldSetup /></ProtectedRoute>} />
        <Route
          path="/approvals"
          element={<ProtectedRoute roles={['supervisor', 'admin']} page="approvals"><Approvals /></ProtectedRoute>}
        />
        <Route path="/entry" element={<ProtectedRoute page="entry"><ProductionEntry /></ProtectedRoute>} />
        <Route path="/bag-entry" element={<ProtectedRoute page="bag_entry"><BagEntry /></ProtectedRoute>} />
        <Route path="/trimming" element={<ProtectedRoute page="trimming"><Trimming /></ProtectedRoute>} />
        <Route path="/inspection" element={<ProtectedRoute page="inspection"><Inspection /></ProtectedRoute>} />
        <Route path="/packing" element={<ProtectedRoute page="packing"><Packing /></ProtectedRoute>} />
        <Route path="/log" element={<ProtectedRoute page="log"><TodayLog /></ProtectedRoute>} />
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
      </Routes>
    </Layout>
  )
}
