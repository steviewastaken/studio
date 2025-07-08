
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context";
import { JobsProvider } from "@/context/jobs-context";
import { LanguageProvider } from "@/context/language-context";
import MainLayout from "@/components/dunlivrer/main-layout";
import { ChatProvider } from "@/context/chat-context";
import './globals.css';

export const metadata = {
  title: 'Dunlivrer',
  description: 'The Future of Logistics, Delivered Today.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <JobsProvider>
              <ChatProvider>
                <MainLayout>
                  {children}
                </MainLayout>
                <Toaster />
              </ChatProvider>
            </JobsProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
