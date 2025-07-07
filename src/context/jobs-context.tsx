
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Job = {
  id: string;
  pickup: string;
  dropoff: string;
  distance: string;
  payout: string;
  time: string;
  suggestion: string;
  suggestionType: 'accept' | 'neutral';
  safetyAlert?: {
    type: 'warning' | 'critical';
    message: string;
  };
};

const initialJobs: Job[] = [
    {
        id: 'job-init-1',
        pickup: 'Louvre Museum, 75001 Paris',
        dropoff: 'Place de la République, 75003 Paris',
        distance: '2.5 km',
        payout: '8.50',
        time: '15 min',
        suggestion: "Standard payout for this route. Proceed with caution.",
        suggestionType: 'neutral',
        safetyAlert: {
            type: 'critical',
            message: '🛑 Traffic disruption detected near République due to an event. An alternate route will be automatically suggested upon acceptance.'
        }
    },
    {
        id: 'job-init-2',
        pickup: 'Gare du Nord, 75010 Paris',
        dropoff: 'La Défense, 92800 Puteaux',
        distance: '10.8 km',
        payout: '18.75',
        time: '45 min',
        suggestion: "High payout for a cross-city trip. No alerts on this route.",
        suggestionType: 'accept'
    },
    {
        id: 'job-init-3',
        pickup: 'Arc de Triomphe, 75008 Paris',
        dropoff: 'Place des Vosges, 75004 Paris',
        distance: '6.2 km',
        payout: '11.20',
        time: '25 min',
        suggestion: 'Good payout for a popular cross-town route.',
        suggestionType: 'accept',
    },
    {
        id: 'job-init-4',
        pickup: 'Opéra Garnier, 75009 Paris',
        dropoff: 'Place du Tertre, 75018 Paris',
        distance: '2.1 km',
        payout: '7.00',
        time: '12 min',
        suggestion: 'Short and quick trip, good for filling a gap.',
        suggestionType: 'neutral',
    },
    {
        id: 'job-init-5',
        pickup: 'Eiffel Tower, 75007 Paris',
        dropoff: 'Charles de Gaulle Airport, 95700 Roissy-en-France',
        distance: '35.5 km',
        payout: '45.00',
        time: '60 min',
        suggestion: 'Excellent payout for a long distance airport run. Recommended.',
        suggestionType: 'accept',
    },
    {
        id: 'job-init-6',
        pickup: 'Le Marais, 75004 Paris',
        dropoff: 'Saint-Germain-des-Prés, 75006 Paris',
        distance: '1.8 km',
        payout: '6.50',
        time: '10 min',
        suggestion: 'Very short trip, good for a quick completion bonus.',
        suggestionType: 'neutral',
    },
    {
        id: 'job-init-7',
        pickup: 'Panthéon, 75005 Paris',
        dropoff: 'Musée d\'Orsay, 75007 Paris',
        distance: '2.2 km',
        payout: '9.00',
        time: '18 min',
        suggestion: 'Decent payout for a short tourist-heavy route.',
        suggestionType: 'neutral',
        safetyAlert: {
            type: 'warning',
            message: '⚠️ High pedestrian traffic expected around Musée d\'Orsay. Exercise caution.'
        }
    }
];


type JobsContextType = {
    jobs: Job[];
    addJob: (job: Job) => void;
    removeJob: (id: string) => void;
    loading: boolean;
};

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // This effect runs once on component mount on the client side.
  // It's responsible for hydrating the state from localStorage.
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('dunlivrer-jobs');
      // If there's an item in storage, use it. Otherwise, initialize with default jobs.
      setJobs(item ? JSON.parse(item) : initialJobs);
    } catch (error) {
      // If parsing fails, fall back to initial data.
      console.error("Failed to load jobs from localStorage, using initial data.", error);
      setJobs(initialJobs);
    } finally {
        setLoading(false);
    }
  }, []);

  // This effect runs whenever the `jobs` state changes (and not during initial load).
  // It's responsible for persisting the state back to localStorage.
  useEffect(() => {
    if (!loading) {
        try {
            window.localStorage.setItem('dunlivrer-jobs', JSON.stringify(jobs));
        } catch (error) {
            console.error("Failed to save jobs to localStorage", error);
        }
    }
  }, [jobs, loading]);

  // Effect to listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'dunlivrer-jobs' && event.newValue) {
        try {
          setJobs(JSON.parse(event.newValue));
        } catch (error) {
          console.error("Failed to parse jobs from storage event", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const addJob = (job: Job) => {
    setJobs(prevJobs => [job, ...prevJobs]);
  };

  const removeJob = (id: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
  };

  return (
    <JobsContext.Provider value={{ jobs, addJob, removeJob, loading }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}
