import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import authStore from '../../Store/authStore';

const ProtectedRoute = ({ children }) => {
  const { token } = authStore();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValid(false);
        setLoading(false);
        return;
      }

      try {
        await axios.get(`${import.meta.env.VITE_BACKEND_API}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsValid(true);
      } catch {
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (loading) return <div>Checking access...</div>;
  if (!isValid) return <Navigate to="/404" replace />;

  return children;
};

export default ProtectedRoute;
