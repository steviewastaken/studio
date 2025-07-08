
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context";
import { JobsProvider } from "@/context/jobs-context";
import { ChatProvider } from "@/context/chat-context";
import { LanguageProvider } from "@/context/language-context";
import "./globals.css";


export const metadata: Metadata = {
  title: "Dunlivrer",
  description: "AI-powered delivery service, built with Next.js and Genkit.",
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
      <body>
        <LanguageProvider>
          <AuthProvider>
            <JobsProvider>
              <ChatProvider>
                {children}
                <Toaster />
              </ChatProvider>
            </JobsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
