import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Activity,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { mockData } from "../../data/mockData";

const Dashboard = () => {
  const userName = localStorage.getItem("userName") || "Dr. Rubio García";
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Bienvenido de vuelta, {userName}
        </h1>
        <p className="text-slate-600">
          Aquí tienes un resumen de tu clínica dental hoy.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Citas de Hoy</p>
                <p className="text-3xl font-bold text-slate-900">{mockData.todayAppointments}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12% vs ayer
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
                <p className="text-sm font-medium text-slate-600">Pacientes Activos</p>
                <p className="text-3xl font-bold text-slate-900">{mockData.activePatients}</p>
                <p className="text-xs text-slate-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8 nuevos
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
                <p className="text-sm font-medium text-slate-600">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-slate-900">${mockData.monthlyRevenue}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +23% vs mes pasado
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
                <p className="text-sm font-medium text-slate-600">Citas Pendientes</p>
                <p className="text-3xl font-bold text-slate-900">{mockData.pendingAppointments}</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Próximas 24h
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
        {/* Recent Appointments */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Citas Recientes
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Hoy</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">
                        {appointment.patient.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{appointment.patient}</p>
                      <p className="text-sm text-slate-600">{appointment.treatment}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <Badge 
                      variant={appointment.status === 'completed' ? 'default' : 
                              appointment.status === 'pending' ? 'secondary' : 'destructive'}
                      className={`text-xs ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        appointment.status === 'pending' ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      {appointment.status === 'completed' ? 'Completada' : 
                       appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Activity */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Actividad del Sistema
              </span>
              <Badge className="bg-blue-100 text-blue-700">En vivo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.aiMessages.map((message) => (
                <div key={message.id} className="flex items-start gap-3 py-3 border-b border-slate-200 last:border-0">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{message.type}</p>
                    <p className="text-sm text-slate-600 mt-1">{message.description}</p>
                    <p className="text-xs text-slate-400 mt-2">{message.time}</p>
                  </div>
                </div>
              ))}
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
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <span className="text-sm font-medium">Nueva Cita</span>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-colors text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <span className="text-sm font-medium">Nuevo Paciente</span>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <span className="text-sm font-medium">Enviar Recordatorio</span>
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

export default Dashboard;