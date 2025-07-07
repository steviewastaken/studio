
"use client";

import Header from '@/components/dunlivrer/header';
import Footer from '@/components/dunlivrer/footer';
import { useLanguage } from '@/context/language-context';
import { useEffect } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { language } = useLanguage();
    
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);
    
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
