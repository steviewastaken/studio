import { Truck } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 md:px-8 backdrop-blur-sm bg-background/50 border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-lg text-primary-foreground shadow-lg shadow-primary/30">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-gray-100">
            Dunlivrer
          </h1>
        </div>
      </div>
    </header>
  );
}
