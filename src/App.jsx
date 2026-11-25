import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"
import FeaturesPage from "./pages/FeaturesPage"
import ProfilePage from "./pages/ProfilePage"
import Login from "./auth/Login"
import Register from "./auth/Register"
import PasswordRecovery from "./auth/PasswordRecovery"
import ResetPassword from "./auth/ResetPassword"
import Dashboard from "./dashboard/Dashboard"
import "./App.css"
import "./styles/SheFarmsDesign.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password-recovery" element={<PasswordRecovery />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
