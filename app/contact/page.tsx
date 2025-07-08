
"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/language-context';
import { useChat } from '@/context/chat-context';
import { useAuth } from '@/context/auth-context';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    } 
  },
};

const formVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    } 
  },
};

const staggeredContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    },
  },
};

export default function ContactPage() {
  const { toast } = useToast();
  const { content } = useLanguage();
  const { addMessageToChat } = useChat();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const { isSubmitting } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Determine a unique ID for the chat session
    const chatId = user ? `support-${user.id}` : `contact-${values.email}`;
    // Use the logged-in user's name or the name from the form
    const userName = user ? user.name : values.name;

    // Format the message to include the subject line
    const formattedMessage = `Subject: ${values.subject}\n\n${values.message}`;
    
    // Add the message to the global chat context
    addMessageToChat(chatId, {
      sender: 'user',
      text: formattedMessage,
    }, {
      userId: userName
    });

    toast({
      title: content.contact_form_success_title,
      description: "Your message has been sent to our support team.",
    });
    form.reset();
  }

  return (
    <div className="w-full pt-24 md:pt-32">
        <motion.section 
            className="text-center w-full max-w-7xl mx-auto px-4 md:px-8"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
        >
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-white">{content.contact_title}</h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {content.contact_subtitle}
            </p>
        </motion.section>

        <motion.section 
            className="py-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggeredContainer}
        >
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-8">
                    <motion.div variants={itemVariants} className="flex items-start gap-4" whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                        <div className="p-3 bg-primary/20 rounded-lg text-primary"><Mail className="w-6 h-6"/></div>
                        <div>
                            <h3 className="font-semibold text-lg text-white">{content.contact_email_title}</h3>
                            <p className="text-muted-foreground">{content.contact_email_desc}</p>
                            <a href="mailto:contact@dunlivrer.com" className="text-primary hover:underline">contact@dunlivrer.com</a>
                        </div>
                    </motion.div>
                     <motion.div variants={itemVariants} className="flex items-start gap-4" whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                        <div className="p-3 bg-primary/20 rounded-lg text-primary"><Phone className="w-6 h-6"/></div>
                        <div>
                            <h3 className="font-semibold text-lg text-white">{content.contact_phone_title}</h3>
                            <p className="text-muted-foreground">{content.contact_phone_desc}</p>
                            <a href="tel:+1234567890" className="text-primary hover:underline">+1 (234) 567-890</a>
                        </div>
                    </motion.div>
                     <motion.div variants={itemVariants} className="flex items-start gap-4" whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                        <div className="p-3 bg-primary/20 rounded-lg text-primary"><MapPin className="w-6 h-6"/></div>
                        <div>
                            <h3 className="font-semibold text-lg text-white">{content.contact_office_title}</h3>
                            <p className="text-muted-foreground">101 City Center, Anytown, USA</p>
                        </div>
                    </motion.div>
                </div>

                <motion.div className="lg:col-span-2" variants={formVariant}>
                    <Card className="bg-card/80 border-white/10 shadow-2xl shadow-primary/10 backdrop-blur-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl">{content.contact_form_title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>{content.contact_form_name_label}</FormLabel><FormControl><Input placeholder={content.contact_form_name_placeholder} {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem><FormLabel>{content.contact_form_email_label}</FormLabel><FormControl><Input placeholder={content.contact_form_email_placeholder} {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="subject" render={({ field }) => (
                                        <FormItem><FormLabel>{content.contact_form_subject_label}</FormLabel><FormControl><Input placeholder={content.contact_form_subject_placeholder} {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="message" render={({ field }) => (
                                        <FormItem><FormLabel>{content.contact_form_message_label}</FormLabel><FormControl><Textarea placeholder={content.contact_form_message_placeholder} rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <Button type="submit" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? content.contact_form_sending_button : content.contact_form_send_button}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.section>
    </div>
  );
}
