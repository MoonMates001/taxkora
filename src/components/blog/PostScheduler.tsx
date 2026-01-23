import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PostSchedulerProps {
  scheduledAt: Date | null;
  onChange: (date: Date | null) => void;
  isPublished: boolean;
}

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      options.push({ value: `${h}:${m}`, label: `${h}:${m}` });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

const PostScheduler = ({ scheduledAt, onChange, isPublished }: PostSchedulerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    scheduledAt ? new Date(scheduledAt) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    scheduledAt ? format(new Date(scheduledAt), "HH:mm") : "09:00"
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    } else {
      onChange(null);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const clearSchedule = () => {
    setSelectedDate(undefined);
    setSelectedTime("09:00");
    onChange(null);
    setIsOpen(false);
  };

  // Don't show scheduler if already published
  if (isPublished) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Schedule Publication
      </Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !scheduledAt && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {scheduledAt ? (
              format(new Date(scheduledAt), "PPP 'at' p")
            ) : (
              "Select date and time"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
            
            <div className="border-t border-border pt-4">
              <Label className="text-sm mb-2 block">Time</Label>
              <Select value={selectedTime} onValueChange={handleTimeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={clearSchedule}
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {scheduledAt && (
        <p className="text-xs text-muted-foreground">
          This post will be automatically published on{" "}
          <span className="font-medium text-foreground">
            {format(new Date(scheduledAt), "MMMM d, yyyy 'at' h:mm a")}
          </span>
        </p>
      )}
    </div>
  );
};

export default PostScheduler;
