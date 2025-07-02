"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Bot } from "lucide-react";
import SupportChat from './support-chat';

export default function FloatingSupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  // Show bubble after a delay on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowBubble(true);
      }
    }, 1500); // Show after 1.5 seconds
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Hide bubble forever once interacted with
    if (open) {
      setShowBubble(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="fixed bottom-8 right-8 z-50 group">
          <div className="relative flex items-center justify-center">
            {showBubble && !isOpen && (
                 <div className="absolute bottom-full right-0 mb-3 bg-primary text-primary-foreground py-2 px-4 rounded-xl rounded-br-none shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300 origin-bottom-right">
                    <p className="text-sm font-medium">Hello!</p>
                 </div>
            )}
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-2xl shadow-primary/40 flex items-center justify-center"
              onClick={() => setShowBubble(false)}
            >
              <Bot className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </DialogTrigger>
      {/* The DialogContent is styled to be transparent so the SupportChat component's Card styling is used */}
      <DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-md">
        <SupportChat deliveryDetails={null} />
      </DialogContent>
    </Dialog>
  );
}
