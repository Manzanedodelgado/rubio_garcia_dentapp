import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  CreditCard, 
  DollarSign,
  FileText,
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  Send
} from "lucide-react";

const Billing = () => {
  const [filter, setFilter] = useState('all');

  const invoices = [
    {
      id: "INV-001",
      patient: "María García",
      treatment: "Limpieza dental",
      amount: 150,
      date: "2024-01-15",
      dueDate: "2024-02-15",
      status: "paid",
      method: "WhatsApp"
    },
    {
      id: "INV-002", 
      patient: "Carlos López",
      treatment: "Endodoncia",
      amount: 800,
      date: "2024-01-12",
      dueDate: "2024-02-12",
      status: "pending",
      method: "Efectivo"
    },
    {
      id: "INV-003",
      patient: "Ana Rodríguez", 
      treatment: "Blanqueamiento",
      amount: 250,
      date: "2024-01-10",
      dueDate: "2024-02-10",
      status: "overdue",
      method: "Tarjeta"
    },
    {
      id: "INV-004",
      patient: "Luis Martínez",
      treatment: "Implante dental", 
      amount: 1200,
      date: "2024-01-08",
      dueDate: "2024-02-08", 
      status: "paid",
      method: "WhatsApp"
    }
  ];

  const paymentMethods = [
    { name: "WhatsApp Pay", count: 45, percentage: 60, color: "green" },
    { name: "Tarjeta de Crédito", count: 20, percentage: 27, color: "blue" },
    { name: "Efectivo", count: 10, percentage: 13, color: "gray" }
  ];

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700', 
      overdue: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      paid: 'Pagado',
      pending: 'Pendiente',
      overdue: 'Vencido'
    };
    return texts[status] || status;
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true;
    return invoice.status === filter;
  });

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturación y Pagos</h1>
          <p className="text-gray-600">Gestiona los pagos e invoices de tu clínica</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+15% este mes</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-yellow-600">{invoices.filter(i => i.status === 'pending').length} facturas</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Vencidos</p>
                <p className="text-2xl font-bold text-gray-900">${overdueAmount.toLocaleString()}</p>
                <p className="text-xs text-red-600">{invoices.filter(i => i.status === 'overdue').length} facturas</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Cobro</p>
                <p className="text-2xl font-bold text-gray-900">92%</p>
                <p className="text-xs text-blue-600">Muy bueno</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pago Más Utilizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full bg-${method.color}-500`} />
                  <span className="font-medium">{method.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{method.count} transacciones</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${method.color}-500 h-2 rounded-full`}
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filtros:</span>
              <div className="flex space-x-2">
                {['all', 'paid', 'pending', 'overdue'].map((status) => (
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
                placeholder="Buscar facturas..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facturas Recientes ({filteredInvoices.length})
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Factura</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Paciente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tratamiento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Monto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Método</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{invoice.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{invoice.patient}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">{invoice.treatment}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">${invoice.amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">
                        {new Date(invoice.date).toLocaleDateString('es-ES')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">{invoice.method}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        {invoice.status === 'pending' && (
                          <Button size="sm" variant="outline" className="text-emerald-600">
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;