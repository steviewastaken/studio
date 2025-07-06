
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

type JobsContextType = {
  jobs: Job[];
  addJob: (job: Job) => void;
  removeJob: (id: string) => void;
  loading: boolean;
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
];


const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('dunlivrer-jobs');
      setJobs(item ? JSON.parse(item) : initialJobs);
    } catch (error) {
      console.error("Failed to load jobs from localStorage, using initial data.", error);
      setJobs(initialJobs);
    } finally {
        setLoading(false);
    }
  }, []);

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
