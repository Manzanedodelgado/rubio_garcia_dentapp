import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all');

  const appointments = [
    {
      id: 1,
      patient: "María García",
      treatment: "Limpieza dental",
      time: "09:00 AM",
      duration: "30 min",
      status: "confirmed",
      phone: "+52 555 1234",
      notes: "Primera visita"
    },
    {
      id: 2,
      patient: "Carlos López",
      treatment: "Endodoncia",
      time: "10:30 AM", 
      duration: "90 min",
      status: "pending",
      phone: "+52 555 5678",
      notes: "Continuar tratamiento"
    },
    {
      id: 3,
      patient: "Ana Rodríguez",
      treatment: "Blanqueamiento", 
      time: "02:00 PM",
      duration: "45 min",
      status: "completed",
      phone: "+52 555 9012",
      notes: "Paciente regular"
    },
    {
      id: 4,
      patient: "Luis Martínez",
      treatment: "Consulta general",
      time: "03:30 PM",
      duration: "30 min", 
      status: "cancelled",
      phone: "+52 555 3456",
      notes: "Reagendar"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      completed: 'Completada', 
      cancelled: 'Cancelada'
    };
    return texts[status] || status;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-600">Administra las citas de tu clínica</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendario</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filtros:</span>
                  <div className="flex space-x-2">
                    {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
                      <Button
                        key={status}
                        variant={filter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(status)}
                        className="text-xs"
                      >
                        {status === 'all' ? 'Todas' : getStatusText(status)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar citas..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Citas del {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex flex-col items-center">
                          <Clock className="h-5 w-5 text-gray-400 mb-1" />
                          <span className="text-sm font-medium">{appointment.time}</span>
                          <span className="text-xs text-gray-500">{appointment.duration}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.patient}
                            </h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-1">{appointment.treatment}</p>
                          <p className="text-sm text-gray-500">{appointment.phone}</p>
                          
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              Notas: {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {appointment.status === 'pending' && (
                          <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredAppointments.length === 0 && (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay citas para mostrar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;