// src/components/ui/Button.tsx
'use client';

import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import Link, { type LinkProps } from 'next/link';

import { cva, type VariantProps } from 'class-variance-authority';

//
// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────
//

type CoreVariant =
  | 'solid'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'subtle'
  | 'destructive'
  | 'success'
  | 'link';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

type CommonProps = {
  variant?: CoreVariant;
  size?: Size;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  icon?: boolean;
  className?: string;
  justify?: 'start' | 'between' | 'center';
  children?: ReactNode;
};

//
// Button <button> branch props
//
type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
    href?: undefined;
  };

//
// Button <Link> branch props
//
type LinkExtras = {
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type ButtonAsLink = CommonProps &
  Pick<LinkProps, 'href' | 'prefetch' | 'replace' | 'scroll' | 'shallow' | 'locale'> &
  LinkExtras;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

//
// INTERNAL HELPERS
//

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function spinnerFor(size: Size) {
  const s = size === 'xs' ? 'h-3.5 w-3.5' : size === 'lg' || size === 'xl' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <span
      className={`${s} rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin`}
      aria-hidden
    />
  );
}

function baseClasses(size: Size, fullWidth?: boolean, icon?: boolean) {
  const sizes = {
    xs: 'h-8 px-3 text-[11px]',
    sm: 'h-9 px-4 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-11 px-6 text-base',
    xl: 'h-12 px-8 text-base',
    icon: 'h-10 w-10 p-0',
  } as const;

  const iconSizes = {
    xs: 'h-8 w-8 p-0',
    sm: 'h-9 w-9 p-0',
    md: 'h-10 w-10 p-0',
    lg: 'h-11 w-11 p-0',
    xl: 'h-12 w-12 p-0',
    icon: 'h-10 w-10 p-0',
  } as const;

  return cx(
    'flex items-center gap-2 rounded-full font-semibold transition',
    'focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none',
    'motion-safe:active:scale-[0.99]',
    'flex-nowrap min-w-0 whitespace-nowrap',
    icon ? iconSizes[size] : sizes[size],
    fullWidth && 'w-full',
  );
}

function variantClasses(variant: NonNullable<ButtonProps['variant']>) {
  switch (variant) {
    case 'solid':
      return 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-neutral-300 disabled:text-neutral-500';
    case 'secondary':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:bg-neutral-200 disabled:text-neutral-500';
    case 'outline':
      return 'border border-border text-foreground hover:bg-muted/60 disabled:text-neutral-500 disabled:border-neutral-300 disabled:bg-transparent';
    case 'ghost':
      return 'text-foreground hover:bg-foreground/10 disabled:text-neutral-400 disabled:bg-transparent';
    case 'subtle':
      return 'bg-muted text-foreground hover:bg-muted/80 disabled:text-neutral-500 disabled:bg-muted';
    case 'destructive':
      return 'bg-error text-white hover:bg-error/90 disabled:bg-neutral-300 disabled:text-neutral-500';
    case 'success':
      return 'bg-success text-white hover:bg-success/90 disabled:bg-neutral-300 disabled:text-neutral-500';
    case 'link':
      return 'bg-transparent text-primary underline-offset-4 hover:underline focus-visible:ring-0 h-auto p-0 rounded-none disabled:text-neutral-400 disabled:no-underline';
    default:
      return '';
  }
}

//
// ───────────────────────────────────────────────────────────────
// COMPONENT
// ───────────────────────────────────────────────────────────────
//

export function Button(props: ButtonProps) {
  const {
    variant = 'solid',
    size = 'md',
    fullWidth,
    isLoading,
    loadingLabel = 'Loading',
    leftIcon,
    rightIcon,
    icon = false,
    className,
    justify = 'start',
    children,
  } = props;

  const classes = cx(
    baseClasses(size, fullWidth, icon),
    variantClasses(variant),
    justify === 'between' && 'justify-between w-full',
    justify === 'center' && 'justify-center',
    className,
  );

  const content = (
    <>
      {isLoading && spinnerFor(size)}
      {!isLoading && !icon && leftIcon && (
        <span className="shrink-0 leading-none [&>svg]:block [&>svg]:align-middle">{leftIcon}</span>
      )}
      {!icon && (
        <span
          className={cx(
            'inline-flex items-center gap-2 leading-none',
            justify === 'between' && 'min-w-0 flex-1',
            isLoading && 'opacity-0',
          )}
        >
          {children}
        </span>
      )}
      {!isLoading && !icon && rightIcon && (
        <span className="shrink-0 leading-none [&>svg]:block [&>svg]:align-middle">
          {rightIcon}
        </span>
      )}
      {isLoading && <span className="sr-only">{loadingLabel}</span>}
    </>
  );

  //
  // LINK BRANCH
  //
  if ('href' in props && props.href) {
    const { href, prefetch, replace, scroll, shallow, locale, target, rel, onClick, ...linkRest } =
      props as ButtonAsLink;

    const filteredLinkProps = { ...linkRest } as Record<string, unknown>;
    delete filteredLinkProps.icon;
    delete filteredLinkProps.leftIcon;
    delete filteredLinkProps.rightIcon;
    delete filteredLinkProps.fullWidth;
    delete filteredLinkProps.className;
    delete filteredLinkProps.loadingLabel;
    delete filteredLinkProps.justify;
    delete filteredLinkProps.variant;
    delete filteredLinkProps.size;
    delete filteredLinkProps.children;
    delete filteredLinkProps.isLoading;

    const handleClick: MouseEventHandler<HTMLAnchorElement> = e => {
      if (isLoading) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick?.(e);
    };

    return (
      <Link
        href={href}
        prefetch={prefetch ?? null}
        replace={replace ?? false}
        scroll={scroll ?? true}
        shallow={shallow ?? false}
        {...(locale !== undefined ? { locale } : {})}
        target={target}
        rel={rel}
        {...filteredLinkProps}
        onClick={handleClick}
        className={cx(classes, isLoading && 'pointer-events-none')}
        aria-busy={isLoading || undefined}
        aria-disabled={isLoading ? true : undefined}
        data-loading={isLoading || undefined}
      >
        {content}
      </Link>
    );
  }

  //
  // BUTTON BRANCH
  //
  const { type, ...buttonRest } = props as ButtonAsButton;
  const filteredButtonProps = { ...buttonRest } as Record<string, unknown>;
  delete filteredButtonProps.icon;
  delete filteredButtonProps.leftIcon;
  delete filteredButtonProps.rightIcon;
  delete filteredButtonProps.fullWidth;
  delete filteredButtonProps.className;
  delete filteredButtonProps.loadingLabel;
  delete filteredButtonProps.justify;
  delete filteredButtonProps.variant;
  delete filteredButtonProps.size;
  delete filteredButtonProps.children;
  delete filteredButtonProps.isLoading;

  return (
    <button
      {...filteredButtonProps}
      type={type ?? 'button'}
      className={classes}
      disabled={isLoading || Boolean(filteredButtonProps.disabled)}
      aria-busy={isLoading || undefined}
      data-loading={isLoading || undefined}
    >
      {content}
    </button>
  );
}

//
// BUTTON VARIANTS (unchanged)
//

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-border text-foreground hover:bg-muted/60',
        ghost: 'text-foreground hover:bg-foreground/10',
        subtle: 'bg-muted text-foreground hover:bg-muted/80',
        destructive: 'bg-error text-white hover:bg-error/90',
        success: 'bg-success text-white hover:bg-success/90',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        icon: 'h-9 w-9 p-0',
        default: 'h-9 px-4 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
