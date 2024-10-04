import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AuthUser = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    // If user is not logged in, redirect to the login page
    return <Navigate to="/login" />;
  }

  if (window.location.pathname === '/login') {
    return <Navigate to="/tasks" />;
  }

  // If user is a student or tutor, render the children components
  return children;
};

export default AuthUser;
