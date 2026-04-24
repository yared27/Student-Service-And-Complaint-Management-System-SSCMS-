import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary-glow shadow-card transition-smooth",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-border bg-background hover:bg-secondary hover:text-foreground transition-smooth",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-secondary hover:text-foreground transition-smooth",
            link: "text-primary underline-offset-4 hover:underline",
            hero: "bg-gold text-accent-foreground hover:shadow-gold hover:-translate-y-0.5 shadow-card transition-smooth font-semibold",
            gold: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-card transition-smooth font-semibold",
            glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-smooth",
        },
        size: {
            default: "h-10 px-5 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-12 rounded-lg px-8 text-base",
            xl: "h-14 rounded-lg px-10 text-base",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>;
});
Button.displayName = "Button";
export { Button, buttonVariants };
