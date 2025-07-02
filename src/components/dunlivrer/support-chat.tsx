"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
            { id: 1, role: "ai", content: "Hello! I'm the Dunlivrer AI assistant. Feel free to ask me any general questions about our services." }
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
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { id: Date.now(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    const deliveryDetailsString = deliveryDetails
      ? `From: ${deliveryDetails.pickupAddress}, To: ${deliveryDetails.destinationAddresses.join('; ')}, Size: ${deliveryDetails.packageSize}`
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

  return (
    <Card className="w-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg flex flex-col h-[65vh] min-h-[400px] max-h-[550px]">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-3"><Bot className="text-primary"/> AI Support</CardTitle>
        <CardDescription>{deliveryDetails ? "Ask questions about your active delivery." : "Ask general questions about our service."}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === "ai" && (
                  <Avatar className="w-8 h-8 border border-primary/50">
                    <AvatarFallback className="bg-primary/20 text-primary"><Bot className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("rounded-xl px-4 py-2 max-w-[80%] break-words text-sm", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <p>{message.content}</p>
                </div>
                {message.role === "user" && (
                   <Avatar className="w-8 h-8 border border-accent/50">
                    <AvatarFallback className="bg-accent/20 text-accent"><User className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8 border border-primary/50">
                        <AvatarFallback className="bg-primary/20 text-primary"><Bot className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-xl px-4 py-3 bg-muted">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground"/>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t border-white/10">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 h-12 bg-transparent"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0" disabled={isLoading}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
