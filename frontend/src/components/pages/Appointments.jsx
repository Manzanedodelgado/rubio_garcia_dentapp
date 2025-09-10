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
  CheckCircle,
  RefreshCw,
  Database
} from "lucide-react";
import { useAppointments, useSync } from "../../hooks/useAppointments";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get appointments with filters
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const { appointments, loading, error, refresh } = useAppointments({
    start_date: filter === 'today' ? selectedDateStr : undefined,
    end_date: filter === 'today' ? selectedDateStr : undefined,
    status: filter !== 'all' && filter !== 'today' ? filter : undefined
  });
  
  const { syncing, triggerSync } = useSync();

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      rescheduled: 'bg-purple-100 text-purple-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      completed: 'Completada', 
      cancelled: 'Cancelada',
      rescheduled: 'Reagendada'
    };
    return texts[status] || status;
  };

  // Filter appointments by search term
  const filteredAppointments = appointments.filter(apt => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      apt.patient_name?.toLowerCase().includes(searchLower) ||
      apt.treatment?.toLowerCase().includes(searchLower) ||
      apt.doctor?.toLowerCase().includes(searchLower)
    );
  });

  // Filter appointments by selected date if needed
  const displayAppointments = filter === 'today' 
    ? filteredAppointments.filter(apt => apt.date === selectedDateStr)
    : filteredAppointments;

  const handleSync = async () => {
    try {
      await triggerSync();
      setTimeout(() => {
        refresh();
      }, 1000);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-600">Administra las citas sincronizadas desde Google Sheets</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          <Button 
            onClick={refresh}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
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
          {/* Filters and Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filtros:</span>
                  <div className="flex space-x-2">
                    {[
                      { key: 'all', label: 'Todas' },
                      { key: 'today', label: 'Hoy' },
                      { key: 'confirmed', label: 'Confirmadas' },
                      { key: 'pending', label: 'Pendientes' },
                      { key: 'completed', label: 'Completadas' }
                    ].map((filterOption) => (
                      <Button
                        key={filterOption.key}
                        variant={filter === filterOption.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(filterOption.key)}
                        className="text-xs"
                      >
                        {filterOption.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar citas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </div>
                  <div className="text-xs text-gray-600">Confirmadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {appointments.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-xs text-gray-600">Pendientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {appointments.filter(a => a.status === 'completed').length}
                  </div>
                  <div className="text-xs text-gray-600">Completadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {filter === 'today' 
                  ? `Citas del ${selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}`
                  : `Lista de Citas (${displayAppointments.length})`
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Cargando citas...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-4">Error: {error}</div>
                  <Button onClick={refresh} variant="outline">
                    Reintentar
                  </Button>
                </div>
              ) : displayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No se encontraron citas que coincidan con la búsqueda' : 'No hay citas para mostrar'}
                  </p>
                  {searchTerm && (
                    <Button 
                      onClick={() => setSearchTerm('')} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayAppointments.map((appointment) => (
                    <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex flex-col items-center">
                            <Clock className="h-5 w-5 text-gray-400 mb-1" />
                            <span className="text-sm font-medium">{appointment.time || 'Sin hora'}</span>
                            <span className="text-xs text-gray-500">{appointment.date || 'Sin fecha'}</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {appointment.patient_name || 'Sin nombre'}
                              </h3>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusText(appointment.status)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>
                                <strong>Tratamiento:</strong> {appointment.treatment || 'No especificado'}
                              </div>
                              <div>
                                <strong>Doctor:</strong> {appointment.doctor || 'No asignado'}
                              </div>
                              {appointment.phone && (
                                <div>
                                  <strong>Teléfono:</strong> {appointment.phone}
                                </div>
                              )}
                              <div>
                                <strong>Fuente:</strong> Google Sheets
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className="mt-2 text-sm text-gray-500 italic">
                                <strong>Notas:</strong> {appointment.notes}
                              </div>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;