import { Crosshair, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '../components/Logo.jsx';

export function AuthLayout({ children, eyebrow, title, copy }) {
  return (
    <div className="grid min-h-screen bg-sand lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-mint/15 blur-3xl" />
        <div className="absolute -bottom-48 -left-24 h-[28rem] w-[28rem] rounded-full bg-lime/10 blur-3xl" />
        <Logo light />
        <div className="relative max-w-xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-mint">
            <Sparkles size={15} /> Calm focus, every day
          </div>
          <h1 className="text-6xl font-black leading-[0.98] tracking-[-0.04em]">Keep the target<br /><span className="text-mint">in your sights.</span></h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-white/60">A clear, private space to plan what matters and finish with intent.</p>
        </div>
        <div className="flex gap-8 text-sm text-white/55">
          <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-mint" /> Secure by design</span>
          <span className="flex items-center gap-2"><Crosshair size={17} className="text-mint" /> Built for focus</span>
        </div>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Logo /></div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-moss">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-ink">{title}</h2>
          <p className="mt-3 text-ink/55">{copy}</p>
          <div className="mt-9">{children}</div>
        </div>
      </section>
    </div>
  );
}
