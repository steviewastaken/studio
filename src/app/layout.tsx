import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import { JobsProvider } from '@/context/jobs-context';
import MainLayout from '@/components/dunlivrer/main-layout';
import { ChatProvider } from '@/context/chat-context';

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
    <html className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <AuthProvider>
            <JobsProvider>
              <ChatProvider>
                <MainLayout>
                  {children}
                </MainLayout>
                <Toaster />
              </ChatProvider>
            </JobsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
