import React, { useState, useEffect } from "react";
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
  CheckCircle,
  RefreshCw,
  Database,
  Users,
  AlertCircle,
  XCircle
} from "lucide-react";
import { appointmentsAPI } from "../../services/apiService";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Agenda = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
  const fetchAppointments = async (filters = {}) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentsAPI.getAll(filters);
      setAppointments(response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching appointments';
      setError(errorMessage);
      setAppointments([]);
      toast({ title: "Error al cargar agenda", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await appointmentsAPI.sync();
      const result = response.data;
      if (result.success) {
        toast({ title: "Sincronización exitosa", description: `${result.synced} citas sincronizadas desde Google Sheets` });
        setTimeout(() => { fetchAppointments(getCurrentFilters()); }, 1000);
      } else {
        toast({ title: "Error en sincronización", description: result.message, variant: "destructive" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error syncing data';
      toast({ title: "Error en sincronización", description: errorMessage, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const toLocalYMD = (d) => {
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const y = dd.getFullYear();
    const m = String(dd.getMonth() + 1).padStart(2, '0');
    const day = String(dd.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getCurrentFilters = () => {
    const selectedDateStr = toLocalYMD(selectedDate);
    const filters = {};
    if (filter === 'today') {
      filters.start_date = selectedDateStr;
      filters.end_date = selectedDateStr;
    }
    if (filter !== 'all' && filter !== 'today') {
      filters.status = filter;
    }
    return filters;
  };

  const handleRefresh = () => { fetchAppointments(getCurrentFilters()); };

  useEffect(() => { fetchAppointments(getCurrentFilters()); }, [filter, selectedDate]);

  const getStatusColor = (status) => {
    const base = 'bg-blue-800 text-white border border-blue-900';
    const map = { confirmed: base, pending: base, completed: base, cancelled: base, rescheduled: base };
    return map[status] || base;
  };
  const getStatusText = (status) => ({ confirmed: 'Confirmada', pending: 'Pendiente', completed: 'Completada', cancelled: 'Cancelada', rescheduled: 'Reagendada' }[status] || status);

  const filteredAppointments = appointments.filter(apt => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      apt.patient_name?.toLowerCase().includes(s) ||
      apt.treatment?.toLowerCase().includes(s) ||
      apt.doctor?.toLowerCase().includes(s) ||
      (apt.num_paciente || '').toLowerCase().includes(s)
    );
  });

  const normalizeTime = (t) => (t || '').padStart(5, '0');
  const displayAppointments = (filter === 'today' 
    ? filteredAppointments.filter(apt => apt.date === toLocalYMD(selectedDate))
    : filteredAppointments)
    .sort((a,b) => {
      const da = a.date || ''; const db = b.date || '';
      if (da === db) return normalizeTime(a.time).localeCompare(normalizeTime(b.time));
      return da.localeCompare(db);
    });

  const updateStatus = async (appointment, newStatus, estadoCitaText) => {
    try {
      await appointmentsAPI.updateStatus(appointment._id, { status: newStatus, estado_cita: estadoCitaText });
      // Update in-place to reflect immediately
      setAppointments(prev => prev.map(a => a._id === appointment._id ? { ...a, status: newStatus, estado_cita: estadoCitaText } : a));
      toast({ title: `Cita ${estadoCitaText}`, description: `${appointment.patient_name} - ${appointment.time}` });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'No se pudo actualizar el estado';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleConfirm = (appointment) => { updateStatus(appointment, 'confirmed', 'Confirmada'); };
  const handleCancel = (appointment) => { updateStatus(appointment, 'cancelled', 'Cancelada'); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Administra las citas sincronizadas desde Google Sheets</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate("/panel-de-control/agenda/nueva")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
          <Button onClick={handleSync} disabled={syncing} variant="outline" className="flex items-center gap-2">
            <Database className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          <Button onClick={handleRefresh} disabled={loading} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendario</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  const d = date || new Date();
                  setSelectedDate(d);
                  setFilter('today');
                  const ymd = toLocalYMD(d);
                  setTimeout(() => fetchAppointments({ start_date: ymd, end_date: ymd }), 0);
                }}
                className="rounded-md border"
                disabled={(date) => date < new Date("1900-01-01")}
              />
              <div className="mt-4 space-y-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/panel-de-control/agenda/historial")}>
                  Ver Historial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filtros:</span>
                  <div className="flex space-x-2">
                    {[{ key: 'all', label: 'Todas' },{ key: 'today', label: 'Hoy' },{ key: 'confirmed', label: 'Confirmadas' },{ key: 'pending', label: 'Pendientes' },{ key: 'completed', label: 'Completadas' }].map((opt) => (
                      <Button key={opt.key} variant={filter === opt.key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(opt.key)} className="text-xs">{opt.label}</Button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Buscar en agenda..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center"><div className="text-2xl font-bold text-blue-600">{appointments.length}</div><div className="text-xs text-gray-600">Total</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === 'confirmed').length}</div><div className="text-xs text-gray-600">Confirmadas</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-yellow-600">{appointments.filter(a => a.status === 'pending').length}</div><div className="text-xs text-gray-600">Pendientes</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === 'completed').length}</div><div className="text-xs text-gray-600">Completadas</div></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {filter === 'today' ? `Agenda del ${selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : `Lista de Citas (${displayAppointments.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8"><RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" /><p className="text-gray-500">Cargando agenda...</p></div>
              ) : error ? (
                <div className="text-center py-8"><AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" /><div className="text-red-600 mb-4">Error: {error}</div><Button onClick={handleRefresh} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Reintentar</Button></div>
              ) : displayAppointments.length === 0 ? (
                <div className="text-center py-8"><CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">{searchTerm ? 'No se encontraron citas que coincidan con la búsqueda' : 'No hay citas para mostrar'}</p>{searchTerm && (<Button onClick={() => setSearchTerm('')} variant="outline" size="sm" className="mt-2">Limpiar búsqueda</Button>)}</div>
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
                            <span className={`mt-2 text-xs px-2 py-0.5 rounded-full ${getStatusColor(appointment.status)}`}>{(appointment.estado_cita || getStatusText(appointment.status))}</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.patient_name || 'Sin nombre'}</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div><strong>Tratamiento:</strong> {appointment.treatment || 'No especificado'}</div>
                              {appointment.num_paciente && (<div><strong>Número de Paciente:</strong> {appointment.num_paciente}</div>)}
                              <div><strong>Doctor:</strong> {appointment.doctor || 'No asignado'}</div>
                              {appointment.phone && (<div><strong>Teléfono:</strong> {appointment.phone}</div>)}
                            </div>
                            {appointment.notes && (<div className="mt-2 text-sm text-gray-500 italic"><strong>Notas:</strong> {appointment.notes}</div>)}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-stretch space-y-2 ml-4">
                          {appointment.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleConfirm(appointment)}>
                                <CheckCircle className="h-4 w-4 mr-1" />Confirmar
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleCancel(appointment)}>
                                <XCircle className="h-4 w-4 mr-1" />Cancelar
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
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

export default Agenda;