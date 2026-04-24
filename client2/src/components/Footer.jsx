import { Logo } from "./Logo";
export const Footer = () => (<footer id="about" className="bg-primary text-primary-foreground">
    <div className="container py-16 grid md:grid-cols-4 gap-10">
      <div className="md:col-span-2 space-y-4">
        <Logo light/>
        <p className="text-sm text-primary-foreground/70 max-w-sm leading-relaxed">
          The Student Service & Complaint Management System — a unified digital
          channel for raising, tracking and resolving student concerns across
          Arba Minch University.
        </p>
      </div>
      <div>
        <h4 className="font-display text-sm uppercase tracking-widest text-accent mb-4">Project</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/70">
          <li>Faculty of Computing</li>
          <li>Software Engineering</li>
          <li>Senior Project · 2026</li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-sm uppercase tracking-widest text-accent mb-4">Team</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/70">
          <li>Ana Mohammed</li>
          <li>Yared Alemayehu</li>
          <li>Samson Debebe</li>
          <li>Mulualem Banteyrga</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/60">
        <p>© 2026 Arba Minch University · All rights reserved.</p>
        <p>Advisor: Asst. Prof. Alemseged Kassahun</p>
      </div>
    </div>
  </footer>);
