import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Home } from '../pages/home';
import { Profile } from '../pages/profile';
import { Properties } from '../pages/properties';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121214]">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/properties" element={<Properties />} />
      </Routes>
    </div>
  );
};