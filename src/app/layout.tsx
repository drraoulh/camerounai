import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import { PlacesProvider } from "@/components/PlacesProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingChatbot } from "@/components/FloatingChatbot";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visit Cameroon – Official Tourism Guide to Attractions, Events & Culture",
  description:
    "Discover Cameroon’s landmarks, regions, food, culture and events. Plan with AI: itineraries, map and responsible travel — Visit Cameroon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] font-sans text-[var(--ink)] antialiased">
        <LocaleProvider>
          <FavoritesProvider>
            <PlacesProvider>
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
              <FloatingChatbot />
            </PlacesProvider>
          </FavoritesProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
