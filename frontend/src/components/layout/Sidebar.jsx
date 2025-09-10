import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
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
      name: "Dashboard",
      path: "/dashboard",
      icon: Home,
      description: "Vista general"
    },
    {
      name: "Citas",
      path: "/dashboard/appointments", 
      icon: Calendar,
      description: "Gestión de citas",
      submenu: [
        { name: "Calendario", path: "/dashboard/appointments" },
        { name: "Nueva Cita", path: "/dashboard/appointments/new" },
        { name: "Historial", path: "/dashboard/appointments/history" }
      ]
    },
    {
      name: "Pacientes",
      path: "/dashboard/patients",
      icon: Users,
      description: "Base de datos de pacientes",
      submenu: [
        { name: "Lista de Pacientes", path: "/dashboard/patients" },
        { name: "Nuevo Paciente", path: "/dashboard/patients/new" },
        { name: "Historial Médico", path: "/dashboard/patients/history" }
      ]
    },
    {
      name: "Analíticas", 
      path: "/dashboard/analytics",
      icon: BarChart3,
      description: "Reportes y métricas"
    },
    {
      name: "IA Assistant",
      path: "/dashboard/ai-assistant",
      icon: Bot,
      description: "Asistente inteligente",
      badge: "NEW"
    },
    {
      name: "Mensajes",
      path: "/dashboard/messages",
      icon: MessageSquare,
      description: "WhatsApp & Comunicación",
      badge: "5"
    },
    {
      name: "Facturación",
      path: "/dashboard/billing",
      icon: CreditCard,
      description: "Pagos y finanzas"
    }
  ];

  const bottomMenuItems = [
    {
      name: "Configuración",
      path: "/dashboard/settings",
      icon: Settings,
      description: "Ajustes del sistema"
    },
    {
      name: "Perfil",
      path: "/dashboard/profile", 
      icon: User,
      description: "Mi perfil"
    }
  ];

  const NavItem = ({ item, isActive }) => (
    <NavLink
      to={item.path}
      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-emerald-100 text-emerald-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <item.icon className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'} ${
        isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
      }`} />
      
      {isOpen && (
        <>
          <span className="flex-1">{item.name}</span>
          {item.badge && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.badge === 'NEW' 
                ? 'bg-emerald-100 text-emerald-600'
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
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r transition-all duration-300 z-30 ${
        isOpen ? 'w-64' : 'w-16'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {isOpen && (
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-light text-emerald-500">
                kokuai
                <span className="inline-flex ml-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                </span>
              </h1>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 hover:bg-gray-100"
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
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>DS</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.name}>
              <NavItem 
                item={item} 
                isActive={location.pathname === item.path}
              />
              
              {/* Submenu */}
              {item.submenu && isOpen && location.pathname.startsWith(item.path) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu.map((subItem) => (
                    <NavLink
                      key={subItem.name}
                      to={subItem.path}
                      className={`block px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded`}
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
        <div className="border-t p-4 space-y-1">
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