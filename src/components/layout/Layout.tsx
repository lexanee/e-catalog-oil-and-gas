import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SmartAssist from "../ai/SmartAssist";

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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 scroll-smooth relative">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.4] pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="relative z-10">{children}</div>
        </main>
        {/* Global AI Assistant */}
      </div>
    </div>
  );
};

export default Layout;
