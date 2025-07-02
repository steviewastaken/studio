"use client";

import { Ship, Briefcase, Zap, Bot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const serviceList = [
  {
    icon: <Ship className="w-8 h-8 text-primary" />,
    title: 'On-Demand Consumer Delivery',
    description: 'For individuals who need things moved quickly and reliably. From forgotten keys to last-minute gifts, we deliver anything, anytime.',
    details: ['Instant quotes', 'Real-time tracking', '24/7 availability']
  },
  {
    icon: <Briefcase className="w-8 h-8 text-primary" />,
    title: 'Enterprise & B2B Logistics',
    description: 'A complete logistics backbone for your business. We handle last-mile delivery, supply chain movements, and multi-stop routes with precision.',
    details: ['Dedicated account management', 'Volume-based pricing', 'Proof-of-delivery']
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: 'API for Developers',
    description: 'Integrate the power of Dunlivrer\'s AI logistics network directly into your application, e-commerce site, or internal tools.',
    details: ['RESTful API with clear documentation', 'Webhook support for real-time events', 'Scalable and reliable infrastructure']
  },
  {
    icon: <Bot className="w-8 h-8 text-primary" />,
    title: 'AI-Powered Optimization',
    description: 'Leverage our core technology to optimize your own fleet and logistics operations, even without using our drivers.',
    details: ['Route optimization as a service', 'Predictive demand analysis', 'Fleet utilization reporting']
  }
];

export default function ServicesPage() {
  return (
    <div className="w-full pt-24 md:pt-32">
        <section className="text-center w-full max-w-7xl mx-auto px-4 md:px-8">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-white">Our Services</h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                We offer a comprehensive suite of logistics solutions powered by cutting-edge AI, tailored to meet the needs of individuals and businesses of all sizes.
            </p>
        </section>

        <section className="py-16">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {serviceList.map((service) => (
                    <div key={service.title} className="p-8 rounded-2xl bg-card/80 border border-white/10 shadow-lg flex flex-col items-start gap-4">
                        {service.icon}
                        <h2 className="text-2xl font-bold font-headline text-white">{service.title}</h2>
                        <p className="text-muted-foreground flex-grow">{service.description}</p>
                        <ul className="space-y-2 mt-4">
                            {service.details.map((detail) => (
                                <li key={detail} className="flex items-center gap-2 text-sm">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                    <span className="text-foreground">{detail}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>

        <section className="py-16 bg-background/20">
            <div className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center">
                 <h2 className="text-3xl font-bold font-headline text-white">Ready to transform your logistics?</h2>
                 <p className="mt-4 text-lg text-muted-foreground">
                    Whether you're sending a single package or managing a global supply chain, Dunlivrer has a solution for you.
                 </p>
                 <div className="mt-8 flex justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link href="/">Get Started</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/contact">Talk to an Expert</Link>
                    </Button>
                 </div>
            </div>
        </section>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
