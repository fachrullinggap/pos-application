import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { CatalogProvider } from "@/context/catalogContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PadiPos",
  description: "Point of Sale Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* AuthProvider wraps everything, making user info available globally */}
        <AuthProvider>
          {/* CatalogProvider is nested so it can potentially access auth info if needed */}
          <CatalogProvider>
            {children}
          </CatalogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
