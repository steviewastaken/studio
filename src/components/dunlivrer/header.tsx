
"use client";

import Link from 'next/link';
import { Menu, LogOut, Globe, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import DunlivrerLogo from './logo';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';

const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'zh', name: 'Mandarin', native: '中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
];

function LanguageSwitcher() {
    const { setLanguage, content } = useLanguage();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Change language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{content.nav_select_language}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                    <DropdownMenuItem key={lang.code} onSelect={() => setLanguage(lang.code)}>
                        <span className="w-2/3 truncate">{lang.name}</span>
                        <span className="w-1/3 text-right text-muted-foreground">{lang.native}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function Header() {
  const { user, loading, logout } = useAuth();
  const { content } = useLanguage();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const baseNavLinks = [
    { href: '/services', label: content.nav_services },
    { href: '/tracking', label: content.nav_tracking },
    { href: '/feedback', label: content.nav_feedback },
    { href: '/contact', label: content.nav_contact },
  ];

  const navLinks = [
      ...baseNavLinks,
      user?.role === 'admin' 
        ? { href: '/admin', label: content.nav_admin }
        : { href: '/driver', label: content.nav_driver_app }
  ];

  const handleLogout = () => {
    logout();
    router.push('/signin');
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (typeof window !== 'undefined') {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) { 
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar, { passive: true });
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, []);

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 p-4 md:px-8 bg-background/50 backdrop-blur-lg border-b border-white/10"
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={isVisible ? "visible" : "hidden"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        <DunlivrerLogo />
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} prefetch={false} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          {loading ? (
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin"><Shield className="mr-2 h-4 w-4" />{content.nav_admin}</Link>
                    </DropdownMenuItem>
                )}
                {user.role === 'driver' && (
                    <DropdownMenuItem asChild>
                        <Link href="/driver"><User className="mr-2 h-4 w-4" />{content.nav_driver_app}</Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/signin">{content.nav_signin}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{content.nav_signup}</Link>
              </Button>
            </>
          )}
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col h-full p-4">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-lg font-medium hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-4">
                  {loading ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 px-2 py-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-3 w-[150px]" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </div>
                  ) : user ? (
                    <>
                      <div className="flex items-center gap-4 px-2 py-2">
                        <Avatar>
                           <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                       <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/signin">{content.nav_signin}</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/signup">{content.nav_signup}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
