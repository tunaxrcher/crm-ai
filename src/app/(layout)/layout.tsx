import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { ToastProvider } from "@/components/shared/SimpleToast";
import { ErrorProvider } from "@/components/shared/ErrorProvider";
import { NotificationProvider } from "@/components/ui/notification-system";
import { CharacterProvider } from "@/features/character/context/CharacterContext";

const kanit = Kanit({
  variable: "--font-kanit",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI CRM RPG System",
  description:
    "A next-generation CRM system with RPG elements and AI integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kanit.variable} dark`}>
      <body suppressHydrationWarning className="antialiased">
        <ToastProvider>
          <ErrorProvider>
            <NotificationProvider>
              <CharacterProvider>
                <ClientBody>{children}</ClientBody>
              </CharacterProvider>
            </NotificationProvider>
          </ErrorProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
