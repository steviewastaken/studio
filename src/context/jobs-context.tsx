
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

// Start with some initial mock jobs for demonstration
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
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on the client to load persisted jobs.
    try {
      const item = window.localStorage.getItem('dunlivrer-jobs');
      if (item) {
        setJobs(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load jobs from localStorage", error);
      // If loading fails, it will just use the initialJobs state
    } finally {
        setLoading(false);
    }
  }, []); // Empty dependency array ensures it runs only once on mount.

  useEffect(() => {
    // This effect runs whenever 'jobs' state changes, saving it to localStorage.
    // The !loading check prevents overwriting stored data with initialJobs on first render.
    if (!loading) {
        try {
            window.localStorage.setItem('dunlivrer-jobs', JSON.stringify(jobs));
        } catch (error) {
            console.error("Failed to save jobs to localStorage", error);
        }
    }
  }, [jobs, loading]);


  const addJob = (job: Job) => {
    // Add new job to the top of the list
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
