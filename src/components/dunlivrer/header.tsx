import { Truck } from 'lucide-react';

export default function Header() {
  return (
    <header className="p-4 md:px-8 md:pt-8 md:pb-0">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary rounded-lg text-primary-foreground shadow-md">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-gray-100">
          Dunlivrer
        </h1>
      </div>
    </header>
  );
}
