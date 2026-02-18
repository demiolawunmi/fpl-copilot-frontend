import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamId } from '../context/TeamIdContext';

const LoginPage = () => {
  const [input, setInput] = useState('');
  const { setTeamId } = useTeamId();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setTeamId(trimmed);
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          FPL Copilot
        </h1>
        <p className="mb-8 text-center text-sm text-slate-400">
          Enter your FPL Team ID to get started
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 123456"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-400 transition duration-200"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

