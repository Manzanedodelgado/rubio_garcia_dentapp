import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Download,
  Filter
} from "lucide-react";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');

  const stats = {
    revenue: {
      current: 28450,
      previous: 23200,
      change: 22.6
    },
    appointments: {
      current: 156,
      previous: 142,
      change: 9.9
    },
    patients: {
      current: 89,
      previous: 76, 
      change: 17.1
    },
    avgTreatment: {
      current: 182,
      previous: 163,
      change: 11.7
    }
  };

  const chartData = [
    { month: 'Ene', revenue: 18500, appointments: 120 },
    { month: 'Feb', revenue: 22300, appointments: 135 },
    { month: 'Mar', revenue: 19800, appointments: 128 },
    { month: 'Abr', revenue: 25600, appointments: 148 },
    { month: 'May', revenue: 28450, appointments: 156 },
    { month: 'Jun', revenue: 0, appointments: 0 } // Datos futuros
  ];

  const treatmentStats = [
    { name: 'Limpieza Dental', count: 45, revenue: 6750, percentage: 28.8 },
    { name: 'Endodoncia', count: 12, revenue: 9600, percentage: 33.7 },
    { name: 'Ortodoncia', count: 8, revenue: 4800, percentage: 16.9 },
    { name: 'Blanqueamiento', count: 15, revenue: 3750, percentage: 13.2 },
    { name: 'Implantes', count: 6, revenue: 3600, percentage: 12.6 }
  ];

  const StatCard = ({ title, value, previousValue, change, icon: Icon, prefix = "", suffix = "" }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {prefix}{value.toLocaleString()}{suffix}
            </p>
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${
            change >= 0 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Icon className={`h-6 w-6 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analíticas y Reportes</h1>
          <p className="text-gray-600">Insights de tu práctica dental</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Filter className="h-4 w-4 text-gray-500" />
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range === 'week' ? 'Semana' :
                 range === 'month' ? 'Mes' :
                 range === 'quarter' ? 'Trimestre' : 'Año'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales"
          value={stats.revenue.current}
          previousValue={stats.revenue.previous}
          change={stats.revenue.change}
          icon={DollarSign}
          prefix="$"
        />
        <StatCard
          title="Citas Completadas"
          value={stats.appointments.current}
          previousValue={stats.appointments.previous}
          change={stats.appointments.change}
          icon={Calendar}
        />
        <StatCard
          title="Nuevos Pacientes"
          value={stats.patients.current}
          previousValue={stats.patients.previous}
          change={stats.patients.change}
          icon={Users}
        />
        <StatCard
          title="Valor Promedio"
          value={stats.avgTreatment.current}
          previousValue={stats.avgTreatment.previous}
          change={stats.avgTreatment.change}
          icon={TrendingUp}
          prefix="$"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.slice(0, 5).map((data, index) => (
                <div key={data.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-colors"
                    style={{ 
                      height: `${(data.revenue / Math.max(...chartData.map(d => d.revenue))) * 200}px`,
                      minHeight: '20px'
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                  <div className="text-xs font-medium">${(data.revenue / 1000).toFixed(0)}k</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appointments Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Citas por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.slice(0, 5).map((data, index) => (
                <div key={data.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors"
                    style={{ 
                      height: `${(data.appointments / Math.max(...chartData.map(d => d.appointments))) * 200}px`,
                      minHeight: '20px'
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                  <div className="text-xs font-medium">{data.appointments}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance por Tratamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {treatmentStats.map((treatment, index) => (
              <div key={treatment.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                    <p className="text-sm text-gray-600">
                      {treatment.count} procedimientos • ${treatment.revenue.toLocaleString()} ingresos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{treatment.percentage}%</div>
                    <div className="text-xs text-gray-500">del total</div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${treatment.percentage * 2}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-emerald-500">
          <CardContent className="p-6">
            <h4 className="font-semibold text-emerald-700 mb-2">💡 Insight Principal</h4>
            <p className="text-sm text-gray-600">
              Los tratamientos de endodoncia generan el mayor ingreso por procedimiento ($800 promedio)
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-700 mb-2">📈 Tendencia</h4>
            <p className="text-sm text-gray-600">
              Las citas de limpieza dental han aumentado 35% este mes comparado con el anterior
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-orange-500">
          <CardContent className="p-6">
            <h4 className="font-semibold text-orange-700 mb-2">⚠️ Oportunidad</h4>
            <p className="text-sm text-gray-600">
              Los martes y jueves tienen menor ocupación. Considera promociones especiales
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;