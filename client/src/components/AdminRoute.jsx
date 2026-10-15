import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const [state, setState] = useState({ status: 'checking', message: '' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    if (!localStorage.getItem('token')) {
      setState({ status: 'signed-out', message: '' });
      return () => { active = false; };
    }

    const checkAdmin = async () => {
      setState({ status: 'checking', message: '' });
      try {
        const response = await api.get('/auth/me');
        if (!active) return;
        if (response.data?.user?.role === 'admin') {
          setState({ status: 'allowed', message: '' });
        } else {
          setState({ status: 'denied', message: '' });
        }
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 401) {
          setState({ status: 'signed-out', message: '' });
        } else {
          setState({
            status: 'error',
            message: error.response?.data?.message || 'Unable to verify administrator access.',
          });
        }
      }
    };

    checkAdmin();
    return () => { active = false; };
  }, [retryCount]);

  if (state.status === 'signed-out') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (state.status === 'denied') return <Navigate to="/" replace />;

  if (state.status === 'error') {
    return (
      <main className="admin-guard-state" role="alert">
        <h1>Admin access unavailable</h1>
        <p>{state.message}</p>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button>
        <Link to="/">Return to EzyMart</Link>
      </main>
    );
  }

  if (state.status !== 'allowed') {
    return <main className="admin-guard-state" role="status">Checking administrator access…</main>;
  }

  return children;
};

export default AdminRoute;
