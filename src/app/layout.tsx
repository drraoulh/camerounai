import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import { PlacesProvider } from "@/components/PlacesProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingChatbot } from "@/components/FloatingChatbot";

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
      className={`${outfit.variable} ${cormorant.variable} h-full`}
    >
      <body className="site-body min-h-full flex flex-col font-sans text-[var(--ink)] antialiased">
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
