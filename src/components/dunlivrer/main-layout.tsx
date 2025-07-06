"use client";

import Header from '@/components/dunlivrer/header';
import Footer from '@/components/dunlivrer/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    // The useEffect and useLanguage hook have been moved to the provider
    // for a more direct and reliable state management.
    return (
        <div className="flex flex-col min-h-screen bg-transparent text-foreground">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
