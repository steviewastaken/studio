
"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Bot, User, ThumbsUp, ThumbsDown, Headset, Circle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useChat, type ChatSession } from '@/context/chat-context';

export default function SupportMonitorPage() {
    const { chats, addMessageToChat, rateMessage } = useChat();
    const [selectedChatId, setSelectedChatId] = useState<string | null>(chats[0]?.id || null);
    const selectedChat = chats.find(c => c.id === selectedChatId);

    const [adminMessage, setAdminMessage] = useState("");
    const { toast } = useToast();

    const handleRateMessage = (chatId: string, messageId: string, rating: 'good' | 'bad') => {
        rateMessage(chatId, messageId, rating);
        toast({ title: "Feedback Submitted", description: "Thanks for helping train our AI." });
    }

    const handleSendMessage = () => {
        if (!selectedChatId || !adminMessage.trim()) return;

        addMessageToChat(selectedChatId, {
            sender: 'admin',
            text: adminMessage,
        });
        
        setAdminMessage("");
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/admin"><ArrowLeft className="mr-2" /> Back to Dashboard</Link>
                </Button>
                <h1 className="text-4xl font-bold font-headline text-white">Live Support Monitor</h1>
                <p className="mt-1 text-lg text-muted-foreground">Oversee AI-user interactions and step in when needed.</p>
            </motion.div>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Chat List */}
                <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}>
                    <Card className="bg-card/80 border-white/10">
                        <CardHeader><CardTitle>Active Chats</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-1">
                                {chats.map(chat => (
                                    <button key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={cn("w-full text-left p-4 hover:bg-muted/50 transition-colors", selectedChatId === chat.id && "bg-muted")}>
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold">{chat.userId}</p>
                                            <Badge variant={chat.status === 'Needs Attention' ? 'destructive' : chat.status === 'Resolved' ? 'secondary' : 'default'}>
                                                {chat.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate mt-1">{chat.lastMessage}</p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                
                {/* Chat Window */}
                <motion.div className="lg:col-span-2 h-[70vh]" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.4 } }}>
                    {selectedChat ? (
                        <Card className="bg-card/80 border-white/10 h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Conversation with {selectedChat.userId}</CardTitle>
                                <CardDescription>Review the chat log and take action if necessary.</CardDescription>
                            </CardHeader>
                            <Separator/>
                            <CardContent className="flex-1 p-0 overflow-hidden">
                                <ScrollArea className="h-full p-6">
                                    <div className="space-y-6">
                                        {selectedChat.messages.map(msg => (
                                            <div key={msg.id} className={cn("flex items-end gap-3", msg.sender !== 'user' ? 'justify-start' : 'justify-end')}>
                                                {msg.sender !== 'user' && (
                                                    <Avatar className="w-8 h-8 border">
                                                        <AvatarFallback className={cn(msg.sender === 'ai' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent')}>
                                                            {msg.sender === 'ai' ? <Bot className="w-5 h-5"/> : <Headset className="w-5 h-5"/>}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="max-w-[80%]">
                                                    <div className={cn("rounded-xl px-4 py-2 break-words text-sm", msg.sender === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                                        <p>{msg.text}</p>
                                                    </div>
                                                    {msg.sender === 'ai' && (
                                                        <div className="flex items-center gap-2 mt-1.5 justify-start">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRateMessage(selectedChat.id, msg.id, 'good')} disabled={msg.rating === 'good'}>
                                                                <ThumbsUp className={cn("w-4 h-4 text-muted-foreground", msg.rating === 'good' && 'text-green-500')}/>
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRateMessage(selectedChat.id, msg.id, 'bad')} disabled={msg.rating === 'bad'}>
                                                                <ThumbsDown className={cn("w-4 h-4 text-muted-foreground", msg.rating === 'bad' && 'text-red-500')}/>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                {msg.sender === 'user' && (
                                                    <Avatar className="w-8 h-8 border">
                                                        <AvatarFallback className="bg-muted"><User className="w-5 h-5"/></AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <div className="p-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <Input placeholder="Join conversation as Admin..." className="flex-1" value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                                    <Button size="icon" onClick={handleSendMessage}><Send/></Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center bg-card/50 border-white/10 border-dashed">
                            <div className="text-center text-muted-foreground">
                                <Headset className="w-12 h-12 mx-auto"/>
                                <p className="mt-4 font-semibold">Select a chat to view</p>
                            </div>
                        </Card>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
