import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Breadcrumb from "./Breadcrumb";

const PanelLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName") || "Dr. Rubio García";
    const userRole = localStorage.getItem("userRole") || "Director Clínico";
    const avatarColor = localStorage.getItem("avatarColor") || "emerald";
    
    if (!isLoggedIn) {
      navigate("/");
    } else {
      setUser({ 
        email: userEmail,
        name: userName,
        role: userRole,
        avatarColor: avatarColor
      });
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        {/* Header */}
        <Header 
          user={user}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PanelLayout;