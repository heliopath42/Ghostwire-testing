import React, { useState, useEffect, useRef } from 'react';
import { Bell, HelpCircle, Power, Search } from 'lucide-react';

// Centralized device data for both the table and search suggestions
const DEVICE_LIST = [
  { id: 1, name: 'DB-Cluster-Primary', ip: '10.0.4.15', tag: 'db.internal.corp', status: 'online' },
  { id: 2, name: 'App-Server-01', ip: '10.0.2.100', tag: 'app01.prod.corp', status: 'online' },
  { id: 3, name: 'Legacy-Backup-Node', ip: '192.168.1.55', tag: 'Unreachable', status: 'offline' },
  { id: 4, name: 'K8s-Control-Plane', ip: '10.0.1.10', tag: 'k8s-cp.internal', status: 'online' }
];

export const Home: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Filter devices based on name or IP matching the search query
  const filteredDevices = DEVICE_LIST.filter(device => 
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    device.ip.includes(searchQuery)
  );

  return (
    <div className="flex-1 bg-[#121214] text-gray-200 flex flex-col h-screen relative overflow-hidden">
      <style>{`
        @keyframes customFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes customSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes customSlideDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: customFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up {
          animation: customSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-down {
          animation: customSlideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Dynamic Header */}
      <header className="flex justify-between items-center p-6 z-10 w-full h-[88px]">
        {isConnected ? (
          <div className="flex-1 max-w-3xl animate-slide-down relative">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3 text-gray-500" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search devices, IPs, or tags..." 
                className="w-full bg-[#1A1A1C] border border-[#2A2A2D] text-[#DDDDDD] text-sm rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#4A4A4D] transition-colors placeholder-gray-600"
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1C] border border-[#2A2A2D] rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-fade-in">
                {filteredDevices.length > 0 ? (
                  filteredDevices.map(device => (
                    <div key={device.id} className="px-4 py-2.5 border-b border-[#2A2A2D] last:border-0 hover:bg-[#222225] transition-colors cursor-pointer flex justify-between items-center">
                      <span className="text-[#DDDDDD] text-sm font-medium">{device.name}</span>
                      <span className="text-gray-500 font-mono text-xs">{device.ip}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-[#8E8E93] text-sm text-center">
                    No such devices found
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-4 ml-6">
          {isConnected && (
            <button 
              onClick={() => setIsConnected(false)}
              className="animate-fade-in flex items-center gap-2 px-4 py-2 border border-red-900/50 text-red-500 bg-[#2D1517]/40 hover:bg-[#2D1517]/80 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              <Power size={16} />
              DISCONNECT
            </button>
          )}

          <div className="flex items-center gap-2 border-l border-[#2A2A2D] pl-4 ml-2">
            {/* Notification Button & Popover */}
            <div ref={notificationRef} className="relative flex items-center">
              <button 
                type="button" 
                title="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-[#DDDDDD] hover:text-white hover:bg-[#1C1917] transition-all duration-200 cursor-pointer"
              >
                <Bell size={20} />
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 bg-[#1A1A1C] border border-[#2A2A2D] rounded-md px-3 py-2 text-xs text-[#8E8E93] whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 animate-fade-in">
                  No new notifications
                </div>
              )}
            </div>

            <button 
              type="button" 
              title="Help"
              aria-label="Help"
              className="p-2 rounded-lg text-[#DDDDDD] hover:text-white hover:bg-[#1C1917] transition-all duration-200 cursor-pointer"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto w-full relative">
        
        {/* DISCONNECTED STATE */}
        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center -mt-24 animate-fade-in select-none">
            <div className="mb-8 px-3 py-1 rounded bg-[#2D1517]/80 border border-red-900/50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-mono tracking-widest text-red-300 uppercase font-semibold">
                DISCONNECTED
              </span>
            </div>

            <button
              onClick={() => setIsConnected(true)}
              className="group relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none bg-[#1C1917] border-2 border-[#F59E0B]/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] hover:shadow-[0_0_65px_rgba(245,158,11,0.55)] hover:border-[#FFB800] cursor-pointer"
            >
              <div className="w-36 h-36 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#F59E0B]/20 group-hover:border-[#F59E0B]/70 group-hover:scale-105">
                <Power
                  size={48}
                  className="text-[#F59E0B] group-hover:text-[#FFC107] group-hover:scale-110 transition-all duration-300"
                />
              </div>
            </button>
          </div>
        )}

        {/* CONNECTED STATE (Dashboard) */}
        {isConnected && (
          <div className="w-full max-w-5xl px-6 pt-6 pb-12 animate-slide-up">
            
            <div className="bg-[#1C1405] border border-[#F59E0B]/20 rounded-md p-5 flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <div>
                  <h3 className="text-[#DDDDDD] font-semibold text-sm">Secure Connection Active</h3>
                  <p className="text-gray-500 text-xs mt-1 font-mono">Gateway: gw-useast-01.ghostwire.net</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="px-2.5 py-1 text-[11px] font-mono tracking-wider text-gray-400 border border-[#2A2A2D] rounded bg-[#141416]">WIREGUARD</span>
                <span className="px-2.5 py-1 text-[11px] font-mono tracking-wider text-gray-400 border border-[#2A2A2D] rounded bg-[#141416]">TLS 1.3</span>
              </div>
            </div>

            {/* Device List Table */}
            <div className="w-full">
              <div className="grid grid-cols-12 gap-4 text-[11px] font-mono tracking-widest text-gray-500 mb-4 px-4 uppercase">
                <div className="col-span-4">Device Name</div>
                <div className="col-span-5">Addresses</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              <div className="flex flex-col border-t border-[#1E1E20]">
                {DEVICE_LIST.map((device) => {
                  const isOffline = device.status === 'offline';
                  
                  return (
                    <div 
                      key={device.id} 
                      className={`grid grid-cols-12 gap-4 items-center px-4 py-5 border-b border-[#1E1E20] ${
                        isOffline ? 'opacity-60 bg-[#121214]' : 'hover:bg-[#161618] transition-colors'
                      }`}
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-gray-600' : 'bg-[#F59E0B]'}`} />
                        <span className={`text-sm font-medium ${isOffline ? 'text-gray-500 line-through decoration-gray-700' : 'text-[#DDDDDD]'}`}>
                          {device.name}
                        </span>
                      </div>
                      <div className="col-span-5 flex flex-col">
                        <span className={`text-sm font-mono ${isOffline ? 'text-gray-600' : 'text-gray-400'}`}>
                          {device.ip}
                        </span>
                        <span className={`text-xs font-mono mt-0.5 ${isOffline ? 'text-[#F59E0B]/50' : 'text-[#F59E0B]'}`}>
                          {device.tag}
                        </span>
                      </div>
                      <div className="col-span-3 flex justify-end">
                        <button 
                          className={`px-4 py-1.5 border text-xs tracking-wider rounded ${
                            isOffline 
                              ? 'border-[#1E1E20] text-gray-600 cursor-not-allowed' 
                              : 'border-[#2A2A2D] text-gray-300 hover:bg-[#1E1E20] hover:text-white transition-colors cursor-pointer'
                          }`}
                        >
                          {isOffline ? 'OFFLINE' : 'CONNECT'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};