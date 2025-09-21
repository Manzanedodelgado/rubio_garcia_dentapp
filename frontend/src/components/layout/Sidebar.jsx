import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import UserAvatar from "../ui/user-avatar";
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  Bot,
  MessageSquare,
  CreditCard,
  Settings,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle, user }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Panel de Control",
      path: "/panel-de-control",
      icon: Home,
      description: "Vista general"
    },
    {
      name: "Agenda",
      path: "/panel-de-control/agenda", 
      icon: Calendar,
      description: "Agenda",
      submenu: [
        { name: "Calendario", path: "/panel-de-control/agenda" },
        { name: "Nueva Cita", path: "/panel-de-control/agenda/nueva" },
        { name: "Historial", path: "/panel-de-control/agenda/historial" }
      ]
    },
    {
      name: "Pacientes",
      path: "/panel-de-control/patients",
      icon: Users,
      description: "Base de datos de pacientes",
      submenu: [
        { name: "Lista de Pacientes", path: "/panel-de-control/patients" },
        { name: "Nuevo Paciente", path: "/panel-de-control/patients/new" },
        { name: "Historial Médico", path: "/panel-de-control/patients/history" }
      ]
    },
    {
      name: "Analíticas", 
      path: "/panel-de-control/analytics",
      icon: BarChart3,
      description: "Reportes y métricas"
    },
    {
      name: "IA Assistant",
      path: "/panel-de-control/ai-assistant",
      icon: Bot,
      description: "Asistente inteligente",
      badge: "NEW"
    },
    {
      name: "Mensajes",
      path: "/panel-de-control/messages",
      icon: MessageSquare,
      description: "WhatsApp & Comunicación",
      badge: "5"
    },
    {
      name: "Facturación",
      path: "/panel-de-control/billing",
      icon: CreditCard,
      description: "Pagos y finanzas"
    }
  ];

  const bottomMenuItems = [
    {
      name: "Configuración",
      path: "/panel-de-control/settings",
      icon: Settings,
      description: "Ajustes del sistema"
    },
    {
      name: "Perfil",
      path: "/panel-de-control/profile", 
      icon: User,
      description: "Mi perfil"
    }
  ];

  const NavItem = ({ item, isActive }) => (
    <NavLink
      to={item.path}
      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-100 text-blue-700 shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <item.icon className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'} ${
        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
      }`} />
      
      {isOpen && (
        <>
          <span className="flex-1">{item.name}</span>
          {item.badge && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.badge === 'NEW' 
                ? 'bg-blue-100 text-blue-600'
                : 'bg-red-100 text-red-600'
            }`}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-slate-200 transition-all duration-300 z-30 ${
        isOpen ? 'w-64' : 'w-16'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          {isOpen && (
            <div className="flex items-center space-x-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_ai-hub-clone-1/artifacts/fsmto9g8_51303A10-85A7-48B4-A61F-4690EC360EB1.png" 
                alt="Dental Icon" 
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  Portal Profesional
                </h1>
                <p className="text-xs text-slate-500">Sistema de Gestión</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 hover:bg-slate-100"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* User Profile */}
        {isOpen && (
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-3">
              <UserAvatar size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isOpen && (
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex justify-center">
            <UserAvatar size="sm" />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.name}>
              <NavItem 
                item={item} 
                isActive={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
              />
              
              {/* Submenu */}
              {item.submenu && isOpen && location.pathname.startsWith(item.path) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu.map((subItem) => (
                    <NavLink
                      key={subItem.name}
                      to={subItem.path}
                      className={`block px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded ${
                        location.pathname === subItem.path ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      {subItem.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-slate-200 p-4 space-y-1">
          {bottomMenuItems.map((item) => (
            <NavItem 
              key={item.name}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;