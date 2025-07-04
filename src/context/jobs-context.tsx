"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Job = {
  id: string;
  pickup: string;
  dropoff: string;
  distance: string;
  payout: string;
  time: string;
};

type JobsContextType = {
  jobs: Job[];
  addJob: (job: Job) => void;
  removeJob: (id: string) => void;
};

// Start with some initial mock jobs for demonstration
const initialJobs: Job[] = [
    {
    id: 'job-init-1',
    pickup: 'Louvre Museum, 75001 Paris',
    dropoff: 'Eiffel Tower, Champ de Mars, 75007 Paris',
    distance: '5.2 km',
    payout: '12.50',
    time: '25 min',
  },
  {
    id: 'job-init-2',
    pickup: 'Gare du Nord, 75010 Paris',
    dropoff: 'La Défense, 92800 Puteaux',
    distance: '10.8 km',
    payout: '18.75',
    time: '45 min',
  },
];


const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const addJob = (job: Job) => {
    // Add new job to the top of the list
    setJobs(prevJobs => [job, ...prevJobs]);
  };

  const removeJob = (id: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
  };

  return (
    <JobsContext.Provider value={{ jobs, addJob, removeJob }}>
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
