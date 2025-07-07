import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const DunlivrerLogo = React.memo(({ className }: { className?: string }) => {
  return (
    <Link href="/" className={cn("group flex flex-col", className)}>
      <div className="flex items-center gap-3">
        <div className="grid -space-y-1">
          <span className="font-headline font-bold text-3xl leading-none text-white tracking-tight">DUN</span>
          <span className="font-headline font-bold text-3xl leading-none text-white tracking-tight">LIVRER</span>
        </div>
        <svg
          width="54"
          height="36"
          viewBox="0 0 54 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary transition-transform duration-300 ease-out group-hover:translate-x-2"
        >
          <path d="M54 18L31.5 2.34315V10.5H4.5V15H0V21H4.5V25.5H31.5V33.6569L54 18Z" fill="currentColor"/>
          <path d="M27 13.5H9V10.5H27V13.5Z" fill="currentColor" className="opacity-75"/>
          <path d="M22.5 25.5H4.5V22.5H22.5V25.5Z" fill="currentColor" className="opacity-75"/>
        </svg>
      </div>
      <div className="flex items-center w-[165px] mt-1.5 ml-px">
        <div className="h-px flex-1 bg-primary/70"></div>
        <span className="mx-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">TO DÊLIVER</span>
        <div className="h-px flex-1 bg-primary/70"></div>
      </div>
    </Link>
  );
});

DunlivrerLogo.displayName = 'DunlivrerLogo';

export default DunlivrerLogo;
