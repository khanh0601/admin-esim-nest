import "@/assets/styles/globals.css";
import MainLayout from "@/layouts/MainLayout";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        template: `%s | ${APP_NAME}`,
        default: APP_NAME,
    },
    description: APP_DESCRIPTION,
    metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased`}>
                <MainLayout>{children}</MainLayout>
            </body>
        </html>
    );
}
