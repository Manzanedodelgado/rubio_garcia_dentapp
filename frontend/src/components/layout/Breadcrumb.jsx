import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const breadcrumbNameMap = {
    'panel-de-control': 'Panel de Control',
    appointments: 'Citas',
    patients: 'Pacientes', 
    analytics: 'Analíticas',
    'ai-assistant': 'IA Assistant',
    messages: 'Mensajes',
    billing: 'Facturación',
    settings: 'Configuración',
    profile: 'Perfil',
    new: 'Nuevo',
    history: 'Historial'
  };

  if (pathnames.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 px-6 py-3 bg-white border-b">
      <Link 
        to="/panel-de-control" 
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbNameMap[name] || name;
        
        return (
          <React.Fragment key={name}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">{displayName}</span>
            ) : (
              <Link 
                to={routeTo}
                className="hover:text-blue-600 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;