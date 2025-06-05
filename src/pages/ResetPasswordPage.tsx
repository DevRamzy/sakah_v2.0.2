import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import { useAuth } from '../contexts/AuthContext';

const ResetPasswordPage: React.FC = () => {
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel - visible on medium screens and up */}
      <div className="hidden md:flex md:w-1/2 bg-charcoal p-12 flex-col justify-between">
        <div className="flex items-center">
          <img src="/Sakah logo new.png" alt="Sakah Logo" className="h-12" />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-primary">
            Reset Your Password
          </h2>
          <p className="text-white/80 text-xl max-w-md">
            Create a new secure password to protect your account.
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
            <img src="/Sakah logo new.png" alt="Sakah Logo" className="h-8" />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Reset Your Password
            </h1>
            <p className="mt-3 text-gray-500">
              Enter your new password below
            </p>
          </div>

          <div className="mt-8">
            <ResetPasswordForm />
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

export default ResetPasswordPage;
