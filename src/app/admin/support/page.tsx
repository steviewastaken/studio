
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

type Message = {
  id: string;
  sender: 'user' | 'ai' | 'admin';
  text: string;
  timestamp: string;
  rating?: 'good' | 'bad' | null;
};

type ChatSession = {
  id: string;
  userId: string;
  status: 'AI Handling' | 'Needs Attention' | 'Resolved';
  lastMessage: string;
  messages: Message[];
};

const initialChats: ChatSession[] = [
  {
    id: 'chat-1',
    userId: 'user-abc',
    status: 'AI Handling',
    lastMessage: 'Ok, that makes sense. Thanks!',
    messages: [
      { id: 'm1-1', sender: 'user', text: 'Hi, where is my package?', timestamp: '10:30 AM', rating: null },
      { id: 'm1-2', sender: 'ai', text: 'Hello! I can help with that. Could you please provide your tracking ID?', timestamp: '10:31 AM', rating: 'good' },
      { id: 'm1-3', sender: 'user', text: 'It\'s DNLVR-801', timestamp: '10:31 AM', rating: null },
      { id: 'm1-4', sender: 'ai', text: 'Thanks! Your package is currently in transit with our courier, Alexandre Dubois, and is estimated to arrive at the Eiffel Tower within the next 25 minutes.', timestamp: '10:32 AM', rating: null },
      { id: 'm1-5', sender: 'user', text: 'Ok, that makes sense. Thanks!', timestamp: '10:33 AM', rating: null }
    ]
  },
  {
    id: 'chat-2',
    userId: 'user-xyz',
    status: 'Needs Attention',
    lastMessage: 'This is ridiculous, I want a refund now!',
    messages: [
      { id: 'm2-1', sender: 'user', text: 'My package is an hour late!!', timestamp: '10:40 AM', rating: null },
      { id: 'm2-2', sender: 'ai', text: 'I understand your frustration with the delay. Delays can occasionally happen due to unforeseen traffic. I see your delivery is more than 2 hours past its ETA, which makes you eligible for a refund of the delivery fee.', timestamp: '10:41 AM', rating: 'bad' },
      { id: 'm2-3', sender: 'user', text: 'This is ridiculous, I want a refund now!', timestamp: '10:42 AM', rating: null }
    ]
  },
  {
    id: 'chat-3',
    userId: 'user-def',
    status: 'Resolved',
    lastMessage: 'Perfect, thank you for your help.',
    messages: [
       { id: 'm3-1', sender: 'user', text: 'Can I change my delivery address?', timestamp: '11:00 AM', rating: null },
       { id: 'm3-2', sender: 'ai', text: 'Yes, you can request a reroute from the tracking page. There may be an additional fee depending on the new location.', timestamp: '11:01 AM', rating: 'good' },
       { id: 'm3-3', sender: 'user', text: 'Perfect, thank you for your help.', timestamp: '11:02 AM', rating: null }
    ]
  }
];

const getStatusColor = (status: ChatSession['status']) => {
    if (status === 'Needs Attention') return 'bg-red-500';
    if (status === 'Resolved') return 'bg-gray-500';
    return 'bg-green-500';
}

export default function SupportMonitorPage() {
    const [chats, setChats] = useState<ChatSession[]>(initialChats);
    const [selectedChat, setSelectedChat] = useState<ChatSession | null>(chats[0]);
    const [adminMessage, setAdminMessage] = useState("");
    const { toast } = useToast();

    const handleRateMessage = (chatId: string, messageId: string, rating: 'good' | 'bad') => {
        setChats(prev => prev.map(chat => {
            if (chat.id === chatId) {
                const updatedMessages = chat.messages.map(msg => 
                    msg.id === messageId ? { ...msg, rating } : msg
                );
                return { ...chat, messages: updatedMessages };
            }
            return chat;
        }));
        // Also update the selected chat if it's the one being rated
        if (selectedChat?.id === chatId) {
            setSelectedChat(prev => prev ? { ...prev, messages: prev.messages.map(msg => msg.id === messageId ? { ...msg, rating } : msg) } : null);
        }
        toast({ title: "Feedback Submitted", description: "Thanks for helping train our AI." });
    }

    const handleSendMessage = () => {
        if (!selectedChat || !adminMessage.trim()) return;

        const newMessage: Message = {
            id: `admin-${Date.now()}`,
            sender: 'admin',
            text: adminMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rating: null,
        };
        
        const updatedChat = { ...selectedChat, messages: [...selectedChat.messages, newMessage] };
        
        setSelectedChat(updatedChat);
        setChats(prev => prev.map(c => c.id === selectedChat.id ? updatedChat : c));
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
                                    <button key={chat.id} onClick={() => setSelectedChat(chat)} className={cn("w-full text-left p-4 hover:bg-muted/50 transition-colors", selectedChat?.id === chat.id && "bg-muted")}>
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
