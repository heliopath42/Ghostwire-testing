import React, { useState } from 'react';
import { ArrowLeft, Key, Monitor, Shield, Smartphone, User, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  // State for profile data
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@ghostwire.net');

  // State for editing modes
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);

  const handleSaveName = () => {
    if (tempName.trim()) setName(tempName);
    setIsEditingName(false);
  };

  const handleSaveEmail = () => {
    if (tempEmail.trim()) setEmail(tempEmail);
    setIsEditingEmail(false);
  };

  return (
    <div className="flex-1 bg-[#121214] text-gray-200 flex flex-col h-screen relative overflow-y-auto">
      <style>{`
        @keyframes customSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: customSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Simple Navigation Header */}
      <header className="flex items-center p-6 z-10 w-full h-[88px]">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors cursor-pointer text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </header>

      <main className="w-full max-w-3xl mx-auto px-6 pb-24 animate-slide-up">
        
        {/* Profile Header (Minimalist) */}
        <div className="flex items-center gap-6 mb-16 px-2">
          <div className="w-20 h-20 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
            <User size={32} className="text-[#F59E0B]" />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-semibold text-[#DDDDDD] tracking-tight">{name}</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">{email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          
          {/* ACCOUNT SECTION */}
          <section>
            <h2 className="text-[11px] font-mono tracking-widest text-gray-500 mb-4 px-2 uppercase">Account</h2>
            <div className="flex flex-col border-t border-[#1E1E20]">
              
              {/* Full Name Row */}
              <div className="grid grid-cols-12 gap-4 items-center px-2 py-5 border-b border-[#1E1E20] hover:bg-[#161618] transition-colors">
                <div className="col-span-3 text-sm font-medium text-gray-400">Full Name</div>
                <div className="col-span-6 text-sm text-[#DDDDDD]">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      className="w-full bg-[#1A1A1C] border border-[#2A2A2D] rounded px-3 py-1.5 focus:outline-none focus:border-[#4A4A4D]"
                      autoFocus
                    />
                  ) : (
                    name
                  )}
                </div>
                <div className="col-span-3 flex justify-end">
                  {isEditingName ? (
                    <div className="flex items-center gap-3 pr-4">
                      <button onClick={() => setIsEditingName(false)} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                        <X size={18} />
                      </button>
                      <button onClick={handleSaveName} className="text-[#F59E0B] hover:text-[#FFC107] transition-colors cursor-pointer">
                        <Check size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setTempName(name); setIsEditingName(true); }}
                      className="text-xs font-mono tracking-wider text-gray-500 hover:text-white transition-colors cursor-pointer pr-4"
                    >
                      EDIT
                    </button>
                  )}
                </div>
              </div>

              {/* Email Row */}
              <div className="grid grid-cols-12 gap-4 items-center px-2 py-5 border-b border-[#1E1E20] hover:bg-[#161618] transition-colors">
                <div className="col-span-3 text-sm font-medium text-gray-400">Email Address</div>
                <div className="col-span-6 text-sm text-[#DDDDDD]">
                  {isEditingEmail ? (
                    <input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEmail()}
                      className="w-full bg-[#1A1A1C] border border-[#2A2A2D] rounded px-3 py-1.5 focus:outline-none focus:border-[#4A4A4D]"
                      autoFocus
                    />
                  ) : (
                    email
                  )}
                </div>
                <div className="col-span-3 flex justify-end">
                  {isEditingEmail ? (
                    <div className="flex items-center gap-3 pr-4">
                      <button onClick={() => setIsEditingEmail(false)} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                        <X size={18} />
                      </button>
                      <button onClick={handleSaveEmail} className="text-[#F59E0B] hover:text-[#FFC107] transition-colors cursor-pointer">
                        <Check size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setTempEmail(email); setIsEditingEmail(true); }}
                      className="text-xs font-mono tracking-wider text-gray-500 hover:text-white transition-colors cursor-pointer pr-4"
                    >
                      EDIT
                    </button>
                  )}
                </div>
              </div>

              {/* Organization Row */}
              <div className="grid grid-cols-12 gap-4 items-center px-2 py-5 border-b border-[#1E1E20] hover:bg-[#161618] transition-colors">
                <div className="col-span-3 text-sm font-medium text-gray-400">Organization</div>
                <div className="col-span-6 flex items-center gap-3">
                  <span className="text-sm text-[#DDDDDD]">IIT Jodhpur</span>
                </div>
                <div className="col-span-3 flex justify-end">
                  {/* Empty right column for Organization */}
                </div>
              </div>

            </div>
          </section>

          {/* SECURITY SECTION */}
          <section>
            <h2 className="text-[11px] font-mono tracking-widest text-gray-500 mb-4 px-2 uppercase">Security</h2>
            <div className="flex flex-col border-t border-[#1E1E20]">
              
              <div className="grid grid-cols-12 gap-4 items-center px-2 py-5 border-b border-[#1E1E20] hover:bg-[#161618] transition-colors">
                <div className="col-span-4 flex items-center gap-3 text-sm font-medium text-gray-400">
                  <Key size={16} />
                  Password
                </div>
                <div className="col-span-5 text-sm text-gray-500">Last changed 45 days ago</div>
                <div className="col-span-3 flex justify-end">
                  <button className="px-4 py-1.5 border border-[#2A2A2D] text-gray-300 text-xs tracking-wider rounded hover:bg-[#1E1E20] hover:text-white transition-colors cursor-pointer w-[120px] text-center">
                    UPDATE
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 items-center px-2 py-5 border-b border-[#1E1E20] hover:bg-[#161618] transition-colors">
                <div className="col-span-4 flex items-center gap-3 text-sm font-medium text-gray-400">
                  <Shield size={16} />
                  Two-Factor Auth
                </div>
                <div className="col-span-5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                  <span className="text-sm text-[#DDDDDD]">Enabled via Authenticator App</span>
                </div>
                <div className="col-span-3 flex justify-end">
                  <button className="text-xs font-mono tracking-wider text-gray-500 hover:text-white transition-colors cursor-pointer pr-4">
                    SETTINGS
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* YOUR DEVICES SECTION */}
          <section>
            <h2 className="text-[11px] font-mono tracking-widest text-gray-500 mb-4 px-2 uppercase">Your Devices</h2>
            <div className="flex flex-col border-t border-[#1E1E20]">
              
              <div className="grid grid-cols-12 gap-4 items-center px-2 py-5 border-b border-[#1E1E20] hover:bg-[#161618] transition-colors">
                <div className="col-span-4 flex items-center gap-3 text-sm font-medium text-gray-400">
                  <Monitor size={16} />
                  Active Sessions
                </div>
                <div className="col-span-5 text-sm text-[#DDDDDD]">
                  3 devices currently authenticated
                </div>
                <div className="col-span-3 flex justify-end">
                  <button className="text-xs font-mono tracking-wider text-gray-500 hover:text-white transition-colors cursor-pointer pr-4">
                    REVIEW
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 items-center px-2 py-5 border-b border-[#1E1E20] hover:bg-[#161618] transition-colors">
                <div className="col-span-4 flex items-center gap-3 text-sm font-medium text-gray-400">
                  <Smartphone size={16} />
                  Mobile App
                </div>
                <div className="col-span-5 text-sm text-gray-500">
                  Not paired
                </div>
                <div className="col-span-3 flex justify-end">
                  <button className="px-4 py-1.5 border border-[#2A2A2D] text-gray-300 text-xs tracking-wider rounded hover:bg-[#1E1E20] hover:text-white transition-colors cursor-pointer w-[120px] text-center">
                    PAIR DEVICE
                  </button>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
};