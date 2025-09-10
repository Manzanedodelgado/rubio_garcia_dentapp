export const mockData = {
  todayAppointments: 12,
  activePatients: 247,
  monthlyRevenue: "8,450",
  pendingAppointments: 5,
  
  recentAppointments: [
    {
      id: 1,
      patient: "Sarah Johnson",
      treatment: "Routine Cleaning",
      time: "2:00 PM",
      status: "completed"
    },
    {
      id: 2,
      patient: "Michael Davis",
      treatment: "Root Canal",
      time: "3:30 PM", 
      status: "pending"
    },
    {
      id: 3,
      patient: "Emily Chen",
      treatment: "Dental Implant Consultation",
      time: "4:15 PM",
      status: "completed"
    },
    {
      id: 4,
      patient: "Robert Wilson",
      treatment: "Teeth Whitening",
      time: "5:00 PM",
      status: "pending"
    }
  ],
  
  aiMessages: [
    {
      id: 1,
      type: "Appointment Reminder",
      description: "Sent reminder to 8 patients for tomorrow's appointments",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "Payment Processing",
      description: "Processed 3 patient payments automatically via WhatsApp",
      time: "4 hours ago"
    },
    {
      id: 3,
      type: "Follow-up Campaign",
      description: "Initiated post-treatment follow-up for 5 patients",
      time: "6 hours ago"
    },
    {
      id: 4,
      type: "Consent Collection",
      description: "Collected digital consent from 2 new patients",
      time: "1 day ago"
    }
  ],
  
  // Mock user credentials for testing
  testCredentials: {
    email: "admin@kokuai.com",
    password: "kokuai123"
  }
};