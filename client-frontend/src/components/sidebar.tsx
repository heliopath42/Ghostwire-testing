import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Network, Sliders, BarChart2, User, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#0A0A0B] text-[#DDDDDD] border-r border-[#1E1E20] flex flex-col justify-between h-screen p-4 shrink-0 selection:bg-neutral-800">
      {/* Top Section */}
      <div>
        {/* Logo & Subtitle */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-[#F59E0B] flex items-center justify-center shrink-0">
            {/* Logo connect ring with #F59E0B stroke */}
            <div className="w-4 h-4 rounded-full bg-[#F59E0B]/80 border border-[#F59E0B]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none tracking-wide">GhostWire</h1>
            <p className="text-[#8E8E93] text-xs mt-1 font-mono">ZTNA. But FOSS.</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
              location.pathname === '/' 
                ? 'rounded-r-md bg-[#141415] text-[#F7C56E] border-l-2 border-[#FF9800] text-sm font-medium' 
                : 'rounded-md text-[#DDDDDD] hover:bg-[#141416] hover:text-white text-sm font-medium'
            }`}
          >
            <Network size={20} className={location.pathname === '/' ? 'text-[#F7C56E]' : 'text-[#DDDDDD]'} />
            <span>Networks</span>
          </Link>

          <Link
            to="/properties"
            className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
              location.pathname === '/properties' 
                ? 'rounded-r-md bg-[#141415] text-[#F7C56E] border-l-2 border-[#FF9800] text-sm font-medium' 
                : 'rounded-md text-[#DDDDDD] hover:bg-[#141416] hover:text-white text-sm font-medium'
            }`}
          >
            <Sliders size={20} className={location.pathname === '/properties' ? 'text-[#F7C56E]' : 'text-[#DDDDDD]'} />
            <span>Properties</span>
          </Link>

          <Link
            to="/traffic"
            className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
              location.pathname === '/traffic' 
                ? 'rounded-r-md bg-[#141415] text-[#F7C56E] border-l-2 border-[#FF9800] text-sm font-medium' 
                : 'rounded-md text-[#DDDDDD] hover:bg-[#141416] hover:text-white text-sm font-medium'
            }`}
          >
            <BarChart2 size={20} className={location.pathname === '/traffic' ? 'text-[#F7C56E]' : 'text-[#DDDDDD]'} />
            <span>Traffic</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-1 pt-4 border-t border-[#1E1E20]">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
            location.pathname === '/profile' 
              ? 'rounded-r-md bg-[#141415] text-[#F7C56E] border-l-2 border-[#FF9800] text-sm font-medium' 
              : 'rounded-md text-[#DDDDDD] hover:bg-[#141416] hover:text-white text-sm font-medium'
          }`}
        >
          <User size={20} className={location.pathname === '/profile' ? 'text-[#F7C56E]' : 'text-[#DDDDDD]'} />
          <span>Profile</span>
        </Link>
        
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
            location.pathname === '/settings' 
              ? 'rounded-r-md bg-[#141415] text-[#F7C56E] border-l-2 border-[#FF9800] text-sm font-medium' 
              : 'rounded-md text-[#DDDDDD] hover:bg-[#141416] hover:text-white text-sm font-medium'
          }`}
        >
          <Settings size={20} className={location.pathname === '/settings' ? 'text-[#F7C56E]' : 'text-[#DDDDDD]'} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};