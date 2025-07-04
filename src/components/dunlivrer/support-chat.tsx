
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleSupportQuestion, handleTextToSpeech } from "@/lib/actions";
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

// For SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function SupportChat({ deliveryDetails }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Autoplay audio when src changes
    if (currentAudioSrc && audioRef.current) {
        audioRef.current.src = currentAudioSrc;
        audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
    }
  }, [currentAudioSrc]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                sendQuery(transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                toast({ variant: "destructive", title: "Voice Error", description: "Couldn't recognize audio. Please try again or type."});
                setIsListening(false);
            };
             recognitionRef.current.onend = () => {
                if (isListening) {
                  setIsListening(false);
                }
            };
        }
    }
  }, [toast, isListening]); // Dependencies

  const generateAndPlayAudio = async (text: string) => {
      const audioResult = await handleTextToSpeech(text);
      if (audioResult.success && audioResult.data) {
          setCurrentAudioSrc(audioResult.data.audioDataUri);
      } else {
          toast({
              variant: "destructive",
              title: "Audio Error",
              description: "Could not generate voice response."
          });
      }
  };
  
  const handleToggleAudio = async () => {
      const newAudioState = !isAudioEnabled;
      setIsAudioEnabled(newAudioState);
      if (newAudioState && messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.role === 'ai') {
             await generateAndPlayAudio(lastMessage.content);
          }
      }
  };
  
  const toggleListening = () => {
      if (!recognitionRef.current) {
          toast({ variant: "destructive", title: "Not Supported", description: "Your browser does not support speech recognition."});
          return;
      }
      if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
      } else {
          recognitionRef.current.start();
          setIsListening(true);
      }
  };

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

  const sendQuery = async (query: string) => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { id: Date.now(), role: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    
    const deliveryDetailsString = deliveryDetails
      ? `From: ${deliveryDetails.pickupAddress}, To: ${deliveryDetails.destinationAddresses.join('; ')}, Size: ${deliveryDetails.packageSize}`
      : undefined;
    
    const result = await handleSupportQuestion({ question: query, deliveryDetails: deliveryDetailsString });
    
    if (result.success && result.data) {
        const aiMessage: Message = { id: Date.now() + 1, role: "ai", content: result.data.answer };
        setMessages(prev => [...prev, aiMessage]);
        
        if (isAudioEnabled) {
            await generateAndPlayAudio(result.data.answer);
        }
    } else {
        toast({
            variant: "destructive",
            title: "Chat Error",
            description: result.error
        });
        const errorMessageText = "Sorry, I couldn't process that. Please try again.";
        const errorMessage: Message = { id: Date.now() + 1, role: "ai", content: errorMessageText };
        setMessages(prev => [...prev, errorMessage]);

        if (isAudioEnabled) {
             await generateAndPlayAudio(errorMessageText);
        }
    }
    
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendQuery(input);
    setInput("");
  };

  return (
    <>
      <audio ref={audioRef} className="hidden" />
      <Card className="w-full shadow-2xl shadow-primary/10 rounded-2xl border-white/10 bg-card/80 backdrop-blur-lg flex flex-col h-[65vh] min-h-[400px] max-h-[550px]">
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle className="font-headline text-3xl flex items-center gap-3"><Bot className="text-primary"/> AI Support</CardTitle>
                <CardDescription>{deliveryDetails ? "Ask questions about your active delivery." : "Ask general questions about our service."}</CardDescription>
            </div>
             <Button 
                variant="ghost" 
                size="icon"
                onClick={handleToggleAudio}
                aria-label={isAudioEnabled ? "Disable audio responses" : "Enable audio responses"}
             >
                {isAudioEnabled ? <Volume2 className="text-primary"/> : <VolumeX />}
            </Button>
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
              placeholder={isListening ? "Listening..." : "Ask anything..."}
              className="flex-1 h-12 bg-transparent"
              disabled={isLoading || isListening}
            />
            <Button
                type="button"
                onClick={toggleListening}
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className="h-12 w-12 shrink-0"
                disabled={isLoading || !recognitionRef.current}
                aria-label={isListening ? "Stop listening" : "Use voice"}
            >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button type="submit" size="icon" className="h-12 w-12 shrink-0" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
