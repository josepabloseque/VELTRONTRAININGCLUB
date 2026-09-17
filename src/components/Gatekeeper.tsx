import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Gatekeeper: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#0A0C0B]" />;
  }

  // Si no ha iniciado sesión -> Welcome / Onboarding
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  // El usuario autenticado siempre tiene acceso a la plataforma
  return <Outlet />;
};