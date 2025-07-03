import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/dunlivrer/header';
import Footer from '@/components/dunlivrer/footer';
import { AuthProvider } from '@/context/auth-context';
import { GoogleMapsProvider } from '@/context/google-maps-context';
import { LanguageProvider } from '@/context/language-context';

export const metadata: Metadata = {
  title: 'Dunlivrer',
  description: 'AI-powered delivery service',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <AuthProvider>
            <GoogleMapsProvider>
              <div className="flex flex-col min-h-screen bg-transparent text-foreground">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </GoogleMapsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
