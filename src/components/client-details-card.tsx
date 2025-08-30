'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientDetailsCardProps {
  details: {
    date: Date | undefined;
    refNo: string;
    projectName: string;
    contactPerson: string;
    contactNumber: string;
  };
  setters: {
    setDate: (value: Date | undefined) => void;
    setRefNo: (value: string) => void;
    setProjectName: (value: string) => void;
    setContactPerson: (value: string) => void;
    setContactNumber: (value: string) => void;
  };
}

export function ClientDetailsCard({ details, setters }: ClientDetailsCardProps) {
  const { date, refNo, projectName, contactPerson, contactNumber } = details;
  const { setDate, setRefNo, setProjectName, setContactPerson, setContactNumber } = setters;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Client Details</CardTitle>
        <CardDescription>
          Enter the client and project information for the quotation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="refNo">Ref. No.</Label>
          <Input
            id="refNo"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            placeholder="e.g., Q-2024-001"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., Office Renovation"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g., John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="e.g., +1 234 567 890"
          />
        </div>
      </CardContent>
    </Card>
  );
}
