
import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SmartAssist from '../ai/SmartAssist';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   
   return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
         <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
         <div className="flex-1 flex flex-col overflow-hidden relative">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 scroll-smooth">
               {children}
            </main>
            {/* Global AI Assistant */}
            <SmartAssist />
         </div>
      </div>
   );
};

export default Layout;
