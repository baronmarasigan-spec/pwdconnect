
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  HeartHandshake, 
  IdCard, 
  Megaphone,
  Circle,
  ShieldCheck,
  Zap,
  Activity,
  Plus,
  ArrowUpRight,
  LogOut,
  Accessibility,
  Calendar as CalendarIcon,
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ApplicationType } from '../../types';

interface EventItem {
  id: string;
  title: string;
  date: string;
  image: string;
  createdAt?: any;
}

interface PosterItem {
  id: string;
  title: string;
  image: string;
  date?: string;
  createdAt?: any;
}

export const CitizenDashboard: React.FC = () => {
  const { currentUser, logout, applications, events, posters } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const combinedEvents = React.useMemo(() => {
    const posterEvents = posters
      .filter(p => p.date)
      .map(p => ({
        id: p.id,
        title: p.title,
        date: p.date!,
        image: p.image,
        createdAt: p.createdAt
      }));
    
    const all = [...events, ...posterEvents];
    return all.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    }).slice(0, 10);
  }, [events, posters]);

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

  const getMonthShort = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr.split(' ')[0].substring(0, 3);
      return date.toLocaleDateString('tl-PH', { month: 'short' }).substring(0, 3);
    } catch {
      return '---';
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

  const menuItems = [
    { 
      label: 'Profile', 
      image: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-265.png',
      path: '/citizen/profile',
      color: 'bg-blue-50 border-blue-100'
    },
    { 
      label: 'Benepisyo', 
      image: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-262.png',
      path: '/citizen/benefits', 
      color: 'bg-emerald-50 border-emerald-100'
    },
    { 
      label: 'Serbisyo sa ID', 
      image: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-263.png',
      path: '/citizen/id', 
      color: 'bg-indigo-50 border-indigo-100'
    },
    { 
      label: 'Mga Reklamo', 
      image: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-264.png',
      path: '/citizen/complaints', 
      color: 'bg-rose-50 border-rose-100'
    },
  ];

  const ads = [
    {
      title: 'Araw ng Lokal na Pamilihan',
      description: 'Suportahan ang ating mga lokal na tindero ngayong Sabado sa City Plaza.',
      image: 'https://picsum.photos/seed/market/600/400',
      link: '#'
    },
    {
      title: 'Seminar para sa Kalusugan at Kaayusan',
      description: 'Sumali sa aming libreng seminar tungkol sa kalusugan at nutrisyon ng mga senior.',
      image: 'https://picsum.photos/seed/health/600/400',
      link: '#'
    },
    {
      title: 'Tour sa Pamana ng San Juan',
      description: 'Galugarin ang mayamang kasaysayan ng ating lungsod sa pamamagitan ng guided tour.',
      image: 'https://picsum.photos/seed/heritage/600/400',
      link: '#'
    }
  ];

  const idApplication = applications.find(a => 
    a.userId === currentUser?.id && 
    (a.type === ApplicationType.ID_NEW || a.type === ApplicationType.ID_RENEWAL || a.type === ApplicationType.ID_REPLACEMENT)
  );

  const hasIssuedID = !!currentUser?.pwdIdNumber;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center min-h-[calc(100vh-160px)] relative overflow-hidden pt-4"
    >
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none -z-10"></div>

      {/* Unified Header Row */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-12 px-6 md:px-12 lg:px-16"
      >
        <div className="space-y-2 text-left">
          <h1 className="text-[#1e419c] text-3xl font-normal tracking-tight">
            Maligayang pagdating, {currentUser?.firstName || currentUser?.name?.split(' ')[0]}!
          </h1>
          <div className="flex items-center gap-2">
            <Accessibility size={24} className="text-red-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">PWD ID No.</span>
              <span className="text-sm font-bold text-slate-500 leading-tight">
                {hasIssuedID ? currentUser?.pwdIdNumber : (idApplication ? 'Processing Application...' : 'No ID Issued')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-start md:items-end">
            <span className="text-slate-600 font-normal text-sm leading-tight tracking-tight hidden md:block">{currentUser?.name}</span>
            <button 
              onClick={logout}
              className="text-[10px] font-normal text-red-600 uppercase tracking-[0.25em] hover:text-red-800 transition-colors mt-1 flex items-center gap-1 group/logout"
            >
              <LogOut size={10} className="group-hover/logout:-translate-x-0.5 transition-transform" />
              {t('sign_out')}
            </button>
          </div>
          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shadow-md border border-red-100 overflow-hidden shrink-0">
            {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                <img src="https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png" alt="Avatar" className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      </motion.div>

      {/* ID Status Alert for users without ID */}
      {!hasIssuedID && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full px-6 md:px-12 lg:px-16 mb-8"
        >
          <div className={`p-6 rounded-2xl border ${idApplication ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-amber-50 border-amber-100 text-amber-800'} flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${idApplication ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {idApplication ? <RefreshCw size={24} className="animate-spin" /> : <AlertCircle size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {idApplication ? 'Kasalukuyang pinoproseso ang iyong ID' : 'Wala ka pang opisyal na PWD ID'}
                </h3>
                <p className="text-sm opacity-80 mt-1">
                  {idApplication 
                    ? `Ang iyong aplikasyon noong ${idApplication.date} ay sinusuri na ng aming admin.` 
                    : 'Mag-apply na para makuha ang iyong ID at ma-access ang lahat ng benepisyo.'}
                </p>
              </div>
            </div>
            {!idApplication && (
              <button 
                onClick={() => navigate('/citizen/id')}
                className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
              >
                Mag-apply para sa ID
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Serbisyo Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full px-6 md:px-12 lg:px-16 mb-16"
      >
        <h2 className="text-[#1e419c] text-3xl font-semibold tracking-tight mb-8 text-left">Serbisyo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <motion.button 
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="group relative transition-all duration-300 w-full"
            >
              <img 
                src={item.image} 
                alt={item.label}
                className="w-full h-auto object-contain drop-shadow-xl group-hover:scale-[1.02] transition-transform"
                referrerPolicy="no-referrer"
              />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mga Kaganapan Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full px-6 md:px-12 lg:px-16 mb-16"
      >
            <div className="flex items-end justify-between mb-10 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[#1e419c] text-3xl font-semibold tracking-tight">Mga Kaganapan</h2>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-1">Mga larawan ng mga nakaraang kaganapan at opisyal na anunsyo ng LGU</p>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Event Gallery (4-Grid Layout) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {posters.length > 0 ? (
                posters.map((poster, index) => (
                  <motion.div 
                    key={poster.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-all group relative aspect-[4/3]"
                  >
                    <img 
                      src={poster.image} 
                      alt={poster.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <h3 className="text-white font-bold text-base leading-tight mb-1">{poster.title}</h3>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                  <ImageIcon size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">Walang Poster na Ipinapakita</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: LGU Calendar & Announcements (Smaller) */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-[#1e419c] rounded-3xl p-8 shadow-2xl h-full flex flex-col text-white relative overflow-hidden"
            >
              {/* Decorative Background Icon */}
              <CalendarIcon size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                    <CalendarIcon size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest">Petsa ng Anunsyo at Aktibidad</h3>
                    <p className="text-white/50 text-[10px]">Mga Opisyal na Anunsyo</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 relative z-10 flex-1">
                {combinedEvents.length > 0 ? (
                  combinedEvents.map((event, index) => (
                    <motion.div 
                      key={event.id} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (index * 0.1) }}
                      className="group cursor-pointer"
                    >
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 shrink-0 group-hover:bg-red-500 group-hover:border-red-400 transition-all duration-300">
                          <span className="text-[10px] font-black uppercase leading-none mb-0.5">{getMonthShort(event.date)}</span>
                          <span className="text-lg font-bold leading-none">{getDay(event.date)}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-sm leading-tight group-hover:text-red-400 transition-colors line-clamp-2">{event.title}</h4>
                          <p className="text-white/40 text-[10px] mt-1 font-medium">{formatDate(event.date)}</p>
                        </div>
                      </div>
                      {index < combinedEvents.length - 1 && <div className="h-px bg-white/5 w-full mt-6"></div>}
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/20">
                    <CalendarIcon size={48} className="mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Walang Kaganapan</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
