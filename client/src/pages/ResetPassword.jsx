import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import '../styles/Login.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('This reset link is missing its token. Request a new password reset link.');
      return;
    }
    if (password.length < 6) {
      setError('Your password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/reset-password', { token, password });
      setSuccess(response.data.message || 'Your password has been reset.');
      window.setTimeout(() => navigate('/login', { replace: true }), 1600);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset your password. Request a new link and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">E</div>
          <span>Ezy<span className="login-orange">Mart</span></span>
        </div>

        <div className="login-heading">
          <p className="login-eyebrow">ACCOUNT RECOVERY</p>
          <h1>Set a new password</h1>
          <p className="login-subtitle">Choose a new password with at least 6 characters.</p>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}
        {success && <p className="verify-success" role="status">{success}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="login-field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>
          <button className="login-submit" type="submit" disabled={loading || Boolean(success)}>
            {loading ? 'Updating password...' : 'Reset password'}
          </button>
        </form>

        <p className="login-signup" style={{ marginTop: 22 }}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default ResetPassword;
