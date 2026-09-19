import React from 'react';
import { useAuth } from '../AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import SupervisorView from '../components/dashboards/SupervisorView';
import ManagementView from '../components/dashboards/ManagementView';

export default function Dashboard() {
  const { user } = useAuth();
  const isSupervisorOrAdmin = user?.role === 'admin' || user?.role === 'supervisor';
  const isManagement = user?.role === 'admin' || user?.role === 'management';

  const defaultRole = isManagement ? 'management' : 'supervisor';
  const {
    viewRole,
    setViewRole,
    // Supervisor
    shiftDate,
    setShiftDate,
    shiftCode,
    setShiftCode,
    supervisorData,
    supervisorLoading,
    supervisorError,
    refreshSupervisor,
    submitShiftHandover,
    // Management
    mgmtPeriod,
    handlePeriodChange,
    mgmtStartDate,
    setMgmtStartDate,
    mgmtEndDate,
    setMgmtEndDate,
    managementData,
    managementLoading,
    managementError,
    refreshManagement,
    // Common
    lastRefreshedAt,
  } = useDashboard(defaultRole);

  return (
    <div className="screen max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      {/* TOP HEADER & ROLE SWITCHER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-400">⚡ SHRP MES</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
              COMMAND CENTER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Live Unified Operational &amp; Executive Analytics Engine · Updated {lastRefreshedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        {/* ROLE / PERSPECTIVE TOGGLE */}
        {isSupervisorOrAdmin && (
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700 shadow-inner">
            <button
              onClick={() => setViewRole('supervisor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewRole === 'supervisor'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👷</span> Supervisor Shift View
            </button>
            <button
              onClick={() => setViewRole('management')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewRole === 'management'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👔</span> Management Plant View
            </button>
          </div>
        )}
      </header>

      {/* DASHBOARD CONTENT ACCORDING TO ACTIVE PERSPECTIVE */}
      {viewRole === 'supervisor' ? (
        <SupervisorView
          data={supervisorData}
          loading={supervisorLoading}
          error={supervisorError}
          shiftDate={shiftDate}
          setShiftDate={setShiftDate}
          shiftCode={shiftCode}
          setShiftCode={setShiftCode}
          onRefresh={refreshSupervisor}
          onSubmitHandover={submitShiftHandover}
        />
      ) : (
        <ManagementView
          data={managementData}
          loading={managementLoading}
          error={managementError}
          mgmtPeriod={mgmtPeriod}
          handlePeriodChange={handlePeriodChange}
          mgmtStartDate={mgmtStartDate}
          setMgmtStartDate={setMgmtStartDate}
          mgmtEndDate={mgmtEndDate}
          setMgmtEndDate={setMgmtEndDate}
          onRefresh={refreshManagement}
        />
      )}
    </div>
  );
}
