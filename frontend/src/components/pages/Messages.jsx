import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { 
  MessageSquare, 
  Send,
  Search,
  Filter,
  Phone,
  MoreVertical,
  CheckCheck,
  Clock
} from "lucide-react";

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const chats = [
    {
      id: 1,
      patient: "María García",
      lastMessage: "¿A qué hora es mi cita mañana?",
      time: "hace 5 min",
      unread: 2,
      status: "online",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      patient: "Carlos López", 
      lastMessage: "Gracias por el recordatorio",
      time: "hace 15 min",
      unread: 0,
      status: "offline",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      patient: "Ana Rodríguez",
      lastMessage: "¿Puedo reprogramar mi cita?",
      time: "hace 2 horas",
      unread: 1,
      status: "online",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const messages = selectedChat ? [
    {
      id: 1,
      sender: "patient",
      content: "Hola doctor, ¿a qué hora es mi cita mañana?",
      time: "10:30 AM",
      status: "delivered"
    },
    {
      id: 2,
      sender: "clinic",
      content: "Hola María, tu cita es mañana a las 2:00 PM. Te enviaré un recordatorio 24 horas antes.",
      time: "10:35 AM",
      status: "read"
    },
    {
      id: 3,
      sender: "patient",
      content: "Perfecto, muchas gracias 😊",
      time: "10:36 AM",
      status: "delivered"
    }
  ] : [];

  const templates = [
    "Recordatorio de cita para mañana a las [HORA]",
    "Su pago ha sido procesado exitosamente",
    "Por favor confirme su cita respondiendo SÍ",
    "Gracias por su visita. ¿Cómo se siente?",
    "Su próxima cita está programada para [FECHA]"
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Mock send message
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-lg shadow-sm border">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              WhatsApp Business
            </h2>
            <Badge className="bg-green-100 text-green-700">Conectado</Badge>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedChat?.id === chat.id ? 'bg-emerald-50 border-emerald-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar} alt={chat.patient} />
                    <AvatarFallback>
                      {chat.patient.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {chat.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {chat.patient}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">{chat.time}</span>
                      {chat.unread > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat.avatar} alt={selectedChat.patient} />
                  <AvatarFallback>
                    {selectedChat.patient.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedChat.patient}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedChat.status === 'online' ? 'En línea' : 'Desconectado'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'clinic' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'clinic'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      message.sender === 'clinic' ? 'text-emerald-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">{message.time}</span>
                      {message.sender === 'clinic' && (
                        <CheckCheck className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  className="rounded-full p-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Welcome Screen */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Centro de Mensajes WhatsApp
                </h3>
                <p className="text-gray-600 mb-6">
                  Selecciona una conversación para comenzar a chatear
                </p>
              </div>
            </div>
            
            {/* Quick Templates */}
            <div className="p-6 border-t bg-gray-50">
              <h4 className="font-medium mb-3">Plantillas Rápidas</h4>
              <div className="space-y-2">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;