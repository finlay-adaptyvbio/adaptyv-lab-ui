"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  FileTextIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: HomeIcon,
      active: pathname === "/",
    },
    {
      href: "/about",
      label: "About",
      icon: FileTextIcon,
      active: pathname === "/about",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <nav className="flex flex-col gap-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300",
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        <div className="flex flex-col flex-grow border-r bg-background pt-5">
          <div className="flex items-center justify-between px-4">
            {!isCollapsed && (
              <span className="font-bold text-lg">hamilton-runner</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  route.active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <route.icon className="h-5 w-5" />
                {!isCollapsed && <span className="ml-2">{route.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          isCollapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-end">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-6 lg:px-8">{children}</main>

        <footer className="border-t py-4">
          <div className="container flex justify-end">
            <p className="text-sm text-muted-foreground">Version 0.1.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
