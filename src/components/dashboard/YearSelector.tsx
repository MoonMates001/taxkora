import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
}

const YearSelector = ({ selectedYear, onYearChange, availableYears }: YearSelectorProps) => {
  const currentYear = new Date().getFullYear();
  
  // Default to last 5 years if no specific years provided
  const years = availableYears || Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedYear.toString()}
        onValueChange={(value) => onYearChange(Number(value))}
      >
        <SelectTrigger className="w-[120px] h-9 bg-background">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default YearSelector;
