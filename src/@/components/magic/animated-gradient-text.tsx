import React, { type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';

export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<'div'> {
  speed?: number;
  colorFrom?: string;
  colorVia?: string;
  colorTo?: string;
}

// Pill wrapper with animated gradient text inside
export const AnimatedGradientText: React.FC<AnimatedGradientTextProps> = ({
  children,
  className,
  speed = 1,
  colorFrom = '#a78bfa',
  colorVia = '#c4b5fd',
  colorTo = '#7c3aed',
  ...props
}) => {
  return (
    <div
      className={cn(
        'group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm cursor-default',
        'transition-shadow duration-300 hover:shadow-[inset_0_-5px_10px_rgba(124,58,237,0.2)]',
        className
      )}
      {...props}
    >
      <span
        style={{
          '--bg-size': `${speed * 300}%`,
          '--color-from': colorFrom,
          '--color-via': colorVia,
          '--color-to': colorTo,
          backgroundSize: 'var(--bg-size) 100%',
          backgroundImage:
            'linear-gradient(90deg, var(--color-from), var(--color-via), var(--color-to), var(--color-from))',
        } as CSSProperties}
        className="animate-gradient inline bg-clip-text text-transparent"
      >
        {children}
      </span>
    </div>
  );
};
