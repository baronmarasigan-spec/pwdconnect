
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage, Language } from '../../context/LanguageContext';
import { ApplicationType, ApplicationStatus, User } from '../../types';
import { Upload, FileCheck, Camera, X, CheckCircle, RefreshCw, AlertTriangle, Calendar, ShieldAlert, CreditCard, User as UserIcon, MapPin, Phone, ShieldCheck, Heart, AlertCircle, FileText, ArrowRight, ArrowLeft, Accessibility } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IDCard } from '../../components/IDCard';

export const CitizenID: React.FC = () => {
  const { currentUser, addApplication, applications, getNextPwdIdNumber } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [idCardSide, setIdCardSide] = useState<'front' | 'back'>('front');
  const [formMode, setFormMode] = useState<ApplicationType | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const hasIssuedID = !!currentUser?.pwdIdNumber;

  const pendingIdApp = applications.find(a => 
    a.userId === currentUser?.id && 
    a.status === ApplicationStatus.PENDING &&
    (a.type === ApplicationType.ID_NEW || a.type === ApplicationType.ID_RENEWAL || a.type === ApplicationType.ID_REPLACEMENT)
  );

  const getFieldClass = (fieldName: string) => {
    const hasError = errors.includes(fieldName);
    return `w-full bg-slate-50 border ${hasError ? 'border-red-500 bg-red-50/30' : 'border-slate-200'} rounded-lg px-4 py-2.5 text-sm font-normal uppercase text-[#2d2d2d] shadow-sm transition-all`;
  };

  // Form State
  const [files, setFiles] = useState<string[]>([]);
  const [idFormData, setIdFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    birthDate: '',
    birthPlace: '',
    sex: '',
    citizenship: 'Filipino',
    civilStatus: '',
    address: '',
    contactNumber: '',
    emergencyContactPerson: '',
    emergencyContactNumber: '',
    joinFederation: false,
    disabilityType: '',
    capturedImage: undefined as string | undefined
  });
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCameraOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } else {
        // If ref is not ready, wait a bit and try again
        setTimeout(() => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        }, 100);
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setCameraError("Hindi ma-access ang camera. Pakisuri ang iyong browser permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'renew') setFormMode(ApplicationType.ID_RENEWAL);
    else if (tab === 'new') setFormMode(ApplicationType.ID_NEW);
    else if (tab === 'replace') setFormMode(ApplicationType.ID_REPLACEMENT);
    else if (!hasIssuedID) setFormMode(ApplicationType.ID_NEW);
  }, [searchParams, hasIssuedID]);

  useEffect(() => {
    if (currentUser && formMode) {
      const nameParts = currentUser.name.split(' ');
      setIdFormData({
        firstName: currentUser.firstName || nameParts[0] || '',
        middleName: currentUser.middleName || '',
        lastName: currentUser.lastName || nameParts[nameParts.length - 1] || '',
        suffix: currentUser.suffix || '',
        birthDate: currentUser.birthDate || '',
        birthPlace: currentUser.birthPlace || '',
        sex: currentUser.sex || '',
        citizenship: currentUser.citizenship || 'Filipino',
        civilStatus: currentUser.civilStatus || '',
        address: currentUser.address || '',
        contactNumber: currentUser.contactNumber || '',
        emergencyContactPerson: currentUser.emergencyContactPerson || '',
        emergencyContactNumber: currentUser.emergencyContactNumber || '',
        joinFederation: currentUser.joinFederation || false,
        disabilityType: currentUser.disabilityType || '',
        capturedImage: undefined
      });
    }
  }, [currentUser, formMode]);

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
      setFiles(prev => [...prev.filter(f => !f.includes('Bio_Photo')), `PWD_Biometric_Photo_${Date.now()}.jpg`]);
      setErrors(prev => prev.filter(err => err !== 'capturedImage'));
      setIsCameraOpen(false);
      stopCamera();
    }
  };

  const validateStep1 = () => {
    const newErrors: string[] = [];
    if (!idFormData.disabilityType.trim()) newErrors.push('disabilityType');
    if (!idFormData.firstName.trim()) newErrors.push('firstName');
    if (!idFormData.lastName.trim()) newErrors.push('lastName');
    if (!idFormData.birthDate.trim()) newErrors.push('birthDate');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateStep2 = () => {
    if (files.length === 0) {
      setErrors(['files']);
      return false;
    }
    setErrors([]);
    return true;
  };

  const handleSubmit = () => {
    if (!capturedImage) {
      setErrors(['capturedImage']);
      return;
    }
    const type = formMode || ApplicationType.ID_NEW;
    addApplication({
      userId: currentUser!.id,
      userName: `${idFormData.firstName} ${idFormData.lastName}`,
      type: type,
      description: `Official PWD ID Application. Disability: ${idFormData.disabilityType}. Address: ${idFormData.address}.`,
      documents: files,
      formData: { ...idFormData }
    });
    navigate('/citizen/dashboard');
  };

  if (pendingIdApp && !hasIssuedID) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <RefreshCw size={48} className="animate-spin" />
        </div>
        <h2 className="text-3xl font-normal text-slate-900 mb-4 tracking-tight uppercase">Kasalukuyang Pinoproseso</h2>
        <p className="text-slate-600 max-w-md mb-10 text-lg leading-relaxed font-normal">
          Ang iyong aplikasyon para sa PWD ID ay kasalukuyang sinusuri ng aming admin. Makakatanggap ka ng abiso kapag ito ay aprobado na.
        </p>
        <button 
          onClick={() => navigate('/citizen/dashboard')}
          className="px-12 py-4 bg-[#1e419c] text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95"
        >
          Bumalik sa Dashboard
        </button>
      </div>
    );
  }

  if (hasIssuedID && !formMode) {
      return (
          <div className="max-w-5xl mx-auto space-y-4 pt-6 relative animate-fade-in">
              <button onClick={() => navigate('/citizen/dashboard')} className="absolute top-12 right-0 p-2.5 bg-white rounded-lg shadow-md border border-slate-200 group transition-all z-20">
                  <X size={20} className="text-slate-400 group-hover:text-red-600" />
              </button>
              
              <header className="pb-4 border-b border-slate-200">
                  <h1 className="text-3xl font-normal text-slate-900 tracking-tight uppercase">{t('id_header')}</h1>
                  <p className="text-slate-600 font-normal">{t('id_subheader')}</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)]">
                        <div className="mb-8 relative group">
                            <div className="transition-all duration-500 transform-gpu">
                                <IDCard user={currentUser!} side={idCardSide} />
                            </div>
                            <div className="flex justify-center mt-6">
                                <button 
                                    onClick={() => setIdCardSide(idCardSide === 'front' ? 'back' : 'front')}
                                    className="px-6 py-2.5 bg-white border border-slate-200 rounded-full shadow-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
                                >
                                    <RefreshCw size={12} className={idCardSide === 'back' ? 'rotate-180' : ''} />
                                    {idCardSide === 'front' ? 'View Back Side' : 'View Front Side'}
                                </button>
                            </div>
                        </div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
                          <h3 className="text-xs font-normal text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <Accessibility size={14} /> ID Validity Status
                          </h3>
                          <div className="space-y-4">
                              <div className="flex justify-between items-end pb-3 border-b border-slate-50">
                                  <span className="text-slate-500 text-[10px] font-normal uppercase tracking-wider">Expiration Date</span>
                                  <span className="text-slate-900 font-normal text-sm">{currentUser?.pwdIdExpiryDate || 'N/A'}</span>
                              </div>
                              <div className="p-4 rounded-lg flex items-start gap-3 bg-emerald-50 text-emerald-800 border border-emerald-100">
                                  <CheckCircle size={18} />
                                  <div>
                                      <p className="text-xs font-normal uppercase tracking-wide">Valid Credential</p>
                                      <p className="text-[10px] font-normal opacity-80 mt-1 leading-relaxed">Your PWD ID is active and recognized for mandatory discounts.</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-2">
                        <button 
                            onClick={() => setFormMode(ApplicationType.ID_RENEWAL)}
                            className="w-full py-4 bg-[#1e419c] text-white rounded-lg font-normal text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:opacity-90"
                        >
                            <RefreshCw size={16} /> Renew PWD ID
                        </button>
                        <button 
                            onClick={() => setFormMode(ApplicationType.ID_REPLACEMENT)}
                            className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-lg font-normal text-xs uppercase tracking-widest hover:bg-slate-50 flex items-center justify-center gap-3"
                        >
                            <ShieldAlert size={16} /> Lost or Damaged ID
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pt-6 relative animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
                <h1 className="text-3xl font-normal text-slate-900 tracking-tight uppercase">{t('id_header')}</h1>
                <p className="text-slate-600 font-normal">Step {step} of 3: Enrollment Application</p>
            </div>
            <button onClick={() => { if(hasIssuedID) setFormMode(null); else navigate('/citizen/dashboard'); }} className="p-2.5 bg-white rounded-lg shadow-md border border-slate-200 group transition-all">
                <X size={20} className="text-slate-400 group-hover:text-red-600" />
            </button>
        </div>

        {step === 1 && (
            <div className="bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
                <div className="bg-[#1e419c] px-8 py-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Accessibility size={24} className="text-white/40" />
                        <h2 className="text-xl font-normal uppercase tracking-widest">PWD Registry Details</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1 lg:col-span-3">
                            <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest block ml-1">Type of Disability <span className="text-red-500">*</span></label>
                            <input 
                                type="text"
                                name="disabilityType" 
                                placeholder="Enter disability type (e.g. Visual Impairment)"
                                value={idFormData.disabilityType} 
                                onChange={handleInputChange} 
                                className={getFieldClass('disabilityType')} 
                            />
                            {errors.includes('disabilityType') && <p className="text-[9px] text-red-500 font-medium uppercase mt-1 ml-1">This field is required</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-1">Last Name <span className="text-red-500">*</span></label>
                            <input 
                                name="lastName" 
                                value={idFormData.lastName} 
                                onChange={handleInputChange} 
                                className={getFieldClass('lastName')} 
                            />
                            {errors.includes('lastName') && <p className="text-[9px] text-red-500 font-medium uppercase mt-1 ml-1">Required</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-1">First Name <span className="text-red-500">*</span></label>
                            <input 
                                name="firstName" 
                                value={idFormData.firstName} 
                                onChange={handleInputChange} 
                                className={getFieldClass('firstName')} 
                            />
                            {errors.includes('firstName') && <p className="text-[9px] text-red-500 font-medium uppercase mt-1 ml-1">Required</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-1">Birthdate <span className="text-red-500">*</span></label>
                            <input 
                                type="date" 
                                name="birthDate" 
                                value={idFormData.birthDate} 
                                onChange={handleInputChange} 
                                className={getFieldClass('birthDate')} 
                            />
                            {errors.includes('birthDate') && <p className="text-[9px] text-red-500 font-medium uppercase mt-1 ml-1">Required</p>}
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button onClick={() => validateStep1() && setStep(2)} className="px-10 py-4 bg-[#1e419c] text-white rounded-lg font-normal text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:opacity-90 transition-all">
                            Next: Attach Medical Proof <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {step === 2 && (
             <div className="bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
                <div className="bg-[#1e419c] px-8 py-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3"><FileText size={24} className="text-white/40" /><h2 className="text-xl font-normal uppercase tracking-widest">Medical Documentation</h2></div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100"><p className="text-xs font-normal text-blue-800">Please attach a copy of your Medical Certificate or clinical abstract indicating your disability category.</p></div>
                    <div className={`border-2 border-dashed ${errors.includes('files') ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} rounded-lg p-10 flex flex-col items-center justify-center group hover:bg-slate-100 cursor-pointer relative shadow-inner transition-all`}>
                         <input type="file" multiple onChange={(e) => { if(e.target.files) setFiles([...files, ...Array.from(e.target.files).map((f: any) => f.name)]); setErrors(prev => prev.filter(err => err !== 'files')); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                         <Upload size={32} className={`${errors.includes('files') ? 'text-red-300' : 'text-slate-300'} mb-2`} /><p className={`font-normal ${errors.includes('files') ? 'text-red-400' : 'text-slate-400'}`}>Upload Certificate</p>
                    </div>
                    {errors.includes('files') && <p className="text-[10px] text-red-500 font-medium uppercase text-center">At least one document is required</p>}
                    <div className="flex justify-end gap-3 pt-6"><button onClick={() => setStep(1)} className="px-8 py-3 text-slate-400 font-normal uppercase tracking-widest text-[10px]">Back</button><button onClick={() => validateStep2() && setStep(3)} className="px-10 py-3 bg-[#1e419c] text-white rounded-lg font-normal uppercase tracking-widest text-[10px] shadow-md">Continue</button></div>
                </div>
             </div>
        )}

        {step === 3 && (
             <div className="bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
                <div className="bg-[#1e419c] px-8 py-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3"><Camera size={24} className="text-white/40" /><h2 className="text-xl font-normal uppercase tracking-widest">Biometric Selfie</h2></div>
                </div>
                <div className="p-10 flex flex-col items-center gap-8">
                     <div className={`w-64 h-64 ${errors.includes('capturedImage') ? 'bg-red-50 border-red-500' : 'bg-slate-100 border-slate-200'} rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group shadow-inner transition-all`}>
                        {capturedImage ? <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" /> : <button onClick={() => setIsCameraOpen(true)} className="flex flex-col items-center gap-2"><Camera size={40} className={errors.includes('capturedImage') ? 'text-red-300' : 'text-slate-300'}/><span className={`text-[10px] font-normal ${errors.includes('capturedImage') ? 'text-red-400' : 'text-slate-400'} uppercase tracking-widest`}>Take Bio Capture</span></button>}
                     </div>
                     {errors.includes('capturedImage') && <p className="text-[10px] text-red-500 font-medium uppercase -mt-4">Biometric photo is required</p>}
                     
                     {capturedImage && (
                         <div className="w-full flex flex-col items-center gap-4 animate-scale-up">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Preview with New Photo</p>
                             <IDCard user={{
                                 ...currentUser!,
                                 firstName: idFormData.firstName,
                                 lastName: idFormData.lastName,
                                 middleName: idFormData.middleName,
                                 suffix: idFormData.suffix,
                                 avatarUrl: capturedImage,
                                 pwdIdNumber: getNextPwdIdNumber(),
                                 emergencyContactPerson: idFormData.emergencyContactPerson,
                                 emergencyContactNumber: idFormData.emergencyContactNumber
                             }} />
                         </div>
                     )}

                     <button onClick={handleSubmit} className="w-full py-5 bg-[#1e419c] text-white rounded-lg font-normal text-sm uppercase tracking-widest shadow-xl hover:opacity-90 transition-all">Submit Official PWD Application</button>
                </div>
             </div>
        )}

        {isCameraOpen && (
            <div className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xl bg-black rounded-xl overflow-hidden relative border-4 border-white/10 shadow-2xl">
                    {cameraError ? (
                        <div className="w-full aspect-video flex flex-col items-center justify-center p-8 text-center bg-slate-900">
                            <ShieldAlert size={48} className="text-red-500 mb-4" />
                            <p className="text-white text-sm mb-6">{cameraError}</p>
                            <button 
                                onClick={() => setIsCameraOpen(false)}
                                className="px-6 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold uppercase tracking-widest"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto" />
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center"><div className="w-[300px] h-[300px] border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div></div>
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start"><div className="bg-[#1e419c] text-white px-4 py-2 rounded-lg text-[10px] font-normal uppercase tracking-widest shadow-lg">Scan Active</div><button onClick={() => setIsCameraOpen(false)} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all"><X size={24}/></button></div>
                            <div className="absolute bottom-8 left-0 right-0 flex justify-center"><button onClick={capturePhoto} className="p-1 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"><div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center"><div className="w-12 h-12 bg-slate-900 rounded-full"></div></div></button></div>
                        </>
                    )}
                </div>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
