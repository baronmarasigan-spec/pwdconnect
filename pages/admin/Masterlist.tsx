
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { IDCard } from '../../components/IDCard';
import { 
  Search, Download, X, ShieldCheck, User as UserIcon, 
  MapPin, Phone, Mail, Eye, EyeOff, FileText, 
  RefreshCw, Database, Globe, Activity, CloudOff, ShieldAlert, Calendar, UserCircle, Briefcase, Home, CreditCard, Save, MapPinned,
  MoreHorizontal, Edit2, Key, RefreshCcw, Trash2
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

export const Masterlist: React.FC = () => {
  const { masterlistRecords, fetchMasterlist, isLiveMode, syncError, updateApplicationData, moveRecordToPending, deleteMasterlistRecord } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterCivilStatus, setFilterCivilStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isInitialEdit, setIsInitialEdit] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmingDeleteRecord, setConfirmingDeleteRecord] = useState<any | null>(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchMasterlist();
      setLastSync(new Date().toLocaleTimeString());
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  }, [fetchMasterlist]);

  const handleAction = (type: string, record: any) => {
    setOpenDropdownId(null);
    if (type === 'view') {
      setSelectedRecord(record);
    } else if (type === 'edit') {
      setIsInitialEdit(true);
      setSelectedRecord(record);
    } else if (type === 'reset') {
      setSuccessMessage(`Password for ${record.name || record.fullName} has been reset to default.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else if (type === 'pending') {
      moveRecordToPending(record.id);
      setSuccessMessage(`${record.name || record.fullName} has been moved back to pending approvals.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else if (type === 'delete') {
      setConfirmingDeleteRecord(record);
    }
  };

  const handleDeleteRecord = () => {
    if (confirmingDeleteRecord) {
      deleteMasterlistRecord(confirmingDeleteRecord.id);
      setSuccessMessage(`${confirmingDeleteRecord.name || confirmingDeleteRecord.fullName} has been permanently deleted from the masterlist.`);
      setConfirmingDeleteRecord(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const filteredRecords = useMemo(() => {
    let result = masterlistRecords.filter(record => {
      const firstName = String(record.firstName || '').toLowerCase();
      const lastName = String(record.lastName || '').toLowerCase();
      const fullName = String(record.fullName || record.name || `${firstName} ${lastName}`).toLowerCase();
      const id = String(record.pwdIdNumber || record.id || '').toLowerCase();
      const query = searchTerm.toLowerCase();
      
      const matchesSearch = fullName.includes(query) || id.includes(query);
      const matchesGender = !filterGender || (record.gender || record.sex) === filterGender;
      const matchesCivilStatus = !filterCivilStatus || (record.civilStatus || record.civil_status) === filterCivilStatus;
      const matchesStatus = !filterStatus || record.status === filterStatus;
      
      return matchesSearch && matchesGender && matchesCivilStatus && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      let valA, valB;
      if (sortConfig.key === 'name') {
        valA = (a.fullName || a.name || `${a.firstName} ${a.lastName}`).toLowerCase();
        valB = (b.fullName || b.name || `${b.firstName} ${b.lastName}`).toLowerCase();
      } else if (sortConfig.key === 'date') {
        const dateA = a.dateApplied || a.registrationDate || a.dateRegistered || a.date || a.birthDate || 0;
        const dateB = b.dateApplied || b.registrationDate || b.dateRegistered || b.date || b.birthDate || 0;
        valA = new Date(dateA).getTime();
        valB = new Date(dateB).getTime();
      } else {
        valA = a[sortConfig.key];
        valB = b[sortConfig.key];
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [masterlistRecords, searchTerm, filterGender, filterCivilStatus, filterStatus, sortConfig]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const DetailItem = ({ label, value }: { label: string, value: any }) => {
    if (value === undefined || value === null || value === '' || value === '---' || value === 'N/A') return null;
    return (
      <div>
        <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">{label}</label>
        <p className="font-semibold text-slate-800 text-sm uppercase leading-tight">{value}</p>
      </div>
    );
  };

  const DetailSection = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => {
    const hasVisibleChildren = React.Children.toArray(children).some(child => child !== null);
    if (!hasVisibleChildren) return null;

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-2">
          <Icon size={14} className="text-[#1e419c]" /> {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      </div>
    );
  };

  const RecordDetailsModal = ({ record, onClose, initialEditMode = false }: { record: any, onClose: () => void, initialEditMode?: boolean }) => {
    const { updateApplicationData } = useApp();
    const [isEditMode, setIsEditMode] = useState(initialEditMode);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState({
      firstName: record.firstName || '',
      lastName: record.lastName || '',
      email: record.emailAddress || record.email || '',
      mobileNumber: record.mobileNumber || record.contactNumber || '',
      typeOfDisability: record.typeOfDisability || record.disabilityType || '',
      civilStatus: record.civilStatus || record.civil_status || ''
    });

    const fullName = record.fullName || `${record.firstName || ''} ${record.middleName ? record.middleName + ' ' : ''}${record.lastName || ''}`.trim() || record.name;
    const pwdIdDisplay = record.pwdIdNumber || record.id;

    const handleSave = async () => {
      setIsSaving(true);
      // In a real app, this would update the permanent registry record.
      // For now, we simulate success message and close edit mode.
      setSuccessMessage('Record updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsEditMode(false);
      setIsSaving(false);
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-slate-50 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up border border-white">
          <div className="bg-[#1e419c] p-8 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <UserCircle size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight">{isEditMode ? 'Edit Profile' : fullName}</h2>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">Masterlist Record Profile</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isEditMode ? 'bg-amber-100 text-[#1e419c]' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isEditMode ? <X size={14} /> : <Edit2 size={14} />}
                {isEditMode ? 'Cancel' : 'Edit Info'}
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
            <DetailSection title="Identification" icon={CreditCard}>
              <DetailItem label="PWD ID Number" value={pwdIdDisplay} />
              <DetailItem label="Valid Until" value={record.pwdIdExpiryDate || record.validUntil} />
            </DetailSection>

            <DetailSection title="Personal Information" icon={UserIcon}>
              {isEditMode ? (
                <>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">First Name</label>
                    <input className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium uppercase outline-none focus:border-[#1e419c]" value={editData.firstName} onChange={(e) => setEditData({...editData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Last Name</label>
                    <input className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium uppercase outline-none focus:border-[#1e419c]" value={editData.lastName} onChange={(e) => setEditData({...editData, lastName: e.target.value})} />
                  </div>
                </>
              ) : (
                <>
                  <DetailItem label="Full Name" value={fullName} />
                </>
              )}
              <DetailItem label="Birth Date" value={record.birthDate} />
              <DetailItem label="Gender" value={record.gender || record.sex} />
              {isEditMode ? (
                <div>
                  <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Civil Status</label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium uppercase outline-none focus:border-[#1e419c]" value={editData.civilStatus} onChange={(e) => setEditData({...editData, civilStatus: e.target.value})}>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
              ) : (
                <DetailItem label="Civil Status" value={record.civilStatus || record.civil_status} />
              )}
            </DetailSection>

            <DetailSection title="Disability Information" icon={Activity}>
              {isEditMode ? (
                <div>
                  <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Type of Disability</label>
                  <input className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium uppercase outline-none focus:border-[#1e419c]" value={editData.typeOfDisability} onChange={(e) => setEditData({...editData, typeOfDisability: e.target.value})} />
                </div>
              ) : (
                <DetailItem label="Type of Disability" value={record.typeOfDisability || record.disabilityType} />
              )}
              <DetailItem label="Cause of Disability" value={record.causeOfDisability} />
            </DetailSection>

            <DetailSection title="Address Information" icon={MapPin}>
              <DetailItem label="House Number/Street" value={record.streetAddress || record.address} />
              <DetailItem label="Barangay" value={record.barangay} />
              <DetailItem label="City / Municipality" value={record.cityMunicipality || record.city} />
              <DetailItem label="Province" value={record.province} />
              <DetailItem label="Region" value={record.region} />
            </DetailSection>

            <DetailSection title="Contact Information" icon={Phone}>
              {isEditMode ? (
                <>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Mobile Number</label>
                    <input className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium outline-none focus:border-[#1e419c]" value={editData.mobileNumber} onChange={(e) => setEditData({...editData, mobileNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Email Address</label>
                    <input className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e419c]" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
                  </div>
                </>
              ) : (
                <>
                  <DetailItem label="Mobile Number" value={record.mobileNumber || record.contactNumber} />
                  <DetailItem label="Email Address" value={record.emailAddress || record.email} />
                </>
              )}
            </DetailSection>

            <DetailSection title="Emergency Contact" icon={ShieldCheck}>
              <DetailItem label="Name" value={record.emergencyContactPerson} />
              <DetailItem label="Relationship" value={record.emergencyContactRelationship || record.relationship} />
              <DetailItem label="Contact Number" value={record.emergencyContactNumber} />
            </DetailSection>

            <DetailSection title="Employment Information" icon={Briefcase}>
              <DetailItem label="Employment Status" value={record.employmentStatus} />
              <DetailItem label="Occupation" value={record.occupation} />
              <DetailItem label="Type of Employment" value={record.employmentType} />
            </DetailSection>

            <DetailSection title="Approval Information" icon={ShieldAlert}>
              <DetailItem label="Date Applied" value={record.dateApplied} />
              <DetailItem label="Date Approved" value={record.approvalDate || record.dateApproved} />
              <DetailItem label="Approved By" value={record.approvedBy} />
            </DetailSection>

            <DetailSection title="Status" icon={Activity}>
              <DetailItem label="Record Status" value={record.status} />
            </DetailSection>
          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
            {isEditMode ? (
              <>
                <button onClick={() => setIsEditMode(false)} className="px-8 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">Cancel</button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>}
                  Save Changes
                </button>
              </>
            ) : (
              <button onClick={onClose} className="px-8 py-3 bg-[#1e419c] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:opacity-90 transition-all">Close Profile</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {successMessage && (
        <div className="fixed top-24 right-8 z-[200] bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] text-emerald-700 text-xs font-medium animate-fade-in-down flex items-start gap-3 shadow-xl max-w-md">
          <ShieldCheck className="shrink-0 mt-0.5" size={18}/>
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-widest text-[10px]">Operation Successful</p>
            <p className="text-emerald-600/80">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="ml-2 text-emerald-400 hover:text-emerald-600">
            <X size={14}/>
          </button>
        </div>
      )}
      {selectedRecord && (
        <RecordDetailsModal 
          record={selectedRecord} 
          onClose={() => { setSelectedRecord(null); setIsInitialEdit(false); }} 
          initialEditMode={isInitialEdit}
        />
      )}
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-normal text-slate-800">PWD masterlist</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 font-medium text-lg">Central Cloud Registry (API Mode)</p>
            <div className={`flex items-center gap-2 px-3 py-1 ${isLiveMode ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} border rounded-full ${isRefreshing ? 'animate-pulse' : ''}`}>
              {isLiveMode ? <Activity size={14} className="text-emerald-500" /> : <CloudOff size={14} className="text-amber-500" />}
              <span className={`text-[9px] font-medium uppercase tracking-[0.2em] ${isLiveMode ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isLiveMode ? 'Cloud Connected' : 'Manual Sync Mode'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 bg-[#1e419c] text-white rounded-lg font-medium text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Accessing DB...' : 'Sync Database'}
          </button>
          {lastSync && <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Latest Cloud Sync: {lastSync}</span>}
        </div>
      </header>

      {syncError && (
        <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-xl flex items-start gap-6 animate-fade-in-up shadow-sm">
          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-amber-600 shadow-sm border border-amber-50 shrink-0">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-amber-900 uppercase tracking-tight">API Handshake Mismatch (401)</h3>
            <p className="text-amber-700 text-sm font-medium max-w-2xl leading-relaxed">
              The live masterlist at <span className="underline font-mono">phoenix.com.ph</span> is not reflecting because 
              the current session is unauthorized. Please ensure you login with <span className="font-semibold">Official Admin Credentials</span>.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
        <div className="p-8 border-b border-slate-100 bg-slate-50/40 space-y-6">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text"
                  placeholder="Search by Name or PWD ID..."
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1e419c]/10 focus:border-[#1e419c] transition-all font-medium text-sm uppercase tracking-tight"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={filterGender}
                  onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:outline-none focus:border-[#1e419c]"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <select 
                  value={filterCivilStatus}
                  onChange={(e) => { setFilterCivilStatus(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:outline-none focus:border-[#1e419c]"
                >
                  <option value="">All Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
                <select 
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:outline-none focus:border-[#1e419c]"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Deceased">Deceased</option>
                </select>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                    className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${sortConfig.key === 'name' ? 'bg-white text-[#1e419c] shadow-sm' : 'text-slate-400'}`}
                  >
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                  <button 
                    onClick={() => setSortConfig({ key: 'date', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                    className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${sortConfig.key === 'date' ? 'bg-white text-[#1e419c] shadow-sm' : 'text-slate-400'}`}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto relative custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1e419c] text-white text-[9px] font-bold uppercase tracking-[0.2em]">
                <th className="p-6 whitespace-nowrap border-b border-white/10">Applied Date</th>
                <th className="p-6 whitespace-nowrap border-b border-white/10">Status</th>
                <th className="p-6 whitespace-nowrap border-b border-white/10">Full Name</th>
                <th className="p-6 whitespace-nowrap border-b border-white/10">Mode</th>
                <th className="p-6 text-right whitespace-nowrap border-b border-white/10">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.map((record, idx) => {
                const fullName = record.fullName || `${record.firstName || ''} ${record.middleName ? record.middleName + ' ' : ''}${record.lastName || ''}`.trim() || record.name;
                const statusColor = record.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                                   record.status === 'Deceased' ? 'text-red-600 bg-red-50 border-red-100' : 
                                   'text-slate-500 bg-slate-50 border-slate-100';

                return (
                  <tr key={record.id || idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6 border-b border-slate-100">
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-2">
                            <Calendar size={14} className="text-slate-300" /> {record.dateApplied || '---'}
                        </span>
                    </td>
                    <td className="p-6 border-b border-slate-100">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border whitespace-nowrap ${statusColor}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-6 border-b border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 uppercase tracking-tight text-xs whitespace-nowrap">{fullName}</span>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">ID: {record.pwdIdNumber || record.id}</span>
                      </div>
                    </td>
                    <td className="p-8 border-b border-slate-100">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                            record.isWalkIn 
                                ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                            {record.isWalkIn ? (
                                <><MapPin size={14} /> Walk-in</>
                            ) : (
                                <><Globe size={14} /> Online</>
                            )}
                        </span>
                    </td>
                    <td className="p-6 text-right border-b border-slate-100 relative">
                      <div className="flex justify-end">
                        <button 
                            onClick={() => setOpenDropdownId(openDropdownId === record.id ? null : (record.id || idx.toString()))}
                            className="p-3 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        
                        {openDropdownId === (record.id || idx.toString()) && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className={`absolute right-6 ${idx >= paginatedRecords.length - 2 && paginatedRecords.length > 2 ? 'bottom-12 origin-bottom' : 'top-16 origin-top'} w-64 bg-white rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 z-20 py-4 flex flex-col items-start overflow-hidden animate-scale-up`}>
                              <button 
                                onClick={() => handleAction('view', record)}
                                className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-slate-50 transition-colors text-slate-700 group"
                              >
                                <Eye size={18} className="text-slate-400 group-hover:text-[#1e419c]" />
                                <span className="text-[11px] font-extrabold uppercase tracking-widest">View Profile</span>
                              </button>
                              
                              <button 
                                onClick={() => handleAction('edit', record)}
                                className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-slate-50 transition-colors text-slate-700 group"
                              >
                                <Edit2 size={18} className="text-slate-400 group-hover:text-[#1e419c]" />
                                <span className="text-[11px] font-extrabold uppercase tracking-widest">Edit Profile</span>
                              </button>
                              
                              <button 
                                onClick={() => handleAction('reset', record)}
                                className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-slate-50 transition-colors text-slate-700 group"
                              >
                                <Key size={18} className="text-slate-400 group-hover:text-[#1e419c]" />
                                <span className="text-[11px] font-extrabold uppercase tracking-widest">Reset Password</span>
                              </button>
                              
                              <div className="w-full h-[1px] bg-slate-50 my-1" />
                              
                              <button 
                                onClick={() => handleAction('pending', record)}
                                className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-orange-50 transition-colors text-orange-600 group"
                              >
                                <RefreshCcw size={18} className="text-orange-500" />
                                <span className="text-[11px] font-extrabold uppercase tracking-widest">Move to Pending</span>
                              </button>

                              <div className="w-full h-[1px] bg-slate-50 my-1" />

                              <button 
                                onClick={() => handleAction('delete', record)}
                                className="w-full flex items-center gap-5 px-8 py-3.5 hover:bg-red-50 transition-colors text-red-600 group"
                              >
                                <Trash2 size={18} className="text-red-500" />
                                <span className="text-[11px] font-extrabold uppercase tracking-widest">Delete Record</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedRecords.length === 0 && !isRefreshing && (
                <tr>
                   <td colSpan={5} className="p-24 text-center text-slate-300 font-bold uppercase tracking-[0.3em] text-xs">
                      No Records Found
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} Records
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <RefreshCw size={14} className="-scale-x-100" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${currentPage === i + 1 ? 'bg-[#1e419c] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmingDeleteRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                <div className="p-8 pb-4 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={40} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Masterlist Record?</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Are you sure you want to delete <span className="font-bold text-slate-700">{confirmingDeleteRecord.name || confirmingDeleteRecord.fullName}</span>? 
                        This will also remove their associated user account. This action is permanent.
                    </p>
                </div>
                <div className="p-8 pt-6 flex flex-col gap-3">
                    <button 
                        onClick={handleDeleteRecord}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-red-100"
                    >
                        Delete Permanently
                    </button>
                    <button 
                        onClick={() => setConfirmingDeleteRecord(null)}
                        className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all"
                    >
                        Nevermind
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
