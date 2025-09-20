import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  History, 
  Search,
  Filter,
  Calendar,
  Download,
  ArrowLeft,
  Users,
  Clock
} from "lucide-react";
import { appointmentsAPI } from "../../services/apiService";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";

const HistorialCitas = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const fetchHistorialAppointments = async () => {
    setLoading(true);
    try {
      const filters = {};
      
      if (dateRange.startDate) {
        filters.start_date = dateRange.startDate;
      }
      if (dateRange.endDate) {
        filters.end_date = dateRange.endDate;
      }
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await appointmentsAPI.getAll(filters);
      setAppointments(response.data || []);
    } catch (error) {
      toast({
        title: "Error al cargar historial",
        description: "No se pudo cargar el historial de citas",
        variant: "destructive"
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorialAppointments();
  }, [statusFilter, dateRange]);

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

  const handleExportData = () => {
    toast({
      title: "Exportando datos",
      description: "La funcionalidad de exportación estará disponible pronto",
    });
  };

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    pending: appointments.filter(a => a.status === 'pending').length
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <History className="h-8 w-8" />
            Historial de Citas
          </h1>
          <p className="text-gray-600">Consulta el historial completo de todas las citas</p>
        </div>
        <Button onClick={handleExportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Citas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Canceladas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, tratamiento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completadas</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="cancelled">Canceladas</option>
                <option value="rescheduled">Reagendadas</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Historial Completo ({filteredAppointments.length} registros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Cargando historial...</div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || dateRange.startDate || dateRange.endDate
                  ? 'No se encontraron citas con los filtros aplicados'
                  : 'No hay citas en el historial'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments
                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Ordenar por fecha descendente
                .map((appointment) => (
                <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mb-1" />
                        <span className="text-sm font-medium">{appointment.date}</span>
                        <span className="text-xs text-gray-500">{appointment.time}</span>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
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
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-2 text-sm text-gray-500 italic">
                            <strong>Notas:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistorialCitas;