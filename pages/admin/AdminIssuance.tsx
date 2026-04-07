
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType, Role, User, Application } from '../../types';
import { IDCard } from '../../components/IDCard';
import { 
  Printer, CheckCircle, Search, CreditCard, XCircle, Clock, Archive, 
  UserPlus, Info, Calendar, User as UserIcon, X, ShieldCheck, Heart, 
  Eye, Download, FileText, AlertCircle, Trash2, MapPin, Phone, 
  ShieldAlert, Globe, Fingerprint, Camera, Upload, ArrowRight, ArrowLeft,
  AlertTriangle, ZoomIn, ZoomOut, File, Tag, HelpCircle, RefreshCw, Activity, CloudOff, Database, ClipboardList, Layers
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

export const AdminIssuance: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { applications, users, updateApplicationStatus, addApplication, issueIdCard, syncApplications, syncError, actionError, setActionError, isLiveMode, getNextPwdIdNumber } = useApp();
  
  // Persistence & Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // UI State
  const [isApplying, setIsApplying] = useState<User | null>(null);
  const [walkInStep, setWalkInStep] = useState(1);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [viewingIdOnly, setViewingIdOnly] = useState<Application | null>(null);
  const [rejectingApp, setRejectingApp] = useState<Application | null>(null);
  const [confirmingReleaseApp, setConfirmingReleaseApp] = useState<Application | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  // Camera State for Walk-in
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form State for Walk-in
  const [idFormData, setIdFormData] = useState({
    firstName: '', middleName: '', lastName: '', suffix: '', birthDate: '', birthPlace: '', sex: '', citizenship: 'Filipino', civilStatus: '',
    address: '', contactNumber: '', emergencyContactPerson: '', emergencyContactNumber: '', joinFederation: false, disabilityType: '', capturedImage: undefined as string | undefined
  });
  const [errors, setErrors] = useState<string[]>([]);

  const getFieldClass = (fieldName: string) => {
    const hasError = errors.includes(fieldName);
    return `w-full bg-slate-50 border ${hasError ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium uppercase outline-none focus:border-[#1e419c] transition-all`;
  };

  const isIdApplication = (type: ApplicationType) => {
    return type === ApplicationType.ID_NEW || type === ApplicationType.ID_RENEWAL || type === ApplicationType.ID_REPLACEMENT;
  };

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
    if (tab !== 'walk-in') triggerManualSync();
  }, [tab, triggerManualSync]);

  useEffect(() => {
    if (isApplying) {
      const nameParts = isApplying.name.split(' ');
      setIdFormData({
        firstName: isApplying.firstName || nameParts[0] || '',
        middleName: isApplying.middleName || '',
        lastName: isApplying.lastName || nameParts[nameParts.length - 1] || '',
        suffix: isApplying.suffix || '',
        birthDate: isApplying.birthDate || '',
        birthPlace: isApplying.birthPlace || '',
        sex: isApplying.sex || '',
        citizenship: isApplying.citizenship || 'Filipino',
        civilStatus: isApplying.civilStatus || '',
        address: isApplying.address || '',
        contactNumber: isApplying.contactNumber || '',
        emergencyContactPerson: isApplying.emergencyContactPerson || '',
        emergencyContactNumber: isApplying.emergencyContactNumber || '',
        joinFederation: isApplying.joinFederation || false,
        disabilityType: isApplying.disabilityType || '',
        capturedImage: undefined
      });
      setFiles(['Verified_By_Admin_Physical_Copy.pdf']);
      setWalkInStep(1);
      setCapturedImage(null);
    }
  }, [isApplying]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setIdFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    if (errors.includes(name)) {
      setErrors(prev => prev.filter(err => err !== name));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
      const x = (videoRef.current.videoWidth - size) / 2;
      const y = (videoRef.current.videoHeight - size) / 2;
      canvasRef.current.width = 600;
      canvasRef.current.height = 600;
      ctx?.drawImage(videoRef.current, x, y, size, size, 0, 0, 600, 600);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      setIdFormData(prev => ({ ...prev, capturedImage: dataUrl }));
      setFiles(prev => [...prev.filter(f => !f.includes('Bio_Photo')), `WalkIn_Biometric_Photo_${Date.now()}.jpg`]);
      setErrors(prev => prev.filter(err => err !== 'capturedImage'));
      setIsCameraOpen(false);
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    }
  };

  const validateWalkInStep1 = () => {
    const newErrors: string[] = [];
    if (!idFormData.firstName.trim()) newErrors.push('firstName');
    if (!idFormData.lastName.trim()) newErrors.push('lastName');
    if (!idFormData.birthDate.trim()) newErrors.push('birthDate');
    if (!idFormData.disabilityType.trim()) newErrors.push('disabilityType');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleConfirmApplication = async () => {
    if (!capturedImage) {
      setErrors(['capturedImage']);
      return;
    }
    if (!isApplying) return;
    const res = await addApplication({
        userId: isApplying.id,
        userName: `${idFormData.firstName} ${idFormData.lastName}`,
        type: ApplicationType.ID_NEW,
        description: `Walk-in ID Application Form Submitted by Admin.`,
        documents: files,
        formData: { ...idFormData }
    });
    if (res.ok) {
        setIsApplying(null);
        setSuccessMessage("Walk-in ID application reflected in database.");
        setTimeout(() => setSuccessMessage(null), 5000);
        navigate('/admin/id/all');
    }
  };

  const handleApprove = async (id: string) => {
    await updateApplicationStatus(id, ApplicationStatus.APPROVED);
    setViewingApp(null);
    setSuccessMessage(`Application #${id} status updated to APPROVED.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingApp) {
      await updateApplicationStatus(rejectingApp.id, ApplicationStatus.REJECTED, rejectionRemarks);
      setRejectingApp(null);
      setRejectionRemarks('');
      setViewingApp(null);
      setSuccessMessage(`Application #${rejectingApp.id} status updated to REJECTED.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleConfirmRelease = async () => {
    if (confirmingReleaseApp) {
      await issueIdCard(confirmingReleaseApp.id);
      setConfirmingReleaseApp(null);
      setSuccessMessage(`ID officially released to citizen.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const counts = useMemo(() => {
    const ids = applications.filter(a => isIdApplication(a.type));
    return {
      all: ids.length,
      pending: ids.filter(a => a.status === ApplicationStatus.PENDING).length,
      clarification: ids.filter(a => a.status === ApplicationStatus.CLARIFICATION).length,
      approved: ids.filter(a => a.status === ApplicationStatus.APPROVED).length,
      rejected: ids.filter(a => a.status === ApplicationStatus.REJECTED).length,
    };
  }, [applications]);

  const filteredApps = useMemo(() => {
    const ids = applications.filter(a => isIdApplication(a.type));
    let list = ids;
    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      list = list.filter(a => a.userName.toLowerCase().includes(query) || a.id.includes(query));
    }
    return list;
  }, [applications, statusFilter, searchTerm]);

  const ApplicationDetailsModal = ({ app, onClose }: { app: Application, onClose: () => void }) => {
    const user = users.find(u => u.id === app.userId);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
           <div className="bg-[#1e419c] p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl text-white"><CreditCard size={24} /></div>
                  <div><h2 className="text-xl font-normal uppercase tracking-widest">{app.type} Review</h2><p className="text-[10px] text-white/60 font-medium uppercase tracking-widest mt-1">Application ID: {app.id} {user?.pwdIdNumber && `| PWD ID: ${user.pwdIdNumber}`}</p></div>
              </div>
              <button onClick={onClose} className="p-2 text-white/60 hover:text-white transition-colors"><X size={24} /></button>
           </div>
           <div className="flex-1 overflow-y-auto p-10 bg-slate-50 space-y-8 custom-scrollbar">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                  <img src={app.formData?.capturedImage || user?.avatarUrl || 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png'} className="w-32 h-32 rounded-xl bg-slate-100 border-4 border-white shadow-xl object-cover" alt="Avatar" />
                  <div className="flex-1 text-center md:text-left space-y-2">
                      <h3 className="text-[28px] font-normal text-slate-900 uppercase tracking-tight">{app.userName}</h3>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-medium uppercase tracking-widest border border-slate-200">Applied: {app.date}</span>
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-widest shadow-md ${app.status === ApplicationStatus.APPROVED ? 'bg-emerald-600 text-white' : 'bg-[#1e419c] text-white'}`}>{app.status}</span>
                      </div>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Identity Details</h4>
                      <p className="text-xs font-medium text-slate-500 uppercase">Birthplace: <span className="text-slate-900 font-medium">{app.formData?.birthPlace || '---'}</span></p>
                      <p className="text-xs font-medium text-slate-500 uppercase">Address: <span className="text-slate-900 font-medium">{app.formData?.address || '---'}</span></p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Administrative Files</h4>
                      <div className="space-y-2">
                          {app.documents?.map((doc, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-xl">
                                  <span className="text-[9px] font-medium uppercase text-slate-400 truncate max-w-[150px]">{doc}</span>
                                  <button onClick={() => setActiveFile(doc)} className="text-[#1e419c]"><Eye size={14}/></button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
           </div>
           <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
               {app.status === ApplicationStatus.PENDING ? (
                 <>
                   <button onClick={() => setRejectingApp(app)} className="px-6 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-medium uppercase tracking-widest text-[10px]">Reject Claim</button>
                   <button onClick={() => handleApprove(app.id)} className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-medium uppercase tracking-widest text-[10px] shadow-xl">Approve ID</button>
                 </>
               ) : (
                 <button onClick={onClose} className="px-12 py-3 bg-[#1e419c] text-white rounded-xl font-medium uppercase tracking-widest text-[10px]">Close Record</button>
               )}
           </div>
        </div>
      </div>
    );
  };

  const IDPrintModal = ({ app, onClose }: { app: Application, onClose: () => void }) => {
    const user = users.find(u => u.id === app.userId);
    if (!user) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
        <div className="bg-white rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up p-10 items-center gap-8 max-w-6xl w-full">
           <h2 className="text-xl font-normal uppercase tracking-widest text-slate-800 w-full text-center">ID Preview Handshake</h2>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 justify-items-center w-full">
              <div className="space-y-4 flex flex-col items-center">
                <IDCard user={{
                  ...user, 
                  avatarUrl: app.formData?.capturedImage || user.avatarUrl,
                  emergencyContactPerson: app.formData?.emergencyContactPerson || user.emergencyContactPerson,
                  emergencyContactNumber: app.formData?.emergencyContactNumber || user.emergencyContactNumber
                }} side="front" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Front Side</span>
              </div>
              <div className="space-y-4 flex flex-col items-center">
                <IDCard user={{
                  ...user, 
                  avatarUrl: app.formData?.capturedImage || user.avatarUrl,
                  emergencyContactPerson: app.formData?.emergencyContactPerson || user.emergencyContactPerson,
                  emergencyContactNumber: app.formData?.emergencyContactNumber || user.emergencyContactNumber
                }} side="back" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Back Side</span>
              </div>
           </div>
           <div className="flex gap-4 w-full max-w-md">
              <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-medium text-[10px] uppercase tracking-widest">Close</button>
              <button onClick={() => window.print()} className="flex-1 py-4 bg-[#1e419c] text-white rounded-2xl font-medium text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Printer size={16} /> Print Official ID</button>
           </div>
        </div>
      </div>
    );
  };

  const renderRejectionModal = () => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRejectingApp(null)} />
        <form onSubmit={handleRejectSubmit} className="bg-white w-full max-md rounded-3xl shadow-2xl relative z-20 overflow-hidden animate-scale-up">
            <div className="bg-red-50 p-6 flex items-center gap-3 border-b border-red-100"><XCircle className="text-red-600" size={20} /><h3 className="font-normal text-red-900 uppercase tracking-widest">Disapproval Confirmation</h3></div>
            <div className="p-8 space-y-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Provide details for the rejection:</p>
                <textarea required value={rejectionRemarks} onChange={(e) => setRejectionRemarks(e.target.value)} placeholder="e.g. Identity documents mismatch." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-900 outline-none focus:border-red-500 resize-none" rows={4} />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3"><button type="button" onClick={() => setRejectingApp(null)} className="px-4 py-2 text-slate-400 font-medium text-xs uppercase tracking-widest">Cancel</button><button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium text-xs uppercase tracking-widest shadow-lg">Confirm Reject</button></div>
        </form>
    </div>
  );

  const renderConfirmReleaseModal = () => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmingReleaseApp(null)} />
        <div className="bg-white w-full max-sm rounded-[2rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up">
           <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 text-[#1e419c] rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-blue-100"><Tag size={40} /></div>
              <div className="space-y-2">
                 <h3 className="text-xl font-normal text-slate-900 uppercase tracking-tight">Confirm Physical Release?</h3>
                 <p className="text-sm font-medium text-slate-500 leading-relaxed">This marks the ID for <span className="text-slate-900 font-medium">{confirmingReleaseApp?.userName}</span> as officially collected and issued.</p>
              </div>
           </div>
           <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3"><button onClick={() => setConfirmingReleaseApp(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-medium text-[10px] uppercase tracking-widest">Cancel</button><button onClick={handleConfirmRelease} className="flex-1 py-3 bg-[#1e419c] text-white rounded-xl font-medium text-[10px] uppercase tracking-widest shadow-lg">Confirm Release</button></div>
        </div>
    </div>
  );

  if (tab === 'walk-in') {
      const walkinCitizens = users.filter(u => 
        u.role === Role.CITIZEN && 
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.includes(searchTerm))
      );
      return (
        <div className="space-y-6 animate-fade-in">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-[32px] font-normal text-slate-800">Walk-in id application</h1>
              <p className="text-slate-500 font-medium">Search registry and initiate ID issuance processes for on-site citizens.</p>
            </div>
          </header>
          {successMessage && <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-700 text-xs font-medium uppercase tracking-widest animate-fade-in-down flex items-center gap-2"><CheckCircle size={16}/> {successMessage}</div>}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="relative max-w-xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input type="text" placeholder="Search registry node by name or database ID..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1e419c]/10 transition-all font-medium text-sm text-slate-900 uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#1e419c] text-white text-[10px] font-normal uppercase tracking-[0.2em]"><tr><th className="p-8">Citizen Profile</th><th className="p-8">Birthdate</th><th className="p-8 text-right">Action Grid</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {walkinCitizens.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                            <img 
                                                src={user.avatarUrl || 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png'} 
                                                alt={user.name} 
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="font-medium text-slate-800 uppercase tracking-tight text-sm leading-tight">{user.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">Entry #{user.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8 text-xs font-medium text-slate-500 uppercase">{user.birthDate || '---'}</td>
                                <td className="p-8 text-right"><button onClick={() => setIsApplying(user)} className="px-6 py-3 bg-[#1e419c] text-white rounded-xl font-medium text-[10px] uppercase tracking-widest shadow-lg hover:opacity-90 transition-all">Enroll for ID</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
          {isApplying && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsApplying(null)} />
               <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
                  <div className="bg-[#1e419c] p-8 text-white flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl"><CreditCard size={24} /></div>
                        <div><h2 className="text-xl font-normal uppercase tracking-widest">Administrative ID Wizard</h2><p className="text-[10px] text-white/60 font-medium uppercase mt-1.5">Step {walkInStep} of 3</p></div>
                      </div>
                      <button onClick={() => setIsApplying(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-10 bg-slate-50 custom-scrollbar space-y-8">
                     <div className="flex items-center gap-4 mb-10">
                        {[1, 2, 3].map(s => <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${walkInStep >= s ? 'bg-[#1e419c]' : 'bg-slate-200'}`}></div>)}
                     </div>
                     {walkInStep === 1 && (
                        <div className="animate-fade-in-up space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Registry Data Extraction</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-medium text-slate-400 uppercase ml-1">First Name <span className="text-red-500">*</span></label>
                                        <input name="firstName" value={idFormData.firstName} onChange={handleInputChange} className={getFieldClass('firstName')} />
                                        {errors.includes('firstName') && <p className="text-[8px] text-red-500 font-medium uppercase ml-1">Required</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Last Name <span className="text-red-500">*</span></label>
                                        <input name="lastName" value={idFormData.lastName} onChange={handleInputChange} className={getFieldClass('lastName')} />
                                        {errors.includes('lastName') && <p className="text-[8px] text-red-500 font-medium uppercase ml-1">Required</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Birthdate <span className="text-red-500">*</span></label>
                                        <input type="date" name="birthDate" value={idFormData.birthDate} onChange={handleInputChange} className={getFieldClass('birthDate')} />
                                        {errors.includes('birthDate') && <p className="text-[8px] text-red-500 font-medium uppercase ml-1">Required</p>}
                                    </div>
                                    <div className="space-y-1.5"><label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Gender</label><select name="sex" value={idFormData.sex} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-[#1e419c]"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                                </div>
                                <div className="space-y-1.5"><label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Type of Disability <span className="text-red-500">*</span></label>
                                     <input 
                                        type="text"
                                        name="disabilityType" 
                                        placeholder="e.g. Visual Impairment"
                                        value={idFormData.disabilityType} 
                                        onChange={handleInputChange} 
                                        className={getFieldClass('disabilityType')} 
                                     />
                                     {errors.includes('disabilityType') && <p className="text-[8px] text-red-500 font-medium uppercase ml-1">Required</p>}
                                 </div>
                                 <div className="space-y-1.5"><label className="text-[9px] font-medium text-slate-400 uppercase ml-1">Current Address</label><input name="address" value={idFormData.address} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium uppercase outline-none focus:border-[#1e419c]" /></div>
                            </div>
                        </div>
                     )}
                     {walkInStep === 2 && (
                        <div className="animate-fade-in-up space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6 text-center">
                                <Upload size={32} className="mx-auto text-[#1e419c]" />
                                <h4 className="font-medium text-slate-800 uppercase tracking-widest text-sm">Administrative Requirements Scan</h4>
                                <p className="text-slate-600 text-xs font-medium">Verify physical PSA and Residency documents on desk.</p>
                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                   {files.map((f, i) => <div key={i} className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[9px] font-medium uppercase">{f}</div>)}
                                </div>
                            </div>
                        </div>
                     )}
                     {walkInStep === 3 && (
                        <div className="animate-fade-in-up space-y-8 flex flex-col items-center">
                            <div className={`aspect-square w-64 ${errors.includes('capturedImage') ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-slate-200'} border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden group transition-all`}>
                                {capturedImage ? <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" alt="Captured" /> : <button onClick={() => { setIsCameraOpen(true); startCamera(); }} className="flex flex-col items-center gap-4"><Camera size={32} className={errors.includes('capturedImage') ? 'text-red-300' : 'text-[#1e419c]'} /><p className={`text-[9px] font-medium uppercase ${errors.includes('capturedImage') ? 'text-red-400' : 'text-slate-400'}`}>Capture Bio Photo</p></button>}
                                {capturedImage && <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"><X size={12}/></button>}
                            </div>
                            {capturedImage && (
                                <div className="w-full flex flex-col items-center gap-4 animate-scale-up">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Preview with New Photo</p>
                                    <IDCard user={{
                                        id: isApplying?.id || 'WALKIN-TEMP',
                                        role: Role.CITIZEN,
                                        name: `${idFormData.firstName} ${idFormData.lastName}`,
                                        firstName: idFormData.firstName,
                                        lastName: idFormData.lastName,
                                        middleName: idFormData.middleName,
                                        suffix: idFormData.suffix,
                                        birthDate: idFormData.birthDate,
                                        sex: idFormData.sex,
                                        address: idFormData.address,
                                        email: 'walkin@temp.com',
                                        disabilityType: idFormData.disabilityType,
                                        avatarUrl: capturedImage,
                                        pwdIdNumber: getNextPwdIdNumber()
                                    }} />
                                </div>
                            )}
                            <div className="bg-[#1e419c] p-8 rounded-[2.5rem] text-white w-full text-center"><p className="text-[10px] font-medium uppercase tracking-widest leading-relaxed">System will auto-validate registry handshake upon submission.</p></div>
                             {errors.includes('capturedImage') && <p className="text-[10px] text-red-500 font-medium uppercase -mt-4">Biometric photo is required</p>}
                        </div>
                     )}
                  </div>
                  <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
                      <button onClick={() => walkInStep === 1 ? setIsApplying(null) : setWalkInStep(walkInStep - 1)} className="px-10 py-3 text-slate-400 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50">Previous Step</button>
                      <button onClick={() => walkInStep < 3 ? (walkInStep === 1 ? validateWalkInStep1() && setWalkInStep(walkInStep + 1) : setWalkInStep(walkInStep + 1)) : handleConfirmApplication()} className="px-14 py-3 bg-[#1e419c] text-white font-medium text-[10px] uppercase tracking-widest rounded-xl shadow-xl hover:opacity-90">{walkInStep === 3 ? 'Reflect in Database' : 'Continue'}</button>
                  </div>
               </div>
            </div>
          )}
          {isCameraOpen && <div className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col items-center justify-center p-4"><div className="w-full max-w-xl bg-black rounded-3xl overflow-hidden relative border-4 border-white/10 shadow-2xl"><video ref={videoRef} autoPlay playsInline className="w-full h-auto" /><div className="absolute inset-0 pointer-events-none flex items-center justify-center"><div className="w-[300px] h-[300px] border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div></div><div className="absolute top-6 left-6 right-6 flex justify-between items-start"><div className="bg-[#1e419c] text-white px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-widest shadow-lg">Bio Scan Active</div><button onClick={() => { setIsCameraOpen(false); if(videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); }} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all"><X size={24}/></button></div><div className="absolute bottom-8 left-0 right-0 flex justify-center"><button onClick={capturePhoto} className="p-1 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"><div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center"><div className="w-12 h-12 bg-slate-900 rounded-full"></div></div></button></div></div></div>}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in">
        {viewingApp && <ApplicationDetailsModal app={viewingApp} onClose={() => setViewingApp(null)} />}
        {viewingIdOnly && <IDPrintModal app={viewingIdOnly} onClose={() => setViewingIdOnly(null)} />}
        {activeFile && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md" onClick={() => setActiveFile(null)}><div className="bg-white p-8 rounded-3xl shadow-2xl text-center"><p className="font-medium text-slate-800 uppercase tracking-widest text-sm mb-4">Requirement View: {activeFile}</p><div className="w-64 h-64 bg-slate-100 rounded-xl mb-4 border border-slate-200 animate-pulse flex items-center justify-center"><FileText size={48} className="text-slate-300"/></div><button onClick={() => setActiveFile(null)} className="px-8 py-2 bg-[#1e419c] text-white rounded-xl text-[10px] font-medium uppercase tracking-widest">Close</button></div></div>}
        {rejectingApp && renderRejectionModal()}
        {confirmingReleaseApp && renderConfirmReleaseModal()}
        {actionError && <div className="bg-red-50 border-2 border-red-200 p-8 rounded-[2.5rem] flex items-start gap-6 shadow-lg animate-shake"><ShieldAlert size={32} className="text-red-600 shrink-0" /><div className="space-y-2"><h3 className="text-xl font-normal text-red-900 uppercase tracking-tight">Database Connectivity Error</h3><p className="text-red-700 text-sm font-medium">{actionError}</p></div><button onClick={() => setActionError(null)} className="ml-auto text-red-600"><X size={20}/></button></div>}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div><h1 className="text-[32px] font-normal text-slate-800">Id issuance management</h1><div className="flex items-center gap-4 mt-2"><p className="text-slate-500 font-medium text-lg">Central ID Lifecycle Registry</p><div className={`flex items-center gap-2 px-3 py-1 ${isLiveMode ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} border rounded-full ${isSyncing ? 'animate-pulse' : ''}`}>{isLiveMode ? <Activity size={14} className="text-emerald-500" /> : <CloudOff size={14} className="text-amber-500" />}<span className={`text-[9px] font-medium uppercase tracking-[0.2em] ${isLiveMode ? 'text-emerald-600' : 'text-amber-600'}`}>{isLiveMode ? 'API SYNC ACTIVE' : 'LOCAL CACHE MODE'}</span></div></div></div>
            <div className="flex flex-col items-end gap-2"><button onClick={triggerManualSync} disabled={isSyncing} className="flex items-center gap-2 px-6 py-3 bg-[#1e419c] text-white rounded-2xl font-medium text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl disabled:opacity-50"><RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />{isSyncing ? 'Handshaking...' : 'Sync Database'}</button>{lastSync && <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Last Sync: {lastSync}</span>}</div>
        </header>

        {successMessage && <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] text-emerald-700 text-xs font-medium animate-fade-in-down flex items-start gap-3 shadow-sm"><CheckCircle className="shrink-0 mt-0.5" size={18}/><div className="space-y-1"><p className="font-medium uppercase tracking-widest text-[10px]">Operation Successful</p><p>{successMessage}</p></div></div>}

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
            <div className="p-8 border-b border-slate-100 bg-slate-50/40 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-[#1e419c]" size={20} /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search ID applications..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#1e419c]/10 outline-none transition-all text-sm text-slate-900 font-medium uppercase tracking-tight" /></div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-medium text-slate-500 uppercase tracking-widest"><Database size={12} className="text-[#1e419c]" /> Total Registry Logs: {filteredApps.length}</div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100/50">
                    {[
                        { id: 'all', label: 'All ID Records', icon: Layers, count: counts.all },
                        { id: ApplicationStatus.PENDING, label: 'Walk-in', icon: Clock, count: counts.pending },
                        { id: ApplicationStatus.CLARIFICATION, label: 'Clarification', icon: HelpCircle, count: counts.clarification },
                        { id: ApplicationStatus.APPROVED, label: 'For Issuance', icon: CheckCircle, count: counts.approved },
                        { id: ApplicationStatus.REJECTED, label: 'Rejected', icon: XCircle, count: counts.rejected }
                    ].map(tabOpt => (
                        <button key={tabOpt.id} onClick={() => setStatusFilter(tabOpt.id as any)} className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-[10px] uppercase tracking-widest transition-all ${statusFilter === tabOpt.id ? 'bg-[#1e419c] text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}><tabOpt.icon size={14} />{tabOpt.label}<span className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium ${statusFilter === tabOpt.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{tabOpt.count}</span></button>
                    ))}
                </div>
            </div>

            {filteredApps.length === 0 ? (
                <div className="p-32 text-center text-slate-300"><div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Database size={60} className="opacity-10" /></div><p className="font-medium uppercase tracking-[0.3em] text-xs text-slate-400">{isSyncing ? 'Polling...' : 'No records found.'}</p></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1e419c] text-white text-[10px] font-normal uppercase tracking-[0.2em]"><tr><th className="p-8">ID Applicant Profile</th><th className="p-8">ID Lifecycle Status</th><th className="p-8">Applied Date</th><th className="p-8 text-right">Action Grid</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredApps.map(app => (
                                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
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
                                                <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">{app.type} Entry #{app.id} {users.find(u => u.id === app.userId)?.pwdIdNumber && `| PWD ID: ${users.find(u => u.id === app.userId)?.pwdIdNumber}`}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8"><span className={`px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-widest border ${
                                        app.status === ApplicationStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                        app.status === ApplicationStatus.APPROVED ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                        app.status === ApplicationStatus.ISSUED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        app.status === ApplicationStatus.CLARIFICATION ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-red-50 text-red-600 border-red-100'
                                    }`}>{app.status}</span></td>
                                    <td className="p-8"><span className="text-xs font-medium text-slate-600 flex items-center gap-2"><Calendar size={14} className="text-slate-300" /> {app.date}</span></td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            {app.status === ApplicationStatus.PENDING ? (
                                                <><button onClick={() => setViewingApp(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-[#1e419c] hover:text-white transition-all flex items-center gap-2 shadow-sm"><Eye size={14} /> Review</button><button onClick={() => setRejectingApp(app)} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white shadow-xl shadow-red-600/10 transition-all active:scale-95"><XCircle size={18} /></button><button onClick={() => handleApprove(app.id)} className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"><CheckCircle size={18}/></button></>
                                            ) : app.status === ApplicationStatus.APPROVED ? (
                                                <><button onClick={() => setViewingIdOnly(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"><Printer size={14} /> Print ID</button><button onClick={() => setConfirmingReleaseApp(app)} className="px-4 py-3 bg-[#1e419c] text-white rounded-xl hover:bg-opacity-90 transition-all"><Tag size={18}/></button></>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => setViewingApp(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#1e419c] hover:text-white transition-all flex items-center gap-2 shadow-sm"><Eye size={14} /> Details</button>
                                                    <button onClick={() => updateApplicationStatus(app.id, ApplicationStatus.PENDING)} className="px-6 py-3 bg-white border border-slate-200 text-slate-400 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:text-primary-600 transition-all shadow-sm">Restore</button>
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
