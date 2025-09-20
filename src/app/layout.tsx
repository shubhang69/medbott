import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'MediTalk',
  description: 'Your intelligent health assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-[#0A1817]">
        <div className="relative min-h-screen w-full bg-blurry-gradient overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="text-center text-8xl md:text-9xl font-extrabold text-primary/5 select-none space-y-4">
              <p>MONITOR</p>
              <p>VIRTUAL</p>
              <p>ASSISTANT</p>
              <p>HEALTH</p>
              <p>CHATBOT</p>
            </div>
          </div>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
