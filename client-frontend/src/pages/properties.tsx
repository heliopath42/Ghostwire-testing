import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Properties: React.FC = () => {
  const navigate = useNavigate();

  // Sample data simulating the properties page
  const propertiesData = [
    { label: 'GhostWire IP Address', value: '100.75.1.112', isMono: true },
    { label: 'GhostWire IPv6 Address', value: 'fdf3:f37e:f0fd:40a0:f2e9::1', isMono: true },
    { label: 'Public IP Address', value: '165.101.246.251', isMono: true },
    { label: 'Domain Name', value: 'john-doe.ghostwire.net', isMono: true },
    { label: 'Hostname', value: 'MacBook-Air', isMono: false },
    { label: 'Region', value: 'India', isMono: false },
    { label: 'Operating System', value: 'macOS Tahoe 26.5.2', isMono: false },
    { label: 'Serial Number', value: 'M4N0LP00X734148', isMono: true },
    { label: 'Registered on', value: '21 September, 2026 at 5:15 PM (15 days ago)', isMono: false },
    { label: 'Last seen', value: 'Just now', isMono: false },
    { label: 'Agent Version', value: '0.71.4', isMono: true },
    { label: 'UI Version', value: '0.71.4', isMono: true },
  ];

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
        
        {/* Device Profile Header */}
        <div className="flex flex-col gap-1 mb-10 px-2">
          <div className="flex items-center gap-3">
            {/* Active Status Indicator */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <h1 className="text-2xl font-semibold text-[#DDDDDD] tracking-tight">John Doe</h1>
          </div>
          <p className="text-gray-500 font-mono text-sm pl-5">john.doe@ghostwire.net</p>
        </div>

        {/* Properties List */}
        <section>
          <div className="flex flex-col border-t border-[#1E1E20]">
            {propertiesData.map((prop, index) => (
              <div 
                key={index}
                className="grid grid-cols-12 gap-4 items-center px-2 py-4 border-b border-[#1E1E20] hover:bg-[#161618] transition-colors"
              >
                {/* Label (Left Aligned) */}
                <div className="col-span-4 text-sm font-medium text-gray-400">
                  {prop.label}
                </div>
                
                {/* Value (Right Aligned) */}
                <div className={`col-span-8 text-right text-sm text-[#DDDDDD] pr-2 ${prop.isMono ? 'font-mono' : ''}`}>
                  {prop.value}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};