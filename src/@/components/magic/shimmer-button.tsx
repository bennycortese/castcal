import React, { type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<'button'> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#ffffff',
      shimmerSize = '0.05em',
      shimmerDuration = '3s',
      borderRadius = '12px',
      background = 'linear-gradient(135deg, #7c3aed, #9333ea)',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={{
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        } as CSSProperties}
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-white/15 px-6 py-3 whitespace-nowrap text-white font-semibold [background:var(--bg)]',
          'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
          'shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Spark container */}
        <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible">
          <div className="animate-shimmer-slide absolute inset-0 aspect-[1] h-full rounded-none">
            {/* Conic gradient spark */}
            <div className="animate-spin-around absolute -inset-full [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>

        {/* Inner highlight */}
        <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_-8px_10px_rgba(255,255,255,0.08)] group-hover:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.15)] transition-shadow duration-300" />

        {/* Backdrop to mask the spark outside the button */}
        <div className="absolute [inset:var(--cut)] -z-20 rounded-[inherit] [background:var(--bg)]" />
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
