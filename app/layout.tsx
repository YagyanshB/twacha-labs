import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// Use system fonts as fallback (Google Fonts blocked in build env)
const fontSans = {
  variable: "--font-sans",
  className: "",
};

const fontSerif = {
  variable: "--font-serif",
  className: "",
};

export const metadata: Metadata = {
  title: "Twacha Labs - Skin Analysis Reimagined",
  description: "AI-powered analysis designed specifically for men's skin. No BS, just results.",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* MediaPipe CDN Scripts - Load before interactive to avoid bundling issues */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
