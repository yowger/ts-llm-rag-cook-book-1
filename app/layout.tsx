import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Cookbook RAG",
    description: "RAG cookbook",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className="dark h-full antialiased">
            <body className={`${inter.className} min-h-full flex flex-col`}>
                {children}
            </body>
        </html>
    )
}