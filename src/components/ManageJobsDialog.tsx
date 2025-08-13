
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Plus } from 'lucide-react';

interface ManageJobsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  jobTitles: string[];
  setJobTitles: (titles: string[]) => void;
}

export function ManageJobsDialog({ isOpen, setIsOpen, jobTitles, setJobTitles }: ManageJobsDialogProps) {
  const [newJobTitle, setNewJobTitle] = useState('');

  const handleAddJob = () => {
    if (newJobTitle.trim() && !jobTitles.includes(newJobTitle.trim())) {
      setJobTitles([...jobTitles, newJobTitle.trim()]);
      setNewJobTitle('');
    }
  };

  const handleDeleteJob = (titleToDelete: string) => {
    if (jobTitles.length <= 1) {
      alert('You must have at least one job title.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${titleToDelete}"? This cannot be undone.`)) {
        setJobTitles(jobTitles.filter(title => title !== titleToDelete));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white rounded-2xl p-6 mx-4 max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-purple-dark mb-3">Manage Job Titles</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {jobTitles.map(job => (
            <div key={job} className="flex justify-between items-center p-2 bg-pastel-purple rounded-lg">
              <span className="text-purple-dark">{job}</span>
              <Button onClick={() => handleDeleteJob(job)} variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
            <Input 
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                placeholder="New job title"
                className="flex-1 p-2 border-2 border-purple-light rounded-lg focus:border-purple-medium outline-none"
            />
            <Button onClick={handleAddJob} size="icon" className="bg-purple-medium hover:bg-purple-dark text-white rounded-lg">
                <Plus className="h-5 w-5" />
            </Button>
        </div>
        
        <DialogFooter className="mt-4">
          <Button onClick={() => setIsOpen(false)} variant="outline" className="w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
