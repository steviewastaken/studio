"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import DunlivrerLogo from './logo';

export default function Footer() {
  const [year, setYear] = useState<string>('');

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="w-full bg-background/20 border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <DunlivrerLogo />
          <p className="text-sm text-muted-foreground mt-2">Instant Delivery, Intelligently Done.</p>
        </div>
        <div>
          <h3 className="font-semibold font-headline text-white">Company</h3>
          <ul className="mt-4 space-y-2">
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Investors</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold font-headline text-white">Services</h3>
          <ul className="mt-4 space-y-2">
            <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">Personal Delivery</Link></li>
            <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">Business Logistics</Link></li>
            <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">API Integration</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold font-headline text-white">Legal</h3>
          <ul className="mt-4 space-y-2">
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-4">
        <p className="text-center text-sm text-muted-foreground">© {year} Dunlivrer. All rights reserved.</p>
      </div>
    </footer>
  );
}
