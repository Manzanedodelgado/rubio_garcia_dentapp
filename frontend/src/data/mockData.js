export const mockData = {
  todayAppointments: 12,
  activePatients: 247,
  monthlyRevenue: "8,450",
  pendingAppointments: 5,
  
  recentAppointments: [
    {
      id: 1,
      patient: "Sarah Johnson",
      treatment: "Limpieza dental",
      time: "2:00 PM",
      status: "completed"
    },
    {
      id: 2,
      patient: "Michael Davis",
      treatment: "Endodoncia",
      time: "3:30 PM", 
      status: "pending"
    },
    {
      id: 3,
      patient: "Emily Chen",
      treatment: "Consulta implante",
      time: "4:15 PM",
      status: "completed"
    },
    {
      id: 4,
      patient: "Robert Wilson",
      treatment: "Blanqueamiento",
      time: "5:00 PM",
      status: "pending"
    }
  ],
  
  aiMessages: [
    {
      id: 1,
      type: "Recordatorio Enviado",
      description: "Recordatorio automático enviado a 8 pacientes para citas de mañana",
      time: "hace 2 horas"
    },
    {
      id: 2,
      type: "Sincronización Completada",
      description: "Datos actualizados desde Google Sheets - 2,327 citas procesadas",
      time: "hace 4 horas"
    },
    {
      id: 3,
      type: "Seguimiento Post-Tratamiento",
      description: "Campaña de seguimiento iniciada para 5 pacientes",
      time: "hace 6 horas"
    },
    {
      id: 4,
      type: "Backup Automático",
      description: "Respaldo de base de datos completado exitosamente",
      time: "hace 1 día"
    }
  ],
  
  // Mock user credentials for testing
  testCredentials: [
    {
      email: "admin@rubiogarcia.com",
      password: "dental123",
      name: "Dr. Rubio García",
      role: "Director Clínico",
      avatarColor: "emerald"
    },
    {
      email: "JMD",
      password: "190582", 
      name: "Juan Antonio Manzanedo",
      role: "Director",
      avatarColor: "blue"
    },
    {
      email: "assistant",
      password: "assistant123",
      name: "María González", 
      role: "Asistente Dental",
      avatarColor: "purple"
    }
  ],

  // Avatar colors for dental team
  avatarColors: {
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    emerald: "bg-emerald-100 text-emerald-600 border-emerald-200", 
    purple: "bg-purple-100 text-purple-600 border-purple-200",
    indigo: "bg-indigo-100 text-indigo-600 border-indigo-200",
    rose: "bg-rose-100 text-rose-600 border-rose-200",
    orange: "bg-orange-100 text-orange-600 border-orange-200",
    teal: "bg-teal-100 text-teal-600 border-teal-200",
    cyan: "bg-cyan-100 text-cyan-600 border-cyan-200"
  }
};