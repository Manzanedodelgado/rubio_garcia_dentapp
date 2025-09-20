import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import ToothAvatar from "../ui/tooth-avatar";
import { Badge } from "../ui/badge";
import { 
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Edit,
  Save,
  X
} from "lucide-react";
import { toast } from "../../hooks/use-toast";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: localStorage.getItem("userName") || "Juan Antonio Manzanedo",
    email: localStorage.getItem("userEmail") || "jmd@rubiogarcia.com",
    phone: "+52 555 0123",
    address: "Av. Reforma 456, CDMX",
    specialty: "Dirección Clínica",
    license: "CED-12345",
    yearsExperience: 15,
    education: "Universidad Nacional de Odontología",
    avatarColor: localStorage.getItem("avatarColor") || "blue"
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast({
      title: "Perfil actualizado",
      description: "Los cambios se han guardado exitosamente",
    });
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const achievements = [
    { name: "Especialista Certificado", date: "2020", icon: Award },
    { name: "1000+ Pacientes Tratados", date: "2023", icon: User },
    { name: "Innovador del Año", date: "2022", icon: Award }
  ];

  const stats = [
    { label: "Pacientes Tratados", value: "1,247", icon: User },
    { label: "Años de Experiencia", value: profile.yearsExperience, icon: Calendar },
    { label: "Tratamientos Realizados", value: "3,456", icon: Briefcase },
    { label: "Calificación Promedio", value: "4.9/5", icon: Award }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="h-8 w-8" />
            Mi Perfil
          </h1>
          <p className="text-gray-600">Administra tu información personal y profesional</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32 mx-auto">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-2xl">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{profile.name}</h2>
              <p className="text-gray-600 mb-2">{profile.specialty}</p>
              <Badge className="bg-emerald-100 text-emerald-700 mb-4">
                Licencia: {profile.license}
              </Badge>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{profile.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Logros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <IconComponent className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{achievement.name}</p>
                        <p className="text-xs text-gray-500">{achievement.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-4 text-center">
                    <IconComponent className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editedProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidad</Label>
                  {isEditing ? (
                    <Input
                      id="specialty"
                      value={editedProfile.specialty}
                      onChange={(e) => handleInputChange('specialty', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.specialty}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={editedProfile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{profile.address}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Profesional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license">Número de Licencia</Label>
                  {isEditing ? (
                    <Input
                      id="license"
                      value={editedProfile.license}
                      onChange={(e) => handleInputChange('license', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.license}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Años de Experiencia</Label>
                  {isEditing ? (
                    <Input
                      id="experience"
                      type="number"
                      value={editedProfile.yearsExperience}
                      onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value))}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.yearsExperience} años</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education">Educación</Label>
                {isEditing ? (
                  <Input
                    id="education"
                    value={editedProfile.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{profile.education}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;