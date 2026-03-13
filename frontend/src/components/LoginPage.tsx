import { useState, type FormEvent } from 'react';

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError('Wrong password');
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cl-bg flex items-center justify-center px-4">
      <div className="bg-cl-surface border border-cl-border rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-cl-accent rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">FM</span>
          </div>
          <span className="text-xl font-bold text-cl-text">FManager</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cl-text-2 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-cl-border bg-cl-surface-2 text-sm text-cl-text focus:outline-none focus:ring-2 focus:ring-cl-accent focus:border-transparent placeholder:text-cl-dim"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-cl-accent text-white text-sm font-medium rounded-xl hover:bg-cl-accent-h disabled:opacity-60 transition-colors"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
