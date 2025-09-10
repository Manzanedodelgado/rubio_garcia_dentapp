import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";
import { mockData } from "../data/mockData";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock login - simulate API call
    setTimeout(() => {
      // Check against mock credentials
      const validCredentials = mockData.testCredentials.find(cred => 
        (cred.email === email || cred.email === email) && cred.password === password
      );
      
      if (validCredentials) {
        // Simulate successful login
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", validCredentials.name);
        localStorage.setItem("userRole", validCredentials.role);
        toast({
          title: "Acceso Exitoso",
          description: `Bienvenido ${validCredentials.name}`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Error de Acceso",
          description: "Credenciales incorrectas. Intenta con JMD/190582",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    toast({
      title: "Recuperar Contraseña",
      description: "La funcionalidad estará disponible pronto",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-xl border-0 p-8">
        <div className="text-center mb-8">
          {/* Rubio García Dental Logo */}
          <div className="mb-6 flex justify-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_ai-hub-clone-1/artifacts/llonqh1v_IMG_0176.png" 
              alt="Rubio García Dental" 
              className="h-24 object-contain"
            />
          </div>
          
          <p className="text-slate-600 text-base mb-6">Accede a tu portal profesional</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <div className="flex items-center border border-slate-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <div className="pl-3 pr-2">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Usuario o Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 focus-visible:ring-0 flex-1 bg-transparent"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="flex items-center border border-slate-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <div className="pl-3 pr-2">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-0 focus-visible:ring-0 flex-1 bg-transparent"
                required
              />
            </div>
          </div>

          {/* Forgot Password & Login Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-700 text-sm underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-2 rounded-lg transition-colors"
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;