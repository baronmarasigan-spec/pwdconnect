
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationReviewModal } from '../../components/admin/ApplicationReviewModal';
import { ApplicationStatus, ApplicationType, Role, User, RegistryRecord, Application } from '../../types';
import { 
  CheckCircle, XCircle, Clock, Archive, Search, 
  FileText, X, MapPin, Phone, Mail, Edit2, Save,
  Calendar, UserCheck, AlertCircle, Info, Upload,
  ArrowLeft, ArrowRight, User as UserIcon, Heart, Banknote, HelpCircle, UserPlus, Eye, Download, File, UserMinus, RefreshCw, ZoomIn, ZoomOut, ChevronDown, Filter, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle as QuestionMark, Globe, MapPinned, ShieldCheck, Fingerprint, Activity, ShieldAlert, Database, CloudOff, Stethoscope, UserCircle, Briefcase, Home, Layers, ClipboardList
} from 'lucide-react';

const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
};

const METRO_MANILA_LOCATIONS: Record<string, { districts: string[], barangays: Record<string, string[]> }> = {
  "San Juan City": {
    districts: ["District 1", "District 2"],
    barangays: {
      "District 1": [
        "Addition Hills", "Balong-Bato", "Batis", "Corazon de Jesus", "Ermitaño", 
        "Isabelita", "Kabayanan", "Little Baguio", "Maytunas", 
        "Onse", "Pasadeña", "Pedro Cruz", "Progreso", "Rivera", "Salapan", 
        "San Perfecto", "Santa Lucia", "Tibagan"
      ],
      "District 2": ["Greenhills", "West Crame"]
    }
  }
};

export const AdminRegistered: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { applications, updateApplicationStatus, updateApplicationData, syncApplications, syncError, actionError, setActionError, isLiveMode, registryRecords, fetchExternalRegistry, addApplication, users } = useApp();
  
  // State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [barangayFilter, setBarangayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>(
    tab === 'approval' ? ApplicationStatus.PENDING : 
    tab === 'approved' ? ApplicationStatus.APPROVED : 
    tab === 'disapproved' ? ApplicationStatus.REJECTED : 'all'
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const ALL_BARANGAYS = useMemo(() => {
    return [
      ...METRO_MANILA_LOCATIONS["San Juan City"].barangays["District 1"],
      ...METRO_MANILA_LOCATIONS["San Juan City"].barangays["District 2"]
    ].sort();
  }, []);
  
  // Review & Confirmation State
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [rejectingApp, setRejectingApp] = useState<Application | null>(null);
  const [confirmingApproveApp, setConfirmingApproveApp] = useState<Application | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  // Sync logic
  const triggerManualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncApplications();
      setLastSync(new Date().toLocaleTimeString());
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  }, [syncApplications]);

  useEffect(() => {
    triggerManualSync();
  }, [triggerManualSync]);

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingApp) {
        await updateApplicationStatus(rejectingApp.id, ApplicationStatus.REJECTED, rejectionRemarks);
        setRejectingApp(null);
        setRejectionRemarks('');
        setViewingApp(null);
        setSuccessMessage(`Application #${rejectingApp.id} status updated to REJECTED. Record remains in database.`);
        setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleConfirmApprove = async () => {
    if (confirmingApproveApp) {
      await updateApplicationStatus(confirmingApproveApp.id, ApplicationStatus.APPROVED);
      setConfirmingApproveApp(null);
      setViewingApp(null);
      setSuccessMessage(`Application #${confirmingApproveApp.id} APPROVED. Identity record created. Citizen must now apply for PWD ID.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const counts = useMemo(() => {
    const regs = applications.filter(a => String(a.type || '').toLowerCase() === 'registration');
    return {
      all: regs.length,
      pending: regs.filter(a => a.status === ApplicationStatus.PENDING).length,
      clarification: regs.filter(a => a.status === ApplicationStatus.CLARIFICATION).length,
      approved: regs.filter(a => a.status === ApplicationStatus.APPROVED).length,
      rejected: regs.filter(a => a.status === ApplicationStatus.REJECTED).length,
    };
  }, [applications]);

  const filteredApps = useMemo(() => {
    const registrations = applications.filter(a => String(a.type || '').toLowerCase() === 'registration');
    let list = registrations;
    if (tab === 'walk-in') {
      list = list.filter(a => a.formData?.isWalkIn === true);
    } else if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }
    if (barangayFilter !== 'all') {
      list = list.filter(a => a.formData?.barangay === barangayFilter);
    }
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      list = list.filter(a => 
        String(a.userName || '').toLowerCase().includes(query) || 
        String(a.id || '').toLowerCase().includes(query)
      );
    }
    return list;
  }, [applications, statusFilter, searchTerm, barangayFilter, tab]);

  if (tab === 'walk-in') {
    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[32px] font-normal text-slate-800 leading-tight">Walk-in Registration</h1>
            <p className="text-slate-500 mt-1">Manage manual PWD enrollments and walk-in applicants.</p>
          </div>
          <button 
            onClick={() => navigate('/register?isWalkIn=true')}
            className="flex items-center gap-2 px-6 py-3 bg-osca_red text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95"
          >
            <UserPlus size={16} />
            Register here
          </button>
        </header>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search walk-in entries..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 ring-slate-200 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={barangayFilter}
                onChange={(e) => setBarangayFilter(e.target.value)}
                className="px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 ring-slate-200 transition-all min-w-[200px]"
              >
                <option value="all">All Barangays</option>
                {ALL_BARANGAYS.map(brgy => (
                  <option key={brgy} value={brgy}>{brgy}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applicant</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Barangay</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Added</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Archive size={48} />
                        <p className="text-sm font-medium">No walk-in records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => setViewingApp(app)}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-white transition-all">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{app.userName}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-tight">ID: {app.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs text-slate-600">{app.formData?.barangay || 'N/A'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs text-slate-600">{new Date(app.date).toLocaleDateString()}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {viewingApp && (
        <ApplicationReviewModal 
          app={viewingApp} 
          onClose={() => setViewingApp(null)}
          setViewingApp={setViewingApp}
          setRejectingApp={setRejectingApp}
          setConfirmingApproveApp={setConfirmingApproveApp}
          setSuccessMessage={setSuccessMessage}
          rejectionRemarks={rejectionRemarks}
          setRejectionRemarks={setRejectionRemarks}
        />
      )}

      {rejectingApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setRejectingApp(null)} />
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-inner"><XCircle size={40} /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-normal text-slate-800 uppercase tracking-tight">Confirm Rejection</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Are you sure you want to reject application <span className="font-bold text-slate-900">#{rejectingApp.id}</span>? This action will notify the applicant.</p>
              </div>
              <div className="space-y-4">
                <textarea value={rejectionRemarks} onChange={(e) => setRejectionRemarks(e.target.value)} placeholder="Enter rejection reason..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-red-500 transition-all" rows={3} />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setRejectingApp(null)} className="px-6 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                  <button onClick={handleRejectSubmit} className="px-6 py-3 bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-xl hover:bg-red-700 transition-all">Confirm Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmingApproveApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setConfirmingApproveApp(null)} />
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner"><CheckCircle size={40} /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-normal text-slate-800 uppercase tracking-tight">Confirm Approval</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Approve and register <span className="font-bold text-slate-900">{confirmingApproveApp.userName}</span> to the PWD Masterlist?</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button onClick={() => setConfirmingApproveApp(null)} className="px-6 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                <button onClick={handleConfirmApprove} className="px-6 py-3 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-xl hover:bg-emerald-700 transition-all">Approve & Register</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-8 right-8 z-[100] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up">
          <CheckCircle size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="p-1 hover:bg-white/20 rounded-lg transition-all"><X size={16}/></button>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-normal text-slate-800 leading-tight">Management</h1>
          <p className="text-slate-500 font-medium text-lg">Review submitted applications and manage PWD registration.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/register?isWalkIn=true')}
            className="flex items-center gap-2 px-6 py-3 bg-osca_red text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95"
          >
            <UserPlus size={16} />
            Register here
          </button>
          <button 
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Registry'}
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
            <div className="p-8 border-b border-slate-100 bg-slate-50/40 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-1 gap-4">
                        <div className="relative max-w-md w-full group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-[#1e419c]" size={20} />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search queue..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-[#1e419c]/10 outline-none transition-all text-sm text-slate-900 font-medium uppercase tracking-tight" />
                        </div>
                        <div className="relative w-64">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select 
                                value={barangayFilter} 
                                onChange={e => setBarangayFilter(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-[#1e419c]/10 outline-none transition-all text-sm text-slate-900 font-medium uppercase appearance-none"
                            >
                                <option value="all">All Barangays</option>
                                {ALL_BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-100 text-[10px] font-medium text-slate-500 uppercase tracking-widest"><ClipboardList size={12} className="text-[#1e419c]" /> Persistent Records: {filteredApps.length}</div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100/50">
                    {[
                        { id: 'all', label: 'All Records', icon: Layers, count: counts.all },
                        { id: ApplicationStatus.PENDING, label: 'Walk-in', icon: Clock, count: counts.pending },
                        { id: ApplicationStatus.CLARIFICATION, label: 'Clarification', icon: HelpCircle, count: counts.clarification },
                        { id: ApplicationStatus.APPROVED, label: 'Approved', icon: CheckCircle, count: counts.approved },
                        { id: ApplicationStatus.REJECTED, label: 'Rejected', icon: XCircle, count: counts.rejected }
                    ].map(tabOpt => (
                        <button key={tabOpt.id} onClick={() => setStatusFilter(tabOpt.id as any)} className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-[10px] uppercase tracking-widest transition-all ${statusFilter === tabOpt.id ? 'bg-[#1e419c] text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}><tabOpt.icon size={14} />{tabOpt.label}<span className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium ${statusFilter === tabOpt.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{tabOpt.count}</span></button>
                    ))}
                </div>
            </div>

            {filteredApps.length === 0 ? (
                <div className="p-32 text-center text-slate-300">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">{isSyncing ? <RefreshCw size={60} className="animate-spin opacity-20 text-[#1e419c]" /> : <Database size={60} className="opacity-10" />}</div>
                    <p className="font-medium uppercase tracking-[0.3em] text-xs text-slate-400">{isSyncing ? 'Handshaking...' : 'No records match filter.'}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1e419c] text-white text-[10px] font-normal uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-8">Applied Date</th>
                                <th className="p-8">Status</th>
                                <th className="p-8">Applicant Name</th>
                                <th className="p-8">Mode</th>
                                <th className="p-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredApps.map(app => (
                                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-8">
                                        <span className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-300" /> {app.date}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-widest border ${
                                            app.status === ApplicationStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                            app.status === ApplicationStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            app.status === ApplicationStatus.CLARIFICATION ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-red-50 text-red-600 border-red-100'
                                        }`}>{app.status}</span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                                <img 
                                                    src={app.formData?.capturedImage || users.find(u => u.id === app.userId)?.avatarUrl || 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png'} 
                                                    alt={app.userName} 
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 uppercase tracking-tight text-sm leading-tight">{app.userName}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tight">ID: {users.find(u => u.id === app.userId)?.pwdIdNumber || app.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                                            app.formData?.isWalkIn 
                                                ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                        }`}>
                                            {app.formData?.isWalkIn ? (
                                                <><MapPin size={14} /> Walk-in</>
                                            ) : (
                                                <><Globe size={14} /> Online</>
                                            )}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            {app.status === ApplicationStatus.PENDING ? (
                                                <>
                                                    <button onClick={() => setViewingApp(app)} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-[#1e419c] hover:text-white transition-all flex items-center gap-2 shadow-sm">
                                                        <Eye size={14} /> Review
                                                    </button>
                                                    <button onClick={() => setRejectingApp(app)} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white shadow-xl shadow-red-600/10 transition-all active:scale-95">
                                                        <XCircle size={18} />
                                                    </button>
                                                    <button onClick={() => setConfirmingApproveApp(app)} className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => setViewingApp(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#1e419c] hover:text-white transition-all flex items-center gap-2 shadow-sm">
                                                        <Eye size={14} /> Details
                                                    </button>
                                                    <button onClick={() => updateApplicationStatus(app.id, ApplicationStatus.PENDING)} className="px-6 py-3 bg-white border border-slate-200 text-slate-400 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:text-primary-600 transition-all shadow-sm">
                                                        Restore
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
};
