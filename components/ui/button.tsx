import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        outline:
          "border border-primary/25 bg-transparent text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground",
        ghost: "text-primary hover:bg-primary/5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
        light: "bg-white/95 text-primary hover:bg-white",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded px-3 text-xs",
        lg: "h-12 px-7 text-sm tracking-wide",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (asChild) {
    const child = React.Children.only(children);
    if (!React.isValidElement(child)) {
      throw new Error("Button with asChild expects a single React element child.");
    }

    const childProps = child.props as Record<string, unknown>;
    const buttonProps = { "data-slot": "button", ...props } as Record<string, unknown>;
    const mergedProps: Record<string, unknown> = { ...buttonProps, ...childProps };

    mergedProps.className = cn(classes, childProps.className as string | undefined);
    if (props.style || childProps.style) {
      mergedProps.style = {
        ...(props.style as React.CSSProperties | undefined),
        ...(childProps.style as React.CSSProperties | undefined),
      };
    }

    for (const key of Object.keys(buttonProps)) {
      if (!/^on[A-Z]/.test(key)) continue;
      const buttonHandler = buttonProps[key];
      const childHandler = childProps[key];
      if (typeof buttonHandler === "function" && typeof childHandler === "function") {
        mergedProps[key] = (...args: unknown[]) => {
          (childHandler as (...values: unknown[]) => void)(...args);
          (buttonHandler as (...values: unknown[]) => void)(...args);
        };
      }
    }

    if (props.ref && childProps.ref) {
      const buttonRef = props.ref;
      const childRef = childProps.ref as React.Ref<HTMLElement>;
      mergedProps.ref = (node: HTMLButtonElement | null) => {
        if (typeof childRef === "function") childRef(node);
        else if (childRef) childRef.current = node;

        if (typeof buttonRef === "function") buttonRef(node);
        else if (buttonRef) (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      };
    }

    return React.cloneElement(child, mergedProps);
  }

  return (
    <button
      data-slot="button"
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button, buttonVariants };
