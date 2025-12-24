import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterOption<T extends string> {
  value: T | 'all';
  label: string;
  count?: number;
}

interface StatusFilterProps<T extends string> {
  options: FilterOption<T>[];
  value: T | 'all';
  onChange: (value: T | 'all') => void;
}

type StatusFilterValue<T extends string> = T | 'all';

function StatusFilter<T extends string>({
  options,
  value,
  onChange,
}: StatusFilterProps<T>) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            'text-sm px-3',
            value === option.value
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-1.5 text-xs opacity-70">({option.count})</span>
          )}
        </Button>
      ))}
    </div>
  );
}

export default StatusFilter;
