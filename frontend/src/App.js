import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import PanelLayout from "./components/layout/PanelLayout";
import PanelDeControl from "./components/pages/PanelDeControl";
import Appointments from "./components/pages/Appointments";
import Patients from "./components/pages/Patients";
import Analytics from "./components/pages/Analytics";
import AIAssistant from "./components/pages/AIAssistant";
import Messages from "./components/pages/Messages";
import Billing from "./components/pages/Billing";
import Settings from "./components/pages/Settings";
import Profile from "./components/pages/Profile";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/panel-de-control" element={<PanelLayout />}>
            <Route index element={<PanelDeControl />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patients" element={<Patients />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="messages" element={<Messages />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;