import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ChatBot from "@/components/ChatBot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://jobready.io'), // Placeholder domain
    title: {
        default: "JobReady.io | Master Your Technical Interview",
        template: "%s | JobReady.io",
    },
    description: "The fastest way to prepare for tech interviews. Precise questions, modal-based browsing, and SEO-optimized content for developers.",
    keywords: ["interview questions", "tech interview", "coding interview", "java interview", "python interview", "web development interview"],
    authors: [{ name: "JobReady.io" }],
    creator: "JobReady.io",
    publisher: "JobReady.io",
    openGraph: {
        title: "JobReady.io | Master Your Technical Interview",
        description: "The fastest way to prepare for tech interviews. Precise questions, modal-based browsing, and SEO-optimized content.",
        url: 'https://jobready.io',
        siteName: 'JobReady.io',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "JobReady.io | Master Your Technical Interview",
        description: "The fastest way to prepare for tech interviews. Precise questions, modal-based browsing, and SEO-optimized content.",
        creator: "@jobreadyio", // Placeholder
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/icon.svg',
        shortcut: '/icon.svg',
        apple: '/apple-icon.png', // Placeholder
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
