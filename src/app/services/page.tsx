
"use client";

import { Ship, Briefcase, Bot, CheckCircle, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/language-context';

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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
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
    },
  },
};

export default function ServicesPage() {
  const { t } = useLanguage();

  const serviceList = [
    {
      icon: <Ship className="w-8 h-8 text-primary" />,
      title: t('service1Title'),
      description: t('service1Desc'),
      details: [
        t('services_list_detail1'), 
        t('services_list_detail2'),
        t('services_list_detail3')
      ]
    },
    {
      icon: <Briefcase className="w-8 h-8 text-primary" />,
      title: t('service2Title'),
      description: t('service2Desc'),
      details: ['Dedicated account management', 'Volume-based pricing', 'Proof-of-delivery']
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: t('service3Title'),
      description: t('service3Desc'),
      details: ['Proactive courier positioning', 'Real-time demand forecasting', 'Reduced customer wait times']
    },
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: t('service4_title'),
      description: t('service4_desc'),
      details: [
        t('service4_detail1'),
        t('service4_detail2'),
        t('service4_detail3')
      ]
    }
  ];

  return (
    <div className="w-full pt-24 md:pt-32">
        <motion.section 
            className="text-center w-full max-w-7xl mx-auto px-4 md:px-8"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
        >
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-white">{t('services_title')}</h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {t('services_subtitle')}
            </p>
        </motion.section>

        <motion.section 
            className="py-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggeredContainer}
        >
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {serviceList.map((service) => (
                    <motion.div 
                        key={service.title} 
                        variants={itemVariants}
                        whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                        className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-lg flex flex-col items-start gap-4 h-full"
                    >
                        {service.icon}
                        <h2 className="text-2xl font-bold font-headline text-white">{service.title}</h2>
                        <p className="text-muted-foreground flex-grow">{service.description}</p>
                        <ul className="space-y-2 mt-4">
                            {service.details.map((detail) => (
                                <li key={detail} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-foreground">{detail}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
        </motion.section>

        <motion.section 
            className="py-16 bg-background/20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <div className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center">
                 <h2 className="text-3xl font-bold font-headline text-white">{t('services_cta_title')}</h2>
                 <p className="mt-4 text-lg text-muted-foreground">
                    {t('services_cta_subtitle')}
                 </p>
                 <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link href="/">{t('services_cta_button1')}</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/contact">{t('services_cta_button2')}</Link>
                    </Button>
                 </div>
            </div>
        </motion.section>
    </div>
  );
}
