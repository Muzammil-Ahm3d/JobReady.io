import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ChatBot from "@/components/ChatBot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "JobReady.io | Master Your Interview",
    description: "The fastest way to prepare for tech interviews. precise questions, modal-based browsing, and SEO-optimized content.",
    icons: {
        icon: '/icon.svg',
    },
};

export default function RootLayout({
    children,
    modal
}: Readonly<{
    children: React.ReactNode;
    modal: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <Header />
                <main>
                    {children}
                    {modal}
                </main>
                <ChatBot />
            </body>
        </html>
    );
}
