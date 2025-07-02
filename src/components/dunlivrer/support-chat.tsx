"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleSupportQuestion } from "@/lib/actions";
import type { DeliveryDetails } from "./types";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

type SupportChatProps = {
  deliveryDetails: DeliveryDetails | null;
};

export default function SupportChat({ deliveryDetails }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (deliveryDetails) {
        setMessages([
            { id: 1, role: "ai", content: `Hello! I can help with questions about your delivery from ${deliveryDetails.pickupAddress}. How can I assist?` }
        ]);
    } else {
        setMessages([
            { id: 1, role: "ai", content: "Hello! I am the Dunlivrer support assistant. How can I help you today?" }
        ]);
    }
  }, [deliveryDetails]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: "smooth"
        });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage: Message = { id: Date.now(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    const deliveryDetailsString = deliveryDetails
      ? `From: ${deliveryDetails.pickupAddress}, To: ${deliveryDetails.destinationAddress}, Size: ${deliveryDetails.packageSize}`
      : undefined;
    
    const result = await handleSupportQuestion({ question: input, deliveryDetails: deliveryDetailsString });
    
    if (result.success && result.data) {
        const aiMessage: Message = { id: Date.now() + 1, role: "ai", content: result.data.answer };
        setMessages(prev => [...prev, aiMessage]);
    } else {
        toast({
            variant: "destructive",
            title: "Chat Error",
            description: result.error
        });
        const errorMessage: Message = { id: Date.now() + 1, role: "ai", content: "Sorry, I couldn't process that. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  const isDisabled = isLoading;

  return (
    <Card className="w-full shadow-lg rounded-xl flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Bot /> AI Support</CardTitle>
        <CardDescription>{deliveryDetails ? "Ask questions about your active delivery." : "Ask general questions about our service."}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex items-end gap-2", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === "ai" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("rounded-lg px-3 py-2 max-w-[80%] break-words", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-accent text-accent-foreground"><User className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-end gap-2 justify-start">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 bg-muted">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1"
            disabled={isDisabled}
          />
          <Button type="submit" size="icon" disabled={isDisabled}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
