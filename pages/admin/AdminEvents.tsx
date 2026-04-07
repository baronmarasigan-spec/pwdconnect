import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Calendar as CalendarIcon,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EventItem, PosterItem } from '../../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('tl-PH', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const getDay = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr.match(/\d+/)?.[0] || '0';
    return date.getDate().toString();
  } catch {
    return '0';
  }
};

export const AdminEvents: React.FC = () => {
  const { events, posters, addEvent, updateEvent, deleteEvent, addPoster, updatePoster, deletePoster } = useApp();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'events' | 'posters' } | null>(null);

  // Form states
  const [eventForm, setEventForm] = useState({ title: '', date: '', image: '' });
  const [posterForm, setPosterForm] = useState({ title: '', date: '', image: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'event' | 'poster' | null>(null);

  const posterFileRef = useRef<HTMLInputElement>(null);
  const eventFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'event' | 'poster') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        if (type === 'event') {
          setEventForm(prev => ({ ...prev, image: base64 }));
        } else {
          setPosterForm(prev => ({ ...prev, image: base64 }));
        }
      } catch (error) {
        console.error("Error converting file:", error);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent, type: 'event' | 'poster') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        if (type === 'event') {
          setEventForm(prev => ({ ...prev, image: base64 }));
        } else {
          setPosterForm(prev => ({ ...prev, image: base64 }));
        }
      } catch (error) {
        console.error("Error converting file:", error);
      }
    }
  };

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.image) {
      showStatus("Mangyaring mag-upload ng larawan.", 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId && editType === 'event') {
        await updateEvent(editingId, eventForm);
        showStatus("Matagumpay na na-update ang kaganapan!", 'success');
      } else {
        await addEvent(eventForm);
        showStatus("Matagumpay na naidagdag ang kaganapan!", 'success');
      }
      setEventForm({ title: '', date: '', image: '' });
      setEditingId(null);
      setEditType(null);
    } catch (error) {
      console.error("Error saving event:", error);
      showStatus("May error sa pag-save. Pakisubukang muli.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePosterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterForm.image) {
      showStatus("Mangyaring mag-upload ng larawan.", 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId && editType === 'poster') {
        await updatePoster(editingId, posterForm);
        showStatus("Matagumpay na na-update ang poster!", 'success');
      } else {
        await addPoster(posterForm);
        showStatus("Matagumpay na naidagdag ang poster!", 'success');
      }
      setPosterForm({ title: '', date: '', image: '' });
      setEditingId(null);
      setEditType(null);
    } catch (error) {
      console.error("Error saving poster:", error);
      showStatus("May error sa pag-save. Pakisubukang muli.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: 'events' | 'posters') => {
    setDeleteConfirm({ id, type });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'events') {
        await deleteEvent(deleteConfirm.id);
      } else {
        await deletePoster(deleteConfirm.id);
      }
      showStatus("Matagumpay na nabura!", 'success');
    } catch (error) {
      console.error("Error deleting:", error);
      showStatus("May error sa pagbura.", 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const startEdit = (item: any, type: 'event' | 'poster') => {
    setEditingId(item.id);
    setEditType(type);
    if (type === 'event') {
      setEventForm({ title: item.title, date: item.date, image: item.image });
    } else {
      setPosterForm({ title: item.title, date: item.date || '', image: item.image });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#1e419c]" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 relative">
      <AnimatePresence>
        {statusMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              statusMessage.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'
            }`}
          >
            <span className="font-bold text-sm">{statusMessage.text}</span>
          </motion.div>
        )}

        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sigurado ka ba?</h3>
              <p className="text-slate-500 mb-8">Ang aksyong ito ay hindi na mababawi. Sigurado ka bang gusto mong burahin ang item na ito?</p>
              <div className="flex gap-4">
                <button 
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Oo, Burahin
                </button>
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Kanselahin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] font-normal text-slate-800 leading-tight">Mga Kaganapan</h1>
        <p className="text-slate-500 font-medium text-lg">I-update ang mga poster at petsa ng anunsyo para sa mga mamamayan.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        
        {/* Poster Management (4-Grid Gallery) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <ImageIcon className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Mga Poster (Gallery)</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-300 bg-white rounded-2xl border border-slate-100">
              <Loader2 className="animate-spin mx-auto mb-4" size={40} />
              <p className="text-xs font-medium uppercase tracking-widest">Naglo-load ng mga poster...</p>
            </div>
          ) : (
            <>
              <form onSubmit={handlePosterSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pamagat ng Poster</label>
                  <input 
                    type="text" 
                    value={posterForm.title}
                    onChange={(e) => setPosterForm({ ...posterForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1e419c] focus:border-transparent outline-none transition-all"
                    placeholder="Hal. Pista ng Pamanang Kultura"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Petsa (Opsyonal)</label>
                  <input 
                    type="date" 
                    value={posterForm.date}
                    onChange={(e) => setPosterForm({ ...posterForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1e419c] focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 italic">Kung may petsa, ito ay lalabas din sa listahan ng mga kaganapan.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Image</label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, 'poster')}
                    onClick={() => posterFileRef.current?.click()}
                    className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#1e419c] hover:bg-blue-50 transition-all overflow-hidden relative group"
                  >
                    {posterForm.image ? (
                      <>
                        <img src={posterForm.image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white font-bold text-sm">Palitan ang Larawan</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="text-slate-300" size={48} />
                        <p className="text-slate-400 text-sm font-medium">I-drag at i-drop ang larawan dito o i-click para pumili</p>
                        <p className="text-slate-300 text-xs">PNG, JPG hanggang 5MB</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={posterFileRef}
                      onChange={(e) => handleFileChange(e, 'poster')}
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 bg-[#1e419c] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId && editType === 'poster' ? <Save size={18} /> : <Plus size={18} />)}
                    {editingId && editType === 'poster' ? 'I-update Poster' : 'Idagdag ang Poster'}
                  </button>
                  {editingId && editType === 'poster' && (
                    <button 
                      type="button"
                      onClick={() => { setEditingId(null); setEditType(null); setPosterForm({ title: '', date: '', image: '' }); }}
                      className="px-6 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      Kanselahin
                    </button>
                  )}
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posters.length === 0 && (
                  <div className="col-span-full p-12 text-center text-slate-300 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-medium uppercase tracking-widest">Walang mga poster na nahanap.</p>
                  </div>
                )}
                <AnimatePresence>
                  {posters.map((poster) => (
                    <motion.div 
                      key={poster.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group relative"
                    >
                      <div className="aspect-video rounded-xl overflow-hidden mb-3">
                        <img src={poster.image} alt={poster.title} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm truncate">{poster.title}</h3>
                      {poster.date && <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{formatDate(poster.date)}</p>}
                      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(poster, 'poster')} className="p-2 bg-white rounded-lg shadow-md text-blue-600 hover:bg-blue-50">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(poster.id, 'posters')} className="p-2 bg-white rounded-lg shadow-md text-red-600 hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </section>

        {/* Event Management (LGU Calendar) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <CalendarIcon className="text-[#1e419c]" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Petsa ng Anunsyo at Aktibidad</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-300 bg-white rounded-2xl border border-slate-100">
              <Loader2 className="animate-spin mx-auto mb-4" size={40} />
              <p className="text-xs font-medium uppercase tracking-widest">Naglo-load ng mga kaganapan...</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleEventSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pamagat ng Kaganapan</label>
                  <input 
                    type="text" 
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1e419c] focus:border-transparent outline-none transition-all"
                    placeholder="Hal. Health Checkup para sa mga Senior"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Petsa</label>
                    <input 
                      type="date" 
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1e419c] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Image</label>
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, 'event')}
                      onClick={() => eventFileRef.current?.click()}
                      className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#1e419c] hover:bg-blue-50 transition-all overflow-hidden relative group"
                    >
                      {eventForm.image ? (
                        <>
                          <img src={eventForm.image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-bold text-sm">Palitan ang Larawan</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="text-slate-300" size={48} />
                          <p className="text-slate-400 text-sm font-medium">I-drag at i-drop ang larawan dito o i-click para pumili</p>
                          <p className="text-slate-300 text-xs">PNG, JPG hanggang 5MB</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        ref={eventFileRef}
                        onChange={(e) => handleFileChange(e, 'event')}
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 bg-[#1e419c] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId && editType === 'event' ? <Save size={18} /> : <Plus size={18} />)}
                    {editingId && editType === 'event' ? 'I-update Kaganapan' : 'Idagdag ang Kaganapan'}
                  </button>
                  {editingId && editType === 'event' && (
                    <button 
                      type="button"
                      onClick={() => { setEditingId(null); setEditType(null); setEventForm({ title: '', date: '', image: '' }); }}
                      className="px-6 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      Kanselahin
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-3">
                {events.length === 0 && (
                  <div className="p-12 text-center text-slate-300 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-medium uppercase tracking-widest">Walang mga kaganapan na nahanap.</p>
                  </div>
                )}
                <AnimatePresence>
                  {events.map((event) => (
                    <motion.div 
                      key={event.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1e419c] font-bold">
                          {getDay(event.date)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{event.title}</h3>
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{formatDate(event.date)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(event, 'event')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(event.id, 'events')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </section>

      </div>
    </div>
  );
};

