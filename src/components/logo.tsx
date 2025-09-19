'use client';

import { cn } from '@/lib/utils';

export function Logo({ animated = false, className }: { animated?: boolean, className?: string }) {
  const pillBaseClasses = "w-4 h-8 bg-primary rounded-full absolute shadow-[0_0_15px_2px_hsl(var(--primary)/0.6)]";
  const animationClasses = "opacity-0 animate-fade-in-scale";
  
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="absolute w-full h-full rounded-full border-2 border-primary/30" />
      <div className="relative" style={{ width: '60%', height: '60%' }}>
        <div 
          className={cn(pillBaseClasses, 'left-1/2 -translate-x-1/2 top-0', animated && animationClasses)} 
          style={{ animationDelay: animated ? '0.1s' : undefined }} 
        />
        <div 
          className={cn(pillBaseClasses, 'left-1/2 -translate-x-1/2 bottom-0', animated && animationClasses)} 
          style={{ animationDelay: animated ? '0.2s' : undefined }}
        />
        <div 
          className={cn(pillBaseClasses, 'top-1/2 -translate-y-1/2 left-0 rotate-90', animated && animationClasses)} 
          style={{ animationDelay: animated ? '0.3s' : undefined }}
        />
        <div 
          className={cn(pillBaseClasses, 'top-1/2 -translate-y-1/2 right-0 rotate-90', animated && animationClasses)} 
          style={{ animationDelay: animated ? '0.4s' : undefined }}
        />
      </div>
    </div>
  );
}
