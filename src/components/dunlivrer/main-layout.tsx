"use client";

import Header from '@/components/dunlivrer/header';
import Footer from '@/components/dunlivrer/footer';
import { useLanguage } from '@/context/language-context';
import { useEffect } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { language } = useLanguage();

    // This is a side-effect to update the lang attribute on the html tag.
    // This is a clean way to do it without making the RootLayout a client component.
    useEffect(() => {
        if (document.documentElement.lang !== language) {
            document.documentElement.lang = language;
        }
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
