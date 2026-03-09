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
      shimmerColor = 'rgba(255,255,255,0.55)',
      shimmerSize = '0.04em',
      shimmerDuration = '3.5s',
      borderRadius = '4px',
      background = '#5b21b6',       // solid violet — no gradient
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
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden',
          '[border-radius:var(--radius)] border border-violet-500/35 px-6 py-3',
          'whitespace-nowrap text-white text-sm font-semibold tracking-wide',
          '[background:var(--bg)]',
          // depth: inset highlight on top edge
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_24px_rgba(91,33,182,0.35)]',
          'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_6px_28px_rgba(91,33,182,0.55)]',
          'transform-gpu transition-all duration-300 ease-in-out active:translate-y-px active:shadow-none',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer spark (blurred conic gradient) */}
        <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible">
          <div className="animate-shimmer-slide absolute inset-0 aspect-[1] h-full rounded-none">
            <div className="animate-spin-around absolute -inset-full [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>

        {/* Mask the spark outside the button bounds */}
        <div className="absolute [inset:var(--cut)] -z-20 rounded-[inherit] [background:var(--bg)]" />
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
