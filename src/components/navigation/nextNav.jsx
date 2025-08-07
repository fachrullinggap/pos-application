"use client";

import {
  LayoutDashboard,
  BookOpen,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/catalog", icon: <BookOpen size={18} /> },
  { href: "/reports", icon: <FileBarChart size={18} /> },
  { href: "/settings", icon: <Settings size={18} /> },
  { href: "/logout", icon: <LogOut size={18} /> },
];

export default function NextNav() {
  const pathName = usePathname();
  const router = useRouter();

  const handleClick = (href) => {
    if (href === "/logout") {
      // Add logout logic here
      router.push("/");
    } else {
      router.push(href);
    }
  };

  return (
    <aside className="bg-gradient-to-br from-gray-950 to-gray-900 text-white w-20 h-screen p-4 shadow-xl border-r border-gray-800 backdrop-blur-md flex flex-col items-center">
      <div className="text-3xl font-bold text-blue-500 bg-white/10 w-12 h-12 flex items-center justify-center rounded-full mb-8">
        P
      </div>
      
      <ul className="space-y-9">
        {navItems.map(({ href, icon }) => {
          const isActive = pathName === href;

          return (
            <li key={href}>
              <button
                onClick={() => handleClick(href)}
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
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
