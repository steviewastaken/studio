
import './globals.css';

export const metadata = {
  title: 'Dunlivrer',
  description: 'AI-powered delivery service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log(">>> [layout.tsx] Minimal layout rendering...");
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
