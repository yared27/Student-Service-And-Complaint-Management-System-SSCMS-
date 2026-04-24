import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
export const Navbar = () => {
    return (<header className="absolute top-0 left-0 right-0 z-30">
      <div className="container flex items-center justify-between py-5">
        <Logo light/>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
          <a href="#features" className="hover:text-white transition-smooth">Features</a>
          <a href="#how" className="hover:text-white transition-smooth">How it works</a>
          <a href="#beneficiaries" className="hover:text-white transition-smooth">For who</a>
          <a href="#about" className="hover:text-white transition-smooth">About</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="glass" size="sm" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </header>);
};
