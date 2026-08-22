import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
            Earning platform frontend
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Welcome to the main experience.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300 sm:text-xl">
              This is the public frontend. Use the links below to sign in or create an account.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/login"
              className="rounded-2xl bg-primary-500 px-6 py-3 font-semibold text-white transition hover:bg-primary-600"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

