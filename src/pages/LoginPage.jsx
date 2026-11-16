import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { apiError } from '../services/api.js';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      toast.success('Welcome back.');
      navigate('/');
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Sign in to focus." copy="Your tasks are right where you left them.">
      <form className="space-y-5" onSubmit={submit}>
        <label className="field-label">Email
          <input className="field-input" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </label>
        <label className="field-label">Password
          <div className="relative">
            <input className="field-input pr-12" type={visible ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink" onClick={() => setVisible(!visible)} aria-label="Toggle password visibility">{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button>
          </div>
        </label>
        <button className="button-primary w-full py-3.5" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" size={19} /> : 'Sign in'}</button>
      </form>
      <p className="mt-7 text-center text-sm text-ink/55">New to MIRSAAD? <Link className="font-bold text-moss hover:underline" to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}
