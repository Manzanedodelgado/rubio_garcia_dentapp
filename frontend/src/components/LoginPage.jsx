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
          description: "Credenciales incorrectas. Intenta con JMD/190582 o admin@kokuai.com/kokuai123",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "Password reset functionality will be available soon",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg border-0 p-8">
        <div className="text-center mb-8">
          {/* Kokuai Logo */}
          <div className="mb-6">
            <h1 className="text-4xl font-light text-emerald-500 mb-1">
              kokuai
              <span className="inline-flex ml-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              </span>
            </h1>
          </div>
          
          <p className="text-gray-600 text-base mb-6">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-md focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <div className="pl-3 pr-2">
                <User className="h-5 w-5 text-gray-400" />
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
            <div className="flex items-center border border-gray-300 rounded-md focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <div className="pl-3 pr-2">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="password"
                placeholder="Password"
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
              className="text-teal-600 hover:text-teal-700 text-sm underline transition-colors"
            >
              Forgot password?
            </button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-2 rounded-md transition-colors"
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;