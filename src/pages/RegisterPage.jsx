import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { apiError } from '../services/api.js';

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Your workspace is ready.');
      navigate('/');
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Start fresh" title="Create your workspace." copy="One calm place for everything you intend to finish.">
      <form className="space-y-5" onSubmit={submit}>
        <label className="field-label">Name<input className="field-input" name="name" autoComplete="name" minLength={2} maxLength={100} required value={form.name} onChange={update} placeholder="Your name" /></label>
        <label className="field-label">Email<input className="field-input" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} placeholder="you@example.com" /></label>
        <label className="field-label">Password
          <input className="field-input" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={form.password} onChange={update} placeholder="8+ characters, with a letter and number" />
        </label>
        <button className="button-primary w-full py-3.5" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" size={19} /> : 'Create account'}</button>
      </form>
      <p className="mt-7 text-center text-sm text-ink/55">Already have an account? <Link className="font-bold text-moss hover:underline" to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}
