import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google"; // Import Space Mono font
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import "./globals.css";

// Import Space Mono font from Google Fonts
const spaceMono = Space_Mono({
  variable: "--font-space-mono", // Define the CSS variable name
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Ireme AI | Interview Preparation",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        signIn: { baseTheme: dark },
        signUp: { baseTheme: dark },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${spaceMono.className} antialiased pattern`}>
          {children}

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
