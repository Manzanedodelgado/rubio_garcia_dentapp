import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { 
  Settings as SettingsIcon,
  Bell,
  Lock,
  Users,
  Calendar,
  CreditCard,
  MessageSquare,
  Shield,
  Database,
  Smartphone
} from "lucide-react";
import { toast } from "../../hooks/use-toast";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    appointments: true,
    payments: true,
    marketing: false
  });

  const [clinicSettings, setClinicSettings] = useState({
    autoReminders: true,
    paymentProcessing: true,
    onlineBooking: false,
    aiAssistant: true
  });

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Configuración actualizada",
      description: "Los ajustes de notificaciones se han guardado",
    });
  };

  const handleClinicSettingChange = (key, value) => {
    setClinicSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Configuración actualizada", 
      description: "Los ajustes de la clínica se han guardado",
    });
  };

  const SettingItem = ({ icon: Icon, title, description, children }) => (
    <div className="flex items-start justify-between p-4 border-b last:border-0">
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-gray-500 mt-1" />
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Configuración
          </h1>
          <p className="text-gray-600">Administra las configuraciones de tu clínica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configuración de Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <SettingItem
              icon={Bell}
              title="Notificaciones por Email"
              description="Recibe actualizaciones por correo electrónico"
            >
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </SettingItem>

            <SettingItem
              icon={Smartphone}
              title="Notificaciones SMS"
              description="Recibe alertas importantes por mensaje de texto"
            >
              <Switch
                checked={notifications.sms}
                onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
              />
            </SettingItem>

            <SettingItem
              icon={MessageSquare}
              title="Notificaciones WhatsApp"
              description="Alertas y actualizaciones via WhatsApp Business"
            >
              <Switch
                checked={notifications.whatsapp}
                onCheckedChange={(checked) => handleNotificationChange('whatsapp', checked)}
              />
            </SettingItem>

            <SettingItem
              icon={Calendar}
              title="Recordatorios de Citas"
              description="Notificaciones sobre próximas citas"
            >
              <Switch
                checked={notifications.appointments}
                onCheckedChange={(checked) => handleNotificationChange('appointments', checked)}
              />
            </SettingItem>

            <SettingItem
              icon={CreditCard}
              title="Alertas de Pagos"
              description="Notificaciones sobre pagos y facturas"
            >
              <Switch
                checked={notifications.payments}
                onCheckedChange={(checked) => handleNotificationChange('payments', checked)}
              />
            </SettingItem>
          </CardContent>
        </Card>

        {/* Clinic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Configuración de la Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <SettingItem
              icon={Bell}
              title="Recordatorios Automáticos"
              description="Envío automático de recordatorios de citas"
            >
              <div className="flex items-center space-x-2">
                <Switch
                  checked={clinicSettings.autoReminders}
                  onCheckedChange={(checked) => handleClinicSettingChange('autoReminders', checked)}
                />
                {clinicSettings.autoReminders && <Badge className="bg-green-100 text-green-700">Activo</Badge>}
              </div>
            </SettingItem>

            <SettingItem
              icon={CreditCard}
              title="Procesamiento de Pagos"
              description="Gestión automática de pagos via WhatsApp"
            >
              <div className="flex items-center space-x-2">
                <Switch
                  checked={clinicSettings.paymentProcessing}
                  onCheckedChange={(checked) => handleClinicSettingChange('paymentProcessing', checked)}
                />
                {clinicSettings.paymentProcessing && <Badge className="bg-blue-100 text-blue-700">Activo</Badge>}
              </div>
            </SettingItem>

            <SettingItem
              icon={Calendar}
              title="Reservas Online"
              description="Permite a pacientes reservar citas online"
            >
              <div className="flex items-center space-x-2">
                <Switch
                  checked={clinicSettings.onlineBooking}
                  onCheckedChange={(checked) => handleClinicSettingChange('onlineBooking', checked)}
                />
                {!clinicSettings.onlineBooking && <Badge variant="secondary">Inactivo</Badge>}
              </div>
            </SettingItem>

            <SettingItem
              icon={MessageSquare}
              title="Asistente IA"
              description="Automatización inteligente de tareas"
            >
              <div className="flex items-center space-x-2">
                <Switch
                  checked={clinicSettings.aiAssistant}
                  onCheckedChange={(checked) => handleClinicSettingChange('aiAssistant', checked)}
                />
                {clinicSettings.aiAssistant && <Badge className="bg-emerald-100 text-emerald-700">Activo</Badge>}
              </div>
            </SettingItem>
          </CardContent>
        </Card>
      </div>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad y Privacidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <Lock className="h-8 w-8 text-gray-600 mb-3" />
              <h4 className="font-medium mb-2">Cambiar Contraseña</h4>
              <p className="text-sm text-gray-600 mb-3">
                Actualiza tu contraseña regularmente
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Cambiar Contraseña
              </Button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <Shield className="h-8 w-8 text-gray-600 mb-3" />
              <h4 className="font-medium mb-2">Verificación en 2 Pasos</h4>
              <p className="text-sm text-gray-600 mb-3">
                Añade una capa extra de seguridad
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Configurar
              </Button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <Database className="h-8 w-8 text-gray-600 mb-3" />
              <h4 className="font-medium mb-2">Respaldo de Datos</h4>
              <p className="text-sm text-gray-600 mb-3">
                Última copia: hace 2 días
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Hacer Respaldo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Integraciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">WhatsApp Business</h4>
                  <p className="text-sm text-gray-600">Conectado y funcionando</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-700">Conectado</Badge>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Google Calendar</h4>
                  <p className="text-sm text-gray-600">Sincronización de citas</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Desconectado</Badge>
                <Button variant="outline" size="sm">Conectar</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Stripe Payments</h4>
                  <p className="text-sm text-gray-600">Procesamiento de tarjetas</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Desconectado</Badge>
                <Button variant="outline" size="sm">Conectar</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;