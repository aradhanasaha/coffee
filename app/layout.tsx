import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import ServiceWorkerRegister from "@/components/common/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "imnotupyet",
    description: "Log your coffee journey",
    icons: {
        icon: '/logo.png',
        apple: '/logo.png',
    },
    manifest: '/manifest.json',
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};


import Providers from "./providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ServiceWorkerRegister />
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
