import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  // Animation effect when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleForm = (mode: 'login' | 'signup' | 'forgot') => {
    setAuthMode(mode);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel - visible on medium screens and up */}
      <div className="hidden md:flex md:w-1/2 bg-charcoal p-12 flex-col justify-between">
        <div className="flex items-center">
          <img src="/Sakah logo new.png" alt="Sakah Logo" className="h-12" />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-primary">
            {authMode === 'login' ? 'Welcome Back!' : authMode === 'signup' ? 'Join Our Community' : 'Reset Password'}
          </h2>
          <p className="text-white/80 text-xl max-w-md">
            {authMode === 'login' 
              ? 'Log in to access your personalized dashboard and continue your journey with us.'
              : authMode === 'signup'
                ? 'Create an account to get started with our platform and unlock all features.'
                : 'Reset your password to regain access to your account.'}
          </p>
          
          <div className="flex space-x-4">
            <div className="h-2 w-2 rounded-full bg-primary/60"></div>
            <div className="h-2 w-2 rounded-full bg-primary/60"></div>
            <div className="h-2 w-2 rounded-full bg-primary"></div>
          </div>
        </div>
        
        <div className="text-white/70 text-sm">
          &copy; {new Date().getFullYear()} Sakah. All rights reserved.
        </div>
      </div>
      
      {/* Right panel - form container */}
      <div 
        className={`w-full md:w-1/2 bg-white p-6 sm:p-8 md:p-12 flex items-center justify-center transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo - only visible on small screens */}
          <div className="flex justify-center md:hidden mb-8">
            <span className="text-primary font-bold text-2xl">Sakah</span>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {authMode === 'login' 
                ? 'Sign in to account' 
                : authMode === 'signup' 
                  ? 'Create an account'
                  : 'Forgot Password'}
            </h1>
            <p className="mt-3 text-gray-500">
              {authMode === 'login' 
                ? 'Enter your credentials to access your account' 
                : authMode === 'signup' 
                  ? 'Fill out the form below to get started'
                  : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          <div className="mt-8">
            {authMode === 'login' ? (
              <LoginForm onToggleForm={() => toggleForm('signup')} onForgotPassword={() => toggleForm('forgot')} />
            ) : authMode === 'signup' ? (
              <SignupForm onToggleForm={() => toggleForm('login')} />
            ) : (
              <ForgotPasswordForm onBack={() => toggleForm('login')} />
            )}
          </div>
          
          {/* Mobile footer - only visible on small screens */}
          <div className="mt-8 text-center text-gray-500 text-sm md:hidden">
            &copy; {new Date().getFullYear()} Sakah. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
