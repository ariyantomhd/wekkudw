import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginFormCard } from '../../components/auth/LoginFormCard';
import {
  API_BASE_URL,
  extractApiErrorMessage,
  getAdminToken,
} from '../../services/apiClient';
import { loginAdmin } from '../../services/authAPI';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ||
    '/admin/dashboard';

  const existingToken = getAdminToken();
  if (existingToken) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your admin email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAdmin({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-themavia text-lg font-bold text-white">
            T
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Themavia Market Admin
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to manage digital products, uploads, and orders.
          </p>
        </div>

        <LoginFormCard
          email={email}
          password={password}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          apiBaseUrl={API_BASE_URL}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
