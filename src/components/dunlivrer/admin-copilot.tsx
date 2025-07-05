"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BrainCircuit, Loader2, Send, Bot, User, Sparkles } from 'lucide-react';
import { handleQueryBusinessData } from '@/lib/actions';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';

type Message = {
    role: 'user' | 'ai';
    content: string;
};

const sampleQuestions = [
    "How many failed deliveries were there in Le Marais today?",
    "What was the refund rate for Zone 13 last week?",
    "Why was there a spike in cancellations yesterday?",
];

export default function AdminCopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages]);

    const handleSubmit = async (query?: string) => {
        const userQuery = query || input;
        if (!userQuery.trim() || isLoading) return;

        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
        setInput("");

        const result = await handleQueryBusinessData({ question: userQuery });
        
        const aiResponse = result.success ? result.data.answer : result.error || "An unexpected error occurred.";
        setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

        setIsLoading(false);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="fixed bottom-8 right-8 z-50 group">
                    <Button
                      size="lg"
                      className="rounded-full w-16 h-16 shadow-2xl shadow-accent/40 flex items-center justify-center bg-accent hover:bg-accent/90"
                      aria-label="Open AI Copilot"
                    >
                        <BrainCircuit className="w-8 h-8" />
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="p-0 bg-transparent border-none shadow-none w-full max-w-lg">
                <div className="bg-card/80 backdrop-blur-lg border border-white/10 rounded-2xl w-full h-[70vh] min-h-[500px] max-h-[600px] flex flex-col">
                    <DialogHeader className="p-6 text-left">
                        <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                            <BrainCircuit className="text-accent" />
                            Admin Copilot
                        </DialogTitle>
                        <DialogDescription>
                            Ask questions about your business data in plain language.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground p-8">
                                    <Sparkles className="w-10 h-10 mx-auto mb-4" />
                                    <h3 className="font-semibold text-white">Ask me anything</h3>
                                    <div className="mt-4 space-y-2 text-sm">
                                        {sampleQuestions.map(q => (
                                            <button key={q} onClick={() => handleSubmit(q)} className="block w-full text-left p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                                                <p>“{q}”</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {messages.map((message, index) => (
                                <div key={index} className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                                    {message.role === "ai" && (
                                        <Avatar className="w-8 h-8 border border-accent/50">
                                            <AvatarFallback className="bg-accent/20 text-accent"><BrainCircuit className="w-5 h-5" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn("rounded-xl px-4 py-2 max-w-[80%] break-words text-sm", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                        <p>{message.content}</p>
                                    </div>
                                    {message.role === "user" && (
                                        <Avatar className="w-8 h-8 border">
                                            <AvatarFallback className="bg-muted"><User className="w-5 h-5" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3 justify-start">
                                    <Avatar className="w-8 h-8 border border-accent/50">
                                        <AvatarFallback className="bg-accent/20 text-accent"><BrainCircuit className="w-5 h-5" /></AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-xl px-4 py-3 bg-muted">
                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-white/10">
                        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g., Which zone had the most failed deliveries today?"
                                className="flex-1 h-12 bg-transparent"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" className="h-12 w-12 shrink-0" disabled={isLoading || !input.trim()}>
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
