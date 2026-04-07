
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Database, Eye, X, MapPin, Calendar, User, RefreshCw, ShieldAlert, CloudOff, AlertCircle } from 'lucide-react';
import { RegistryRecord } from '../../types';

export const LcrPwdDashboard: React.FC = () => {
  const { registryRecords, fetchExternalRegistry, registryError } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'LCR' | 'PWD'>('LCR');
  const [selectedRecord, setSelectedRecord] = useState<RegistryRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = useCallback(async (type: 'LCR' | 'PWD') => {
    setIsSyncing(true);
    await fetchExternalRegistry(type);
    setIsSyncing(false);
  }, [fetchExternalRegistry]);

  useEffect(() => {
    handleSync(filterType);
  }, [filterType, handleSync]);

  const filteredRecords = registryRecords.filter(record => {
    const matchesSearch = 
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        record.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch && record.type === filterType;
  });

  const ViewRecordModal = ({ record, onClose }: { record: RegistryRecord, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
             <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
                 <div className="bg-slate-900 p-6 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${record.type === 'LCR' ? 'bg-primary-500 text-white' : 'bg-blue-500 text-white'}`}>
                             <Database size={24} />
                         </div>
                         <div>
                             <h2 className="text-xl font-semibold text-white leading-none">External Record Details</h2>
                             <p className="text-slate-400 text-sm mt-1 font-mono font-medium">Remote ID: {record.id}</p>
                         </div>
                     </div>
                     <button onClick={onClose} className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors">
                         <X size={20} />
                     </button>
                 </div>

                 <div className="p-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 flex items-center gap-2">
                                <User size={16} /> Identity Profile
                             </h3>
                             <div className="space-y-4">
                                <div><label className="text-xs font-semibold text-slate-500">Last Name</label><p className="font-semibold text-slate-800 text-lg uppercase">{record.lastName}</p></div>
                                <div><label className="text-xs font-semibold text-slate-500">First Name</label><p className="font-semibold text-slate-800 text-lg uppercase">{record.firstName}</p></div>
                                <div><label className="text-xs font-semibold text-slate-500">Middle Name</label><p className="font-medium text-slate-700 uppercase">{record.middleName || '---'}</p></div>
                                <div><label className="text-xs font-semibold text-slate-500">Extension or Suffix</label><p className="font-medium text-slate-700 uppercase">{record.suffix || 'None'}</p></div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                        <Calendar size={12} /> Birth Date
                                    </label>
                                    <p className="font-medium text-slate-800">{record.birthDate}</p>
                                </div>
                             </div>
                         </div>

                         <div className="space-y-4">
                             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 flex items-center gap-2">
                                <MapPin size={16} /> Registry Context
                             </h3>
                             <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Data Provider</p>
                                    <p className="text-sm font-semibold text-slate-700">pylontradingintl.com Node</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Record Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <p className="text-sm font-semibold text-emerald-600">Active Registry Entry</p>
                                    </div>
                                </div>
                                <div className="pt-4 mt-4 border-t border-slate-200">
                                   <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">This record is fetched in real-time from the external LCR/PWD database for identity validation purposes.</p>
                                </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
                     <button onClick={onClose} className="px-8 py-2 bg-slate-900 text-white rounded-xl font-medium uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors">
                         Close Record
                     </button>
                 </div>
             </div>
        </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {selectedRecord && <ViewRecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-normal text-slate-800">External registry node</h1>
          <p className="text-slate-500 font-medium">Live synchronization with <span className="font-mono text-primary-600 underline">lcrdev.pylontradingintl.com</span> records.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button 
                  onClick={() => setFilterType('LCR')}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold uppercase transition-all ${filterType === 'LCR' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                  LCR Records
              </button>
              <button 
                  onClick={() => setFilterType('PWD')}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold uppercase transition-all ${filterType === 'PWD' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                  PWD Records
              </button>
          </div>
          <button 
            onClick={() => handleSync(filterType)}
            disabled={isSyncing}
            className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
            Re-Poll External Node
          </button>
        </div>
      </header>

      {registryError && (
          <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[2.5rem] flex items-start gap-6 animate-fade-in-up shadow-sm">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-50 shrink-0">
                  <CloudOff size={32} />
              </div>
              <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-amber-900 uppercase tracking-tight leading-none">Connection Handshake Failure</h3>
                  <p className="text-amber-700 text-sm font-medium max-w-3xl leading-relaxed">
                      The portal failed to fetch data from <span className="underline font-mono">pylontradingintl.com</span>. 
                      <br />
                      <span className="font-semibold mt-2 block">TECHNICAL REASON:</span> 
                      <span className="font-medium italic text-amber-900">{registryError}</span>
                  </p>
                  <div className="flex items-center gap-2 text-amber-600 pt-2">
                    <AlertCircle size={14} />
                    <p className="text-[10px] font-medium uppercase tracking-widest">Verify API SSL and CORS configuration on the target server.</p>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
        <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
           <div className="relative max-w-md w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
             <input 
               type="text"
               placeholder="Search registry by name..."
               className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-sm uppercase tracking-tight"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              <Database size={12} className="text-primary-500" /> Remote Records: {filteredRecords.length}
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-medium uppercase tracking-[0.2em]">
                <th className="p-6">Last name</th>
                <th className="p-6">Firstname</th>
                <th className="p-6">Middlename</th>
                <th className="p-6">Extension or suffix</th>
                <th className="p-6">Birthdate</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6 font-semibold text-slate-900 uppercase tracking-tight text-sm leading-none">{record.lastName}</td>
                  <td className="p-6 font-semibold text-slate-900 uppercase tracking-tight text-sm leading-none">{record.firstName}</td>
                  <td className="p-6 text-xs font-medium text-slate-500 uppercase">{record.middleName || '---'}</td>
                  <td className="p-6 text-xs font-medium text-slate-500 uppercase">{record.suffix || 'None'}</td>
                  <td className="p-6">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-2">
                       <Calendar size={12} className="text-slate-300" /> {record.birthDate}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                        onClick={() => setSelectedRecord(record)}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                    >
                        Review Entry
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && !isSyncing && (
                <tr>
                   <td colSpan={6} className="p-32 text-center text-slate-300 font-medium uppercase tracking-[0.3em] text-xs">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Database size={40} className="opacity-10" />
                      </div>
                      {registryError ? (
                        <div className="space-y-2">
                           <p className="text-red-400">Registry Handshake Blocked</p>
                           <p className="text-[9px] font-medium max-w-xs mx-auto text-slate-400 leading-normal">Check the error panel above for instructions on how to enable cross-origin access.</p>
                        </div>
                      ) : `No matching ${filterType} records found on remote node`}
                   </td>
                </tr>
              )}
              {isSyncing && (
                <tr>
                   <td colSpan={6} className="p-32 text-center">
                      <RefreshCw size={40} className="animate-spin text-primary-500 mx-auto opacity-40" />
                      <p className="mt-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Polling External Registry Node...</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
