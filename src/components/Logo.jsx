import { Crosshair } from 'lucide-react';

export function Logo({ light = false }) {
  return (
    <div className={`flex items-center gap-3 font-black tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${light ? 'bg-mint text-ink' : 'bg-ink text-mint'}`}>
        <Crosshair size={22} strokeWidth={2.5} />
      </span>
      <span className="text-lg">MIRSAAD <span className="font-medium opacity-70">TODO</span></span>
    </div>
  );
}
