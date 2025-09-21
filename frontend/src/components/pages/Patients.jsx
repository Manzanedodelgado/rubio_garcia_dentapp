import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { 
  Users, 
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Save,
  X
} from "lucide-react";
import { patientsAPI } from "../../services/apiService";
import { toast } from "../../hooks/use-toast";

const emptyForm = { first_name:"", last_name:"", full_name:"", phone:"", email:"", address:"", num_paciente:"", notes:"" };

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientsAPI.getAll();
      setPatients(res.data || []);
    } catch (e) {
      toast({ title: "Error", description: e.message || 'No se pudo cargar pacientes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const filteredPatients = patients.filter(p => {
    const s = searchTerm.toLowerCase();
    return (
      (p.full_name || `${p.first_name} ${p.last_name}` ).toLowerCase().includes(s) ||
      (p.email||'').toLowerCase().includes(s) ||
      (p.phone||'').includes(s) ||
      (p.num_paciente||'').toLowerCase().includes(s)
    );
  });

  const startAdd = () => { setForm(emptyForm); setAdding(true); };
  const cancelAdd = () => { setAdding(false); };
  const saveAdd = async () => {
    try {
      const payload = { ...form };
      if (!payload.full_name) payload.full_name = `${payload.first_name} ${payload.last_name}`.trim();
      await patientsAPI.create(payload);
      toast({ title: 'Paciente creado', description: payload.full_name });
      setAdding(false);
      fetchPatients();
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.detail || e.message, variant: 'destructive' });
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setEditForm({
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      full_name: p.full_name || `${p.first_name||''} ${p.last_name||''}`.trim(),
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      num_paciente: p.num_paciente || '',
      notes: p.notes || ''
    });
  };
  const cancelEdit = () => { setEditingId(null); };
  const saveEdit = async () => {
    try {
      const payload = { ...editForm };
      if (!payload.full_name) payload.full_name = `${payload.first_name} ${payload.last_name}`.trim();
      await patientsAPI.update(editingId, payload);
      toast({ title: 'Paciente actualizado', description: payload.full_name });
      setEditingId(null);
      fetchPatients();
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.detail || e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Base de Pacientes</h1>
          <p className="text-gray-600">Contactos unificados desde la Agenda y creados manualmente</p>
        </div>
        {!adding ? (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={startAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={cancelAdd}><X className="h-4 w-4 mr-1"/>Cancelar</Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={saveAdd}><Save className="h-4 w-4 mr-1"/>Guardar</Button>
          </div>
        )}
      </div>

      {/* Add Form */}
      {adding && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Nombre" value={form.first_name} onChange={(e)=>setForm({...form, first_name:e.target.value})} />
            <Input placeholder="Apellidos" value={form.last_name} onChange={(e)=>setForm({...form, last_name:e.target.value})} />
            <Input placeholder="Nombre completo (opcional)" value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} />
            <Input placeholder="Teléfono" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
            <Input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
            <Input placeholder="Dirección" value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} />
            <Input placeholder="Número de Paciente" value={form.num_paciente} onChange={(e)=>setForm({...form, num_paciente:e.target.value})} />
            <Input placeholder="Notas" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />
          </CardContent>
        </Card>
      )}

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Pacientes ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, teléfono o número de paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <Button variant="outline" onClick={fetchPatients}>Actualizar</Button>
          </div>

          <div className="space-y-4">
            {filteredPatients.map((p) => (
              <div key={p._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {editingId === p._id ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input placeholder="Nombre" value={editForm.first_name} onChange={(e)=>setEditForm({...editForm, first_name:e.target.value})} />
                    <Input placeholder="Apellidos" value={editForm.last_name} onChange={(e)=>setEditForm({...editForm, last_name:e.target.value})} />
                    <Input placeholder="Nombre completo (opcional)" value={editForm.full_name} onChange={(e)=>setEditForm({...editForm, full_name:e.target.value})} />
                    <Input placeholder="Teléfono" value={editForm.phone} onChange={(e)=>setEditForm({...editForm, phone:e.target.value})} />
                    <Input placeholder="Email" value={editForm.email} onChange={(e)=>setEditForm({...editForm, email:e.target.value})} />
                    <Input placeholder="Dirección" value={editForm.address} onChange={(e)=>setEditForm({...editForm, address:e.target.value})} />
                    <Input placeholder="Número de Paciente" value={editForm.num_paciente} onChange={(e)=>setEditForm({...editForm, num_paciente:e.target.value})} />
                    <Input placeholder="Notas" value={editForm.notes} onChange={(e)=>setEditForm({...editForm, notes:e.target.value})} />
                    <div className="flex items-center gap-2 col-span-1 md:col-span-3 justify-end">
                      <Button size="sm" variant="outline" onClick={cancelEdit}><X className="h-4 w-4 mr-1"/>Cancelar</Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={saveEdit}><Save className="h-4 w-4 mr-1"/>Guardar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={""} alt={p.full_name} />
                        <AvatarFallback>{(p.full_name || `${p.first_name} ${p.last_name}`).split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-base font-semibold text-gray-900">{p.full_name || `${p.first_name} ${p.last_name}`}</h3>
                          {p.num_paciente && <Badge className="bg-blue-100 text-blue-700">#{p.num_paciente}</Badge>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2"><Phone className="h-4 w-4" /><span>{p.phone || '—'}</span></div>
                          <div className="flex items-center space-x-2"><Mail className="h-4 w-4" /><span>{p.email || '—'}</span></div>
                          <div className="flex items-center space-x-2"><MapPin className="h-4 w-4" /><span>{p.address || '—'}</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                        <Edit className="h-4 w-4 mr-1" />Editar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredPatients.length === 0 && !loading && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron pacientes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Patients;