import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Bot, 
  MessageSquare, 
  Settings,
  Play,
  Pause,
  Calendar,
  Users,
  CreditCard,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";

const AIAssistant = () => {
  const [isActive, setIsActive] = useState(true);

  const automationTasks = [
    {
      id: 1,
      name: "Recordatorios de Citas",
      description: "Envía recordatorios automáticos 24h antes de cada cita via WhatsApp",
      status: "active",
      lastRun: "hace 2 horas",
      completedToday: 8,
      icon: Calendar,
      color: "emerald"
    },
    {
      id: 2,
      name: "Procesamiento de Pagos",
      description: "Gestiona y procesa pagos automáticamente via WhatsApp",
      status: "active", 
      lastRun: "hace 45 min",
      completedToday: 3,
      icon: CreditCard,
      color: "blue"
    },
    {
      id: 3,
      name: "Seguimiento Post-Tratamiento",
      description: "Realiza seguimiento de pacientes después de procedimientos",
      status: "active",
      lastRun: "hace 3 horas",
      completedToday: 5,
      icon: Users,
      color: "purple"
    },
    {
      id: 4,
      name: "Recolección de Consentimientos",
      description: "Distribuye y recolecta formularios de consentimiento digitales",
      status: "paused",
      lastRun: "hace 1 día",
      completedToday: 0,
      icon: CheckCircle,
      color: "orange"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "Recordatorio Enviado",
      description: "Recordatorio enviado a María García para cita del 15 Ene",
      time: "hace 15 min",
      status: "success"
    },
    {
      id: 2,
      type: "Pago Procesado", 
      description: "Pago de $350 procesado para Carlos López",
      time: "hace 32 min",
      status: "success"
    },
    {
      id: 3,
      type: "Seguimiento Completado",
      description: "Seguimiento post-limpieza realizado a Ana Rodríguez",
      time: "hace 1 hora",
      status: "success"
    },
    {
      id: 4,
      type: "Consentimiento Recibido",
      description: "Formulario de consentimiento recibido de Luis Martínez",
      time: "hace 2 horas", 
      status: "success"
    }
  ];

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-yellow-100 text-yellow-700';
  };

  const getStatusText = (status) => {
    return status === 'active' ? 'Activo' : 'Pausado';
  };

  const toggleTaskStatus = (taskId) => {
    // Mock function to toggle task status
    console.log(`Toggling task ${taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="h-8 w-8 text-emerald-600" />
            Asistente IA Kokuai
            <Badge className="bg-emerald-100 text-emerald-700">NUEVO</Badge>
          </h1>
          <p className="text-gray-600">Automatización inteligente para tu clínica dental</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isActive ? "Pausar Todo" : "Activar Todo"}
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">16</div>
            <div className="text-sm text-gray-600">Tareas Completadas Hoy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">4</div>
            <div className="text-sm text-gray-600">Automatizaciones Activas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">98%</div>
            <div className="text-sm text-gray-600">Tasa de Éxito</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">2.3h</div>
            <div className="text-sm text-gray-600">Tiempo Ahorrado</div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Tareas de Automatización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationTasks.map((task) => {
              const IconComponent = task.icon;
              return (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-full bg-${task.color}-100`}>
                        <IconComponent className={`h-6 w-6 text-${task.color}-600`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {task.name}
                          </h3>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{task.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Última ejecución: {task.lastRun}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>{task.completedToday} completadas hoy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        {task.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Activar
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Horarios de Operación</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Define cuándo debe estar activo el asistente IA
                </p>
                <Button size="sm" variant="outline">Configurar Horarios</Button>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Plantillas de Mensajes</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Personaliza los mensajes automáticos de WhatsApp
                </p>
                <Button size="sm" variant="outline">Editar Plantillas</Button>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Integraciones</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Conecta con tu calendario y sistema de pagos
                </p>
                <Button size="sm" variant="outline">Ver Integraciones</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;