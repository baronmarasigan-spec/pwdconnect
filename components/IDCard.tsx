
import React from 'react';
import { User } from '../types';
import { QRCodeSVG } from 'qrcode.react';

interface IDCardProps {
  user: User;
  side?: 'front' | 'back';
}

export const IDCard: React.FC<IDCardProps> = ({ user, side = 'front' }) => {
  const calculateAge = (bday: string) => {
    if (!bday) return 'N/A';
    const today = new Date();
    const birth = new Date(bday);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const pwdId = user.pwdIdNumber || (user.id?.startsWith('GGG-') ? user.id : 'GGG-13-7405-00-0000');

  if (side === 'back') {
    return (
      <div className="w-[500px] h-[310px] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col font-sans select-none border border-slate-300 p-6">
        {/* Emergency Contact Section */}
        <div className="space-y-4 mb-4">
          <div className="flex items-end gap-2">
            <span className="text-[10px] font-black text-slate-900 uppercase whitespace-nowrap">IN CASE OF EMERGENCY PLEASE NOTIFY</span>
            <div className="flex-1 border-b-2 border-slate-900 h-4 px-2 text-[10px] font-bold text-slate-800 uppercase">
              {user.emergencyContactPerson || 'N/A'}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[10px] font-black text-slate-900 uppercase whitespace-nowrap">CONTACT NO.</span>
            <div className="flex-1 border-b-2 border-slate-900 h-4 px-2 text-[10px] font-bold text-slate-800 uppercase">
              {user.emergencyContactNumber || 'N/A'}
            </div>
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="border-t-2 border-dashed border-slate-400 my-2"></div>

        {/* Benefits Section */}
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <h3 className="text-[11px] font-black text-slate-900 text-center mb-2 uppercase tracking-tight">
              Benefits and Privileges under Republic Act No. 10754
            </h3>
            <ul className="space-y-1 text-[8.5px] font-bold text-slate-800 leading-tight list-disc pl-4">
              <li>Free medical and dental, diagnostic & laboratory services in all government facilities</li>
              <li>20% discount in purchase of unbranded generic medicines</li>
              <li>20% discount in hotels, restaurants, recreation centers, etc.</li>
              <li>20% discount on theaters, cinema houses and concert halls, etc</li>
              <li>20% discount on medical and dental diagnostic & laboratory fees in private facilities</li>
              <li>20% discount in fare for domestic air, sea travel and public land transportation</li>
            </ul>
          </div>

          {/* QR Code Section */}
          <div className="w-28 h-28 shrink-0 flex flex-col items-center justify-center border-2 border-slate-900 rounded-lg p-2 bg-white">
            <QRCodeSVG 
              value={`https://pwdconnect.sanjuan.gov.ph/verify/${pwdId}`}
              size={80}
              level="H"
              includeMargin={false}
            />
            <span className="text-[7px] font-black mt-1 uppercase">QR Code</span>
          </div>
        </div>

        {/* Bottom Footer Stripes */}
        <div className="mt-auto flex flex-col -mx-6 -mb-6">
          <div className="h-2 bg-[#1e419c]"></div>
          <div className="bg-[#dc2626] py-2 flex items-center justify-center">
            <p className="text-white font-black text-[12px] uppercase tracking-[0.5em]">SAN JUAN CITY</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[500px] h-[310px] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col font-sans select-none border border-slate-300">
      
      {/* Top Header - White Section with Logos */}
      <div className="bg-white px-4 py-2 flex items-center justify-between">
        <img 
          src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" 
          alt="San Juan Seal" 
          className="h-12 w-12 object-contain"
        />
        <div className="text-center">
          <h4 className="text-[8px] font-bold text-slate-800 uppercase tracking-widest leading-tight">REPUBLIC OF THE PHILIPPINES</h4>
          <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight leading-none my-0.5">CITY OF SAN JUAN</h1>
          <h2 className="text-[8px] font-bold text-slate-700 uppercase tracking-tighter">PERSONS WITH DISABILITIES (PWD) OFFICE</h2>
        </div>
        <div className="flex gap-1 items-center">
          <img 
            src="https://www.phoenix.com.ph/wp-content/uploads/2026/04/sanjuanlogo.png" 
            alt="San Juan Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>

      {/* Name Section - Changed to RED as requested */}
      <div className="bg-[#dc2626] py-1.5 flex flex-col items-center">
        <span className="text-[7px] text-white/90 font-bold uppercase tracking-[0.4em] mb-0.5">FULL NAME</span>
        <h3 className="text-2xl font-black text-white uppercase tracking-wider leading-none drop-shadow-sm">
          {user.name}
        </h3>
      </div>

      {/* Main Details Section */}
      <div className="flex-1 px-4 pt-3 flex gap-4 relative">
        <div className="flex-1 flex flex-col">
          {/* Address Row */}
          <div className="text-center mb-3">
             <p className="text-[11px] font-bold text-slate-900 uppercase leading-tight">{user.address || 'SAN JUAN CITY, METRO MANILA'}</p>
             <div className="h-[1px] bg-slate-300 w-full mt-0.5"></div>
             <p className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-0.5">ADDRESS</p>
          </div>

          {/* Grid Details Row (Birthday, Age, Gender, Signature) */}
          <div className="grid grid-cols-4 gap-x-2 text-center items-end flex-1 max-h-12">
            <div>
              <p className="text-[10px] font-bold text-slate-900">{formatDate(user.birthDate || '1990-01-01')}</p>
              <div className="h-[1px] bg-slate-300 w-full my-0.5"></div>
              <p className="text-[7px] font-bold text-slate-500 uppercase">BIRTHDAY</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900">{calculateAge(user.birthDate || '1990-01-01')}</p>
              <div className="h-[1px] bg-slate-300 w-full my-0.5"></div>
              <p className="text-[7px] font-bold text-slate-500 uppercase">AGE</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900">{user.sex || 'MALE'}</p>
              <div className="h-[1px] bg-slate-300 w-full my-0.5"></div>
              <p className="text-[7px] font-bold text-slate-500 uppercase">GENDER</p>
            </div>
            <div>
              <div className="h-3"></div>
              <div className="h-[1px] bg-slate-300 w-full my-0.5"></div>
              <p className="text-[7px] font-bold text-slate-500 uppercase">SIGNATURE</p>
            </div>
          </div>

          {/* Mayor Signature Section (Bottom Left) */}
          <div className="mt-auto mb-4 text-left">
            <h5 className="text-[12px] font-black text-slate-900 leading-none">HON. FRANCIS ZAMORA</h5>
            <p className="text-[9px] text-slate-700 font-bold leading-tight">City Mayor</p>
          </div>
        </div>

        {/* Right Photo Column */}
        <div className="w-28 shrink-0 flex flex-col items-end">
           <p className="text-[8px] font-bold text-slate-900 mb-1 whitespace-nowrap">
             PWD ID No.: <span className="font-black">{pwdId}</span>
           </p>
           <div className="w-28 h-28 bg-slate-100 rounded-xl border-[1.5px] border-slate-900 overflow-hidden shadow-inner flex items-center justify-center">
             <img 
               src={user.avatarUrl || 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png'} 
               alt="ID Photo" 
               className="w-full h-full object-cover" 
               referrerPolicy="no-referrer"
             />
           </div>
        </div>
      </div>

      {/* Bottom Footer Stripes */}
      <div className="mt-auto flex flex-col">
        <div className="h-2 bg-[#1e419c]"></div>
        <div className="bg-[#dc2626] py-2 flex items-center justify-center">
          <p className="text-white font-black text-[12px] uppercase tracking-[0.5em]">PERSONS WITH DISABILITY ID CARD</p>
        </div>
      </div>
    </div>
  );
};
