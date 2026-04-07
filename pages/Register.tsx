
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, 
  ArrowRight, Upload, FileCheck, X, User as UserIcon, 
  MapPin, Phone, Calendar, Heart, Banknote, ShieldAlert,
  FileText, RefreshCw, AlertCircle, Info
} from 'lucide-react';
import { ApplicationType } from '../types';
import { notifyRegistrationSuccess } from '../services/notification';

const SLIDES = [
  "https://picsum.photos/seed/pwd_ph1/800/600",
  "https://picsum.photos/seed/pwd_ph2/800/600",
  "https://picsum.photos/seed/pwd_ph3/800/600"
];

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

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addApplication, getNextPwdIdNumber } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const queryParams = new URLSearchParams(location.search);
  const isWalkIn = queryParams.get('isWalkIn') === 'true';

  const [formData, setFormData] = useState({
    // Personal Information
    controlNo: '',
    dateApplied: new Date().toISOString().split('T')[0],
    officeUnit: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    birthDate: '',
    gender: '',
    civilStatus: '',
    
    // Disability Information
    typeOfDisability: '',
    causeOfDisability: '',
    
    // Address Information
    streetAddress: '',
    barangay: '',
    cityMunicipality: 'San Juan City',
    province: 'Metro Manila',
    region: 'NCR',
    
    // Contact Information
    landline: '',
    mobileNumber: '',
    emailAddress: '',
    
    // Emergency Contact
    emergencyContactPerson: '',
    emergencyContactNumber: '',
    relationship: '',
    
    // Education and Employment
    highestEducation: '',
    employmentStatus: '',
    employmentType: '',
    employmentCategory: '',
    occupation: '',
    
    // Organization Information
    orgName: '',
    orgContactPerson: '',
    orgAddress: '',
    orgContactNo: '',
    
    // Government IDs
    sssNumber: '',
    gsisNumber: '',
    pagIbigNumber: '',
    psnNumber: '',
    philHealthNumber: '',
    
    // Family Information
    fatherName: '',
    motherName: '',
    guardianName: '',

    // Security
    username: '',
    password: '',
    confirmPassword: '',
    
    // Legacy/Internal compatibility
    appointmentDate: '',
    disabilityType: '', // Will sync with typeOfDisability
    contactNumber: '', // Will sync with mobileNumber
    email: '', // Will sync with emailAddress
  });

  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    // Auto-generate control number on mount
    const nextId = getNextPwdIdNumber();
    setFormData(prev => ({ ...prev, controlNo: nextId }));
  }, [getNextPwdIdNumber]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const val = type === 'checkbox' ? target.checked : value;
    
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      
      // Sync legacy fields
      if (name === 'typeOfDisability') next.disabilityType = value;
      if (name === 'mobileNumber') next.contactNumber = value;
      if (name === 'emailAddress') next.email = value;
      
      return next;
    });

    if (errors.includes(name)) {
      setErrors(prev => prev.filter(err => err !== name));
    }
  };

  const getFieldClass = (name: string, isRequired: boolean) => {
    const base = "w-full bg-white border rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none transition-all";
    if (errors.includes(name)) {
      return `${base} border-red-500 ring-1 ring-red-100 bg-red-50/10`;
    }
    return `${base} border-slate-200`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => f.name);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    const newErrors: string[] = [];
    if (step === 1) {
        if (!formData.firstName) newErrors.push('firstName');
        if (!formData.lastName) newErrors.push('lastName');
        if (!formData.birthDate) newErrors.push('birthDate');
        if (!formData.gender) newErrors.push('gender');
        if (!formData.typeOfDisability) newErrors.push('typeOfDisability');
        
        if (newErrors.length > 0) {
            setErrors(newErrors);
            setError('Pakisagutan ang lahat ng mandatory fields (*)');
            return;
        }
    }
    if (step === 2) {
        if (!formData.barangay) newErrors.push('barangay');
        if (!formData.mobileNumber) newErrors.push('mobileNumber');
        if (!formData.emailAddress) newErrors.push('emailAddress');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setError('Pakisagutan ang lahat ng mandatory fields (*)');
            return;
        }
    }
    if (step === 3) {
        if (!formData.emergencyContactPerson) newErrors.push('emergencyContactPerson');
        if (!formData.emergencyContactNumber) newErrors.push('emergencyContactNumber');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setError('Pakisagutan ang lahat ng mandatory fields (*)');
            return;
        }
    }
    if (step === 4) {
        if (!formData.username) newErrors.push('username');
        if (!formData.password) newErrors.push('password');
        if (!formData.confirmPassword) newErrors.push('confirmPassword');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setError('Pakisagutan ang lahat ng mandatory fields (*)');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Hindi magkatugma ang password.');
            setErrors(['password', 'confirmPassword']);
            return;
        }
    }
    setError('');
    setErrors([]);
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await addApplication({
        userId: `new_${Date.now()}`,
        userName: `${formData.firstName} ${formData.lastName}`,
        type: ApplicationType.REGISTRATION,
        description: `New PWD Online Registration. Category: ${formData.disabilityType}`,
        formData: {
          ...formData,
          address: `${formData.streetAddress}, ${formData.barangay}, ${formData.cityMunicipality}`,
          isWalkIn: isWalkIn
        },
        appointmentDate: formData.appointmentDate,
        documents: files
      });

      if (result.ok) {
        await notifyRegistrationSuccess(formData.firstName, formData.contactNumber, formData.email);
        setStep(6);
      } else {
        setError(result.error || 'May error sa pag-rehistro. Pakisubukang muli.');
      }
    } catch (err) {
      setError('System error. Pakisubukang muli mamaya.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 6) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-xl shadow-2xl p-12 max-w-2xl w-full text-center space-y-8 animate-scale-up border border-slate-100">
           <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-lg">
             <CheckCircle2 size={48} />
           </div>
           <div className="space-y-4">
             <h2 className="text-[32px] font-normal text-slate-900 tracking-tight uppercase">Salamat sa Pag-rehistro!</h2>
             <p className="text-slate-600 text-lg leading-relaxed font-normal">
               Ang iyong aplikasyon para sa PWD ID ay natanggap na namin. Ang aming team sa PDAO ay susuriin ang iyong mga dokumento.
             </p>
             <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 flex items-start gap-4 text-left font-normal">
                <Info size={24} className="text-primary-500 shrink-0" />
                <p className="text-sm text-slate-600 font-normal">
                   Makakatanggap ka ng SMS o Email notification kapag aprobado na ang iyong application. Maaari mo ring bisitahin ang San Juan City Hall para sa karagdagang verification.
                </p>
             </div>
           </div>
           <button 
             onClick={() => navigate('/')}
             className="w-full bg-[#1e419c] text-white py-5 rounded-lg font-semibold text-lg uppercase tracking-widest shadow-xl hover:opacity-90 transition-all active:scale-95"
           >
             Bumalik sa Login
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col lg:flex-row overflow-hidden">
      <div className="hidden lg:flex lg:w-2/5 bg-[#1e419c] relative flex-col justify-between p-16 text-white">
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          {SLIDES.map((slide, i) => (
            <img 
              key={i} 
              src={slide} 
              alt="Slide" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e419c]/80 to-[#1e419c]"></div>
        </div>

        <div className="relative z-10 space-y-8">
           <div className="flex items-center gap-4">
              <img src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" className="h-16 w-auto" alt="Seal" />
              <h1 className="text-2xl font-black uppercase tracking-widest leading-none">San Juan City <br/><span className="text-primary-300 font-normal">PWD Connect</span></h1>
           </div>
           <div className="space-y-4">
              <h2 className="text-5xl font-light leading-tight tracking-tight">Kaisa ka namin sa <br/><span className="font-normal text-white">pag-unlad.</span></h2>
              <p className="text-white/70 text-lg font-light leading-relaxed max-w-md">
                Ang programang ito ay naglalayong magbigay ng mas mabilis na serbisyo at suporta para sa ating mga Persons with Disabilities sa San Juan.
              </p>
           </div>
        </div>

        <div className="relative z-10">
           <div className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 font-normal">
              <ShieldCheck size={32} className="text-primary-300" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Data Privacy Guaranteed</p>
                <p className="text-sm">Ang iyong impormasyon ay ligtas sa ilalim ng Data Privacy Act of 2012.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 xl:p-20">
        <div className="max-w-3xl mx-auto space-y-10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-[#1e419c] transition-colors font-semibold uppercase text-xs tracking-widest"
          >
            <ArrowLeft size={16} /> Bumalik sa Home
          </button>

          <header className="space-y-2">
            <h2 className="text-[32px] font-normal text-slate-900 tracking-tight">Pagpaparehistro</h2>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className={`h-1.5 w-8 rounded-full ${step >= s ? 'bg-[#1e419c]' : 'bg-slate-200'} transition-all duration-500`}></div>
                ))}
              </div>
              <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Step {step} of 5</span>
            </div>
          </header>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-3 text-xs font-semibold border border-red-100 animate-shake">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12 font-normal">
            {step === 1 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Control No.</label>
                    <input name="controlNo" value={formData.controlNo} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-500 font-medium uppercase outline-none cursor-not-allowed" readOnly placeholder="GGG-13-7405-00-000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Date Applied</label>
                    <input type="date" name="dateApplied" value={formData.dateApplied} onChange={handleInputChange} className={getFieldClass('dateApplied', false)} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Office / Unit</label>
                    <input name="officeUnit" value={formData.officeUnit} onChange={handleInputChange} className={getFieldClass('officeUnit', false)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">First Name <span className="text-red-500">*</span></label>
                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} className={getFieldClass('firstName', true)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Last Name <span className="text-red-500">*</span></label>
                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} className={getFieldClass('lastName', true)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Middle Name</label>
                    <input name="middleName" value={formData.middleName} onChange={handleInputChange} className={getFieldClass('middleName', false)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Suffix</label>
                    <input name="suffix" value={formData.suffix} onChange={handleInputChange} className={getFieldClass('suffix', false)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Birthdate <span className="text-red-500">*</span></label>
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className={getFieldClass('birthDate', true)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className={getFieldClass('gender', true)} required>
                      <option value="">Select</option>
                      <option value="Male">Lalaki (Male)</option>
                      <option value="Female">Babae (Female)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Civil Status</label>
                    <select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} className={getFieldClass('civilStatus', false)}>
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Disability Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Type of Disability <span className="text-red-500">*</span></label>
                    <input 
                      name="typeOfDisability" 
                      value={formData.typeOfDisability} 
                      onChange={handleInputChange} 
                      className={getFieldClass('typeOfDisability', true)} 
                      placeholder="Enter Type of Disability"
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Cause of Disability</label>
                    <input name="causeOfDisability" value={formData.causeOfDisability} onChange={handleInputChange} className={getFieldClass('causeOfDisability', false)} />
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button type="button" onClick={nextStep} className="px-12 py-4 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:opacity-90 active:scale-95 transition-all">
                    Next: Address & Contact <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Address Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Street Address</label>
                    <input name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} className={getFieldClass('streetAddress', false)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Barangay (San Juan) <span className="text-red-500">*</span></label>
                    <select name="barangay" value={formData.barangay} onChange={handleInputChange} className={getFieldClass('barangay', true)} required>
                      <option value="">Select Barangay</option>
                      {METRO_MANILA_LOCATIONS["San Juan City"].barangays["District 1"].map(b => <option key={b} value={b}>{b}</option>)}
                      {METRO_MANILA_LOCATIONS["San Juan City"].barangays["District 2"].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">City / Municipality</label>
                    <input name="cityMunicipality" value={formData.cityMunicipality} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-400 font-medium uppercase outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Province</label>
                    <input name="province" value={formData.province} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-400 font-medium uppercase outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Region</label>
                    <input name="region" value={formData.region} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-400 font-medium uppercase outline-none" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Landline</label>
                    <input name="landline" value={formData.landline} onChange={handleInputChange} className={getFieldClass('landline', false)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Mobile Number <span className="text-red-500">*</span></label>
                    <input name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={getFieldClass('mobileNumber', true)} placeholder="09XXXXXXXXX" required />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Email Address <span className="text-red-500">*</span></label>
                    <input name="emailAddress" type="email" value={formData.emailAddress} onChange={handleInputChange} className={getFieldClass('emailAddress', true)} required />
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-8 py-4 text-slate-400 font-semibold uppercase tracking-widest text-xs hover:text-[#1e419c]">Back</button>
                  <button type="button" onClick={nextStep} className="px-12 py-4 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition-all">
                    Next: Emergency & Family <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Emergency Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Emergency Contact Person <span className="text-red-500">*</span></label>
                    <input name="emergencyContactPerson" value={formData.emergencyContactPerson} onChange={handleInputChange} className={getFieldClass('emergencyContactPerson', true)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Contact Number <span className="text-red-500">*</span></label>
                    <input name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} className={getFieldClass('emergencyContactNumber', true)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Relationship</label>
                    <input name="relationship" value={formData.relationship} onChange={handleInputChange} className={getFieldClass('relationship', false)} />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Family Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Father's Name</label>
                    <input name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Mother's Name</label>
                    <input name="motherName" value={formData.motherName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Guardian's Name</label>
                    <input name="guardianName" value={formData.guardianName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none" />
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-8 py-4 text-slate-400 font-semibold uppercase tracking-widest text-xs hover:text-[#1e419c]">Back</button>
                  <button type="button" onClick={nextStep} className="px-12 py-4 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition-all">
                    Next: Education & Employment <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Education and Employment</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Highest Education</label>
                    <select name="highestEducation" value={formData.highestEducation} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none">
                      <option value="">Select</option>
                      <option value="None">None</option>
                      <option value="Elementary">Elementary</option>
                      <option value="High School">High School</option>
                      <option value="Vocational">Vocational</option>
                      <option value="College">College</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Employment Status</label>
                    <select name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none">
                      <option value="">Select</option>
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Student">Student</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Employment Type</label>
                    <input name="employmentType" value={formData.employmentType} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Employment Category</label>
                    <input name="employmentCategory" value={formData.employmentCategory} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Occupation</label>
                    <input name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Organization Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Organization Name</label>
                    <input name="orgName" value={formData.orgName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Org. Contact Person</label>
                    <input name="orgContactPerson" value={formData.orgContactPerson} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Organization Contact No.</label>
                    <input name="orgContactNo" value={formData.orgContactNo} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Organization Address</label>
                    <input name="orgAddress" value={formData.orgAddress} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium uppercase focus:border-[#1e419c] outline-none" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Account Security</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Username <span className="text-red-500">*</span></label>
                    <input name="username" value={formData.username} onChange={handleInputChange} className={getFieldClass('username', true)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Password <span className="text-red-500">*</span></label>
                    <input name="password" type="password" value={formData.password} onChange={handleInputChange} className={getFieldClass('password', true)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Confirm Password <span className="text-red-500">*</span></label>
                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} className={getFieldClass('confirmPassword', true)} required />
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-8 py-4 text-slate-400 font-semibold uppercase tracking-widest text-xs hover:text-[#1e419c]">Back</button>
                  <button type="button" onClick={nextStep} className="px-12 py-4 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition-all">
                    Next: IDs & Requirements <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Government IDs</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">SSS Number</label>
                    <input name="sssNumber" value={formData.sssNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">GSIS Number</label>
                    <input name="gsisNumber" value={formData.gsisNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Pag-IBIG Number</label>
                    <input name="pagIbigNumber" value={formData.pagIbigNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">PSN Number</label>
                    <input name="psnNumber" value={formData.psnNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">PhilHealth Number</label>
                    <input name="philHealthNumber" value={formData.philHealthNumber} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-900 font-medium focus:border-[#1e419c] outline-none" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#1e419c]">
                  <h3 className="text-xs font-bold text-[#1e419c] uppercase tracking-wider">Requirements</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 space-y-2">
                     <p className="text-sm font-semibold text-blue-900 uppercase tracking-tight">Dokumentasyon ng Kapansanan</p>
                     <p className="text-xs text-blue-700 leading-relaxed">
                       Pakia-attach ang iyong Medical Certificate (clinical abstract o diagnosis) at isang valid government ID.
                     </p>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center bg-white hover:bg-slate-50 transition-all relative group cursor-pointer">
                    <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="space-y-4 flex flex-col items-center">
                       <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload size={32} />
                       </div>
                       <div className="space-y-1">
                          <p className="font-semibold text-slate-800 uppercase tracking-widest text-xs">Pindutin para mag-upload</p>
                          <p className="text-[10px] text-slate-400 font-medium">PDF, JPG, PNG (Max 5MB bawat file)</p>
                       </div>
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2 pt-4">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-md shadow-sm text-xs text-slate-900 font-medium animate-fade-in">
                          <div className="flex items-center gap-3">
                            <FileCheck size={18} className="text-emerald-500" /> {f}
                          </div>
                          <button type="button" onClick={() => removeFile(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-8 py-4 text-slate-400 font-semibold uppercase tracking-widest text-xs hover:text-[#1e419c]">Back</button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-16 py-5 bg-[#1e419c] text-white rounded-md font-semibold uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading && <RefreshCw size={18} className="animate-spin" />}
                    {loading ? 'Sinisumite...' : 'Finalize Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
