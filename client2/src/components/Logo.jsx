import { Link } from "react-router-dom";
export const Logo = ({ light = false }) => (<Link to="/" className="flex items-center gap-2.5 group">
    <div className="relative w-9 h-9 rounded-lg bg-gold flex items-center justify-center shadow-card group-hover:shadow-gold transition-smooth">
      <span className="font-display font-bold text-accent-foreground text-lg">A</span>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-background"/>
    </div>
    <div className="flex flex-col leading-none">
      <span className={`font-display font-bold text-base tracking-tight ${light ? "text-white" : "text-foreground"}`}>
        SSCMS
      </span>
      <span className={`text-[10px] uppercase tracking-[0.18em] ${light ? "text-white/70" : "text-muted-foreground"}`}>
        Arba Minch University
      </span>
    </div>
  </Link>);
