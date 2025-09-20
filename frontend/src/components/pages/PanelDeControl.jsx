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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Bienvenido de vuelta, {userName}
          </h1>
          <p className="text-slate-600">
            Panel de gestión dental - Datos en tiempo real desde Google Sheets
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

      {/* Sync Status */}
      {syncStatus && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Datos sincronizados con Google Sheets
                </span>
              </div>
              <span className="text-xs text-blue-700">
                Última actualización: {formatLastUpdate(syncStatus.last_update)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Citas de Hoy</p>
                <p className="text-3xl font-bold text-slate-900">
                  {statsLoading ? '...' : (stats?.today_appointments || 0)}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  En tiempo real
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Citas</p>
                <p className="text-3xl font-bold text-slate-900">
                  {statsLoading ? '...' : (stats?.total_appointments || 0)}
                </p>
                <p className="text-xs text-slate-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Todas las programadas
                </p>
              </div>
              <div className="p-3 bg-slate-100 rounded-full">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Confirmadas</p>
                <p className="text-3xl font-bold text-slate-900">
                  {statsLoading ? '...' : (stats?.confirmed_appointments || 0)}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Citas confirmadas
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pendientes</p>
                <p className="text-3xl font-bold text-slate-900">
                  {statsLoading ? '...' : (stats?.pending_appointments || 0)}
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Por confirmar
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Citas de Hoy
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {todayLoading ? 'Cargando...' : `${todayAppointments.length} citas`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayLoading ? (
                <div className="text-center py-4">
                  <div className="animate-pulse">Cargando citas...</div>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No hay citas programadas para hoy</p>
                </div>
              ) : (
                todayAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {appointment.patient_name?.split(' ').map(n => n[0]).join('') || '??'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{appointment.patient_name || 'Sin nombre'}</p>
                        <p className="text-sm text-slate-600">{appointment.treatment || 'Sin tratamiento'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.time || 'Sin hora'}</p>
                      <Badge 
                        variant={appointment.status === 'completed' ? 'default' : 
                                appointment.status === 'confirmed' ? 'secondary' : 'destructive'}
                        className={`text-xs ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''
                        }`}
                      >
                        {appointment.status === 'completed' ? 'Completada' : 
                         appointment.status === 'confirmed' ? 'Confirmada' :
                         appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
              
              {todayAppointments.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    Ver todas las citas ({todayAppointments.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Activity */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Actividad del Sistema
              </span>
              <Badge className="bg-blue-100 text-blue-700">Google Sheets</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 py-3 border-b border-slate-200 last:border-0">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Sincronización Automática</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Los datos se actualizan automáticamente cada 5 minutos desde Google Sheets
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Sistema activo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 py-3 border-b border-slate-200 last:border-0">
                <div className="p-2 bg-green-100 rounded-full">
                  <Database className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Base de Datos Actualizada</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Última sincronización: {formatLastUpdate(syncStatus?.last_update)}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Estado: Conectado</p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Datos en Tiempo Real</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Portal sincronizado con {stats?.total_appointments || 0} citas totales
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Actualización continua</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={handleSync}
              disabled={syncing}
              className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center disabled:opacity-50"
            >
              <Database className={`h-6 w-6 mx-auto mb-2 text-slate-400 ${syncing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">
                {syncing ? 'Sincronizando...' : 'Sincronizar Datos'}
              </span>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-colors text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <span className="text-sm font-medium">Ver Pacientes</span>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <span className="text-sm font-medium">Ver Calendario</span>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-colors text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <span className="text-sm font-medium">Ver Reportes</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PanelDeControl;