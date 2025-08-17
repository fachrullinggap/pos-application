"use client";

import {
  LayoutDashboard,
  BookOpen,
  FileBarChart,
  Settings,
  LogOut,
  Users, // --- CHANGE 1: Import the new icon ---
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

// --- CHANGE 2: Add the new nav item with a 'roles' property ---
const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard", roles: ["admin"] },
  { href: "/catalog", icon: <BookOpen size={18} />, label: "Catalog" },
  { href: "/reports", icon: <FileBarChart size={18} />, label: "Reports" },
  { href: "/user-list", icon: <Users size={18} />, label: "User List", roles: ["admin"] }, // New User List item
  { href: "/settings", icon: <Settings size={18} />, label: "Settings" },
  { href: "/logout", icon: <LogOut size={18} />, label: "Logout" },
];

export default function NextNav() {
  const pathName = usePathname();
  const router = useRouter();
  const { logout, userRole } = useAuth();

  const handleClick = (href) => {
    if (href === "/logout") {
      logout();
      router.push("/");
    } else {
      router.push(href);
    }
  };

  // --- CHANGE 3: The filtering logic is now more scalable ---
  const visibleNavItems = navItems.filter((item) => {
    // If the item has a 'roles' array, check if the user's role is included.
    // If not, exclude the item.
    if (item.roles && !item.roles.includes(userRole)) {
      return false;
    }
    // Otherwise, include the item.
    return true;
  });

  return (
    <aside className="relative z-20 bg-gradient-to-br from-gray-950 to-gray-900 text-white w-20 h-screen p-4 shadow-xl border-r border-gray-800 backdrop-blur-md flex flex-col items-center">
      <div className="text-3xl font-bold text-blue-500 bg-white/10 w-12 h-12 flex items-center justify-center rounded-full mb-8">
        P
      </div>

      <ul className="space-y-9">
        {visibleNavItems.map(({ href, icon, label }) => {
          const isActive = pathName === href;

          return (
            <li key={href} className="relative group">
              <button
                onClick={() => handleClick(href)}
                aria-label={label}
                className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md scale-110"
                    : "bg-gray-800 bg-opacity-50 hover:bg-blue-500 hover:text-white hover:shadow-lg"
                }
                `}
              >
                {icon}
              </button>
              
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1 
                               bg-gray-800 text-white text-sm rounded-md shadow-lg 
                               whitespace-nowrap opacity-0 scale-95 invisible 
                               transition-all duration-200 group-hover:visible 
                               group-hover:opacity-100 group-hover:scale-100 group-hover:delay-200
                               pointer-events-none z-10">
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}