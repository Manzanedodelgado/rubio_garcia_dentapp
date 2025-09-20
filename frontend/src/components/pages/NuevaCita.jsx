import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { 
  CalendarIcon, 
  Clock, 
  User,
  Phone,
  FileText,
  Save,
  ArrowLeft
} from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";

const NuevaCita = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patient_name: '',
    phone: '',
    email: '',
    treatment: '',
    doctor: '',
    date: null,
    time: '',
    duration: '',
    notes: '',
    status: 'pending'
  });

  const [saving, setSaving] = useState(false);

  const treatments = [
    'Limpieza dental',
    'Endodoncia',
    'Blanqueamiento',
    'Implante dental',
    'Ortodoncia',
    'Extracción',
    'Corona dental',
    'Consulta general',
    'Revisión anual'
  ];

  const doctors = [
    'Dr. Rubio García',
    'Dr. Juan Antonio Manzanedo',
    'Dra. María González',
    'Dr. Carlos López'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient_name || !formData.date || !formData.time) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa al menos el nombre del paciente, fecha y hora",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      // Simular guardado (aquí conectarías con tu API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Cita creada exitosamente",
        description: `Cita para ${formData.patient_name} programada para el ${formData.date.toLocaleDateString('es-ES')} a las ${formData.time}`,
      });

      // Redirigir a la agenda después de guardar
      navigate("/panel-de-control/agenda");
      
    } catch (error) {
      toast({
        title: "Error al crear cita",
        description: "No se pudo guardar la cita. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/panel-de-control/agenda")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Agenda
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Cita</h1>
          <p className="text-gray-600">Programa una nueva cita en la agenda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Seleccionar Fecha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => handleInputChange('date', date)}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
                {formData.date && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Fecha seleccionada: {formData.date.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_name">Nombre del Paciente *</Label>
                    <Input
                      id="patient_name"
                      value={formData.patient_name}
                      onChange={(e) => handleInputChange('patient_name', e.target.value)}
                      placeholder="Nombre completo del paciente"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+52 555 1234"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="paciente@email.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Detalles de la Cita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="treatment">Tratamiento</Label>
                    <Select value={formData.treatment} onValueChange={(value) => handleInputChange('treatment', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tratamiento" />
                      </SelectTrigger>
                      <SelectContent>
                        {treatments.map((treatment) => (
                          <SelectItem key={treatment} value={treatment}>
                            {treatment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor</Label>
                    <Select value={formData.doctor} onValueChange={(value) => handleInputChange('doctor', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Asignar doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor} value={doctor}>
                            {doctor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora *</Label>
                    <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Duración estimada" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30 min">30 minutos</SelectItem>
                        <SelectItem value="45 min">45 minutos</SelectItem>
                        <SelectItem value="60 min">1 hora</SelectItem>
                        <SelectItem value="90 min">1.5 horas</SelectItem>
                        <SelectItem value="120 min">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Información adicional sobre la cita..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/panel-de-control/agenda")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cita
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NuevaCita;