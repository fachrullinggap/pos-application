"use client";

import { usePathname } from "next/navigation";
import NextNav from '@/components/navigation/nextNav';

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const hideSidebarRoutes = ["/"]; // hide sidebar on login
  const shouldHideSidebar = hideSidebarRoutes.includes(pathname);

  return shouldHideSidebar ? (
    <>{children}</>
  ) : (
    <div className="flex min-h-screen  w-full">
      <NextNav /> {/* Sidebar on the left */}
      <main className="flex-1">{children}</main> {/* Page content on the right */}
    </div>
  );
}
