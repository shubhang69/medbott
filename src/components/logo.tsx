import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center font-bold text-foreground", className)}>
      <span className="text-primary">@</span>
      <span>MT</span>
    </div>
  );
}
