import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Activity,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle,
  Phone,
  Plus
} from "lucide-react";
import { useAppointmentStats, useTodayAppointments, useSync } from "../../hooks/useAppointments";
import { useNavigate } from "react-router-dom";

const PanelDeControl = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Dr. Rubio García";
  const { stats, loading: statsLoading, refresh: refreshStats } = useAppointmentStats();
  const { appointments: todayAppointments, loading: todayLoading, refresh: refreshToday } = useTodayAppointments();
  const { syncing, syncStatus, triggerSync } = useSync();

  // Mock WhatsApp conversations data
  const whatsappConversations = [
    {
      id: 1,
      patient: "María González",
      phone: "+52 555 1234",
      lastMessage: "Doctor, tengo mucho dolor desde ayer",
      priority: "rojo",
      time: "hace 10 min",
      unread: true
    },
    {
      id: 2,
      patient: "Carlos Mendez",
      phone: "+52 555 5678", 
      lastMessage: "Muchas gracias por la cita, nos vemos mañana",
      priority: "azul",
      time: "hace 25 min",
      unread: false
    },
    {
      id: 3,
      patient: "Ana López",
      phone: "+52 555 9012",
      lastMessage: "¿Puedo adelantar mi cita? Es urgente",
      priority: "rojo",
      time: "hace 1 hora",
      unread: true
    },
    {
      id: 4,
      patient: "Luis Rodriguez",
      phone: "+52 555 3456",
      lastMessage: "Perfecto, confirmo mi cita del viernes",
      priority: "azul", 
      time: "hace 2 horas",
      unread: false
    }
  ];

  const redConversations = whatsappConversations.filter(c => c.priority === 'rojo');
  const blueConversations = whatsappConversations.filter(c => c.priority === 'azul');

  const handleRefresh = async () => {
    refreshStats();
    refreshToday();
  };

  const handleSync = async () => {
    try {
      await triggerSync();
      // Refresh data after sync
      setTimeout(() => {
        refreshStats();
        refreshToday();
      }, 1000);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Format last update time
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Welcome Section - MODIFICADO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Bienvenido, {userName}
          </h1>
          <p className="text-slate-600 text-sm">
            Portal de gestión dental - Datos en tiempo real desde Google Sheets
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Database className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Sync Status - COMPACTO */}
      {syncStatus && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Google Sheets sincronizado
                </span>
              </div>
              <span className="text-xs text-blue-700">
                {formatLastUpdate(syncStatus.last_update)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview - COMPACTAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardContent className="p-4">
            <div className="text-center">
              <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-slate-900">
                {statsLoading ? '...' : (stats?.today_appointments || 0)}
              </p>
              <p className="text-xs text-slate-600">Agenda Hoy</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="h-6 w-6 text-slate-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-slate-900">
                {statsLoading ? '...' : (stats?.total_appointments || 0)}
              </p>
              <p className="text-xs text-slate-600">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-slate-900">
                {statsLoading ? '...' : (stats?.confirmed_appointments || 0)}
              </p>
              <p className="text-xs text-slate-600">Confirmadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-slate-900">
                {statsLoading ? '...' : (stats?.pending_appointments || 0)}
              </p>
              <p className="text-xs text-slate-600">Pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - REUBICADO Y COMPACTO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Appointments - MÁS COMPACTA */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agenda de Hoy
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                {todayLoading ? 'Cargando...' : `${todayAppointments.length} citas`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {todayLoading ? (
                <div className="text-center py-4">
                  <div className="animate-pulse text-sm">Cargando agenda...</div>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No hay citas programadas para hoy</p>
                </div>
              ) : (
                todayAppointments.slice(0, 4).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600">
                          {appointment.patient_name?.split(' ').map(n => n[0]).join('') || '??'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{appointment.patient_name || 'Sin nombre'}</p>
                        <p className="text-xs text-slate-600">{appointment.treatment || 'Sin tratamiento'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.time || 'Sin hora'}</p>
                      <Badge 
                        className={`text-xs ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {appointment.status === 'completed' ? 'OK' : 
                         appointment.status === 'confirmed' ? 'CONF' :
                         appointment.status === 'pending' ? 'PEND' : 'CANC'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
              
              {todayAppointments.length > 4 && (
                <div className="text-center pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/panel-de-control/agenda")}
                    className="text-xs"
                  >
                    Ver todas ({todayAppointments.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Conversations IA - COMPACTA */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversaciones WhatsApp IA
              </span>
              <div className="flex items-center gap-1">
                <Badge className="bg-red-100 text-red-700 text-xs">
                  {redConversations.length} Rojas
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  {blueConversations.length} Azules
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {/* Conversaciones ROJAS (Urgentes) PRIMERO */}
              {redConversations.map((conversation) => (
                <div key={`red-${conversation.id}`} className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <div className="p-1 bg-red-100 rounded-full">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-red-900">{conversation.patient}</p>
                      <span className="text-xs text-red-600">{conversation.time}</span>
                    </div>
                    <p className="text-xs text-red-700 truncate mb-1">{conversation.lastMessage}</p>
                    <div className="flex items-center gap-1">
                      <Phone className="h-2 w-2 text-red-500" />
                      <span className="text-xs text-red-600">{conversation.phone}</span>
                      {conversation.unread && (
                        <Badge variant="destructive" className="h-3 text-xs px-1 ml-1">!</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Conversaciones AZULES (Normales) */}
              {blueConversations.map((conversation) => (
                <div key={`blue-${conversation.id}`} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-blue-900">{conversation.patient}</p>
                      <span className="text-xs text-blue-600">{conversation.time}</span>
                    </div>
                    <p className="text-xs text-blue-700 truncate mb-1">{conversation.lastMessage}</p>
                    <div className="flex items-center gap-1">
                      <Phone className="h-2 w-2 text-blue-500" />
                      <span className="text-xs text-blue-600">{conversation.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-2 border-t border-slate-200">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate("/panel-de-control/messages")}
              >
                Ver todas las conversaciones
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Activity - MÁS COMPACTA */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Actividad del Sistema
            </span>
            <Badge className="bg-blue-100 text-blue-700 text-xs">Activo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Database className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">{stats?.total_appointments || 0}</div>
              <div className="text-xs text-blue-700">Citas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-600">98%</div>
              <div className="text-xs text-green-700">Sync OK</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-600">5 min</div>
              <div className="text-xs text-purple-700">Auto-Sync</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - FUNCIONALES */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={handleSync}
              disabled={syncing}
              className="p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center disabled:opacity-50"
            >
              <Database className={`h-5 w-5 mx-auto mb-1 text-slate-400 ${syncing ? 'animate-spin' : ''}`} />
              <span className="text-xs font-medium">
                {syncing ? 'Sincronizando...' : 'Sincronizar'}
              </span>
            </button>
            
            <button 
              onClick={() => navigate("/panel-de-control/patients")}
              className="p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-colors text-center"
            >
              <Users className="h-5 w-5 mx-auto mb-1 text-slate-400" />
              <span className="text-xs font-medium">Pacientes</span>
            </button>
            
            <button 
              onClick={() => navigate("/panel-de-control/agenda")}
              className="p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Calendar className="h-5 w-5 mx-auto mb-1 text-slate-400" />
              <span className="text-xs font-medium">Agenda</span>
            </button>
            
            <button 
              onClick={() => navigate("/panel-de-control/analytics")}
              className="p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-colors text-center"
            >
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-slate-400" />
              <span className="text-xs font-medium">Reportes</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PanelDeControl;