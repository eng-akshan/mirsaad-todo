import { LoaderCircle } from 'lucide-react';
import { Logo } from './Logo.jsx';

export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-sand">
      <div className="flex flex-col items-center gap-5">
        <Logo />
        <LoaderCircle className="animate-spin text-moss" />
      </div>
    </div>
  );
}
