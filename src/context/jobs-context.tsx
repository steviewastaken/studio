
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

console.log(">>> [jobs-context.tsx] JobsProvider module loaded.");

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
];


type JobsContextType = {
    jobs: Job[];
    addJob: (job: Job) => void;
    addJobs: (jobs: Job[]) => void;
    removeJob: (id: string) => void;
    loading: boolean;
};

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  console.log(">>> [jobs-context.tsx] JobsProvider component rendering...");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // This effect runs once on component mount on the client side.
  // It's responsible for hydrating the state from localStorage.
  useEffect(() => {
    console.log(">>> [jobs-context.tsx] Hydration useEffect running...");
    setLoading(true);
    try {
      const item = window.localStorage.getItem('dunlivrer-jobs');
      setJobs(item ? JSON.parse(item) : initialJobs);
      console.log(">>> [jobs-context.tsx] Jobs hydrated from localStorage.");
    } catch (error) {
      console.error(">>> [jobs-context.tsx] Failed to load jobs from localStorage, using initial data.", error);
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
            console.log(">>> [jobs-context.tsx] Persisting jobs to localStorage...");
            window.localStorage.setItem('dunlivrer-jobs', JSON.stringify(jobs));
        } catch (error) {
            console.error(">>> [jobs-context.tsx] Failed to save jobs to localStorage", error);
        }
    }
  }, [jobs, loading]);

  // Effect to listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'dunlivrer-jobs' && event.newValue) {
        console.log(">>> [jobs-context.tsx] Storage change detected from another tab.");
        try {
          setJobs(JSON.parse(event.newValue));
        } catch (error) {
          console.error(">>> [jobs-context.tsx] Failed to parse jobs from storage event", error);
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

  const addJobs = (newJobs: Job[]) => {
    setJobs(prevJobs => [...newJobs, ...prevJobs]);
  };

  const removeJob = (id: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
  };

  return (
    <JobsContext.Provider value={{ jobs, addJob, addJobs, removeJob, loading }}>
      {children}
    </Jobs.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}
