import { Link } from "react-router-dom";
import { ArrowRight, MessageSquareWarning, ClipboardList, ShieldCheck, Clock, BarChart3, Users, GraduationCap, Building2, UserCog, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-campus.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
const features = [
    { icon: MessageSquareWarning, title: "File a complaint", desc: "Submit academic, dormitory, cafeteria or administrative complaints with attachments — anytime, from anywhere." },
    { icon: ClipboardList, title: "Request a service", desc: "Apply for ID cards, transcripts, dorm changes, clearance and more through one streamlined intake." },
    { icon: Clock, title: "Track in real-time", desc: "Watch your case move from received → in review → resolved with transparent status timelines." },
    { icon: ShieldCheck, title: "Anonymous & secure", desc: "Role-based access, encrypted submissions and optional anonymous filing protect every voice." },
    { icon: BarChart3, title: "Analytics for staff", desc: "Department heads see trends, response times and bottlenecks on a single live dashboard." },
    { icon: Users, title: "Smart routing", desc: "Cases auto-assign to the right office — Registrar, Proctor, Dean, ICT — no more lost paperwork." },
];
const audiences = [
    { icon: GraduationCap, label: "Students", desc: "File concerns, request services, follow up — without queuing at offices." },
    { icon: UserCog, label: "Staff & Officers", desc: "Manage caseloads, respond to requests, and close the loop with students." },
    { icon: Building2, label: "Administrators", desc: "Oversee university-wide service delivery with reports and audit trails." },
];
const steps = [
    { n: "01", title: "Sign in with your AMU ID", desc: "Students, staff and admins use a single secure portal." },
    { n: "02", title: "Submit a complaint or request", desc: "Choose a category, describe the issue, attach evidence." },
    { n: "03", title: "Get routed to the right office", desc: "The system intelligently dispatches your case." },
    { n: "04", title: "Receive a verified resolution", desc: "Track progress and confirm closure — all in one place." },
];
const Index = () => {
    return (<div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden bg-primary">
        <Navbar />
        <img src={heroImg} alt="Arba Minch University students walking on campus at golden hour" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover opacity-70"/>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/20"/>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"/>

        <div className="container relative z-10 pb-24 pt-40">
          <div className="max-w-3xl text-white animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5 text-accent"/>
              Arba Minch University · 2026
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] text-balance mb-6">
              Every student voice,<br />
              <span className="text-accent italic font-medium">heard and resolved.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed mb-10">
              SSCMS replaces lost paperwork and long queues with a single digital
              channel for filing complaints, requesting services and tracking
              outcomes across the university.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/login">
                  Sign in to continue <ArrowRight className="w-5 h-5"/>
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/student">View demo dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS strip */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {[
            { k: "12k+", v: "Students served" },
            { k: "48 hrs", v: "Avg. resolution" },
            { k: "32", v: "Departments connected" },
            { k: "99.4%", v: "Cases tracked end-to-end" },
        ].map((s) => (<div key={s.v} className="bg-card p-8 text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-primary">{s.k}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{s.v}</div>
            </div>))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28 bg-soft">
        <div className="container">
          <div className="max-w-2xl mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Features</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 leading-tight text-balance">
              A complete platform for student service delivery.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden shadow-card">
            {features.map((f) => (<div key={f.title} className="bg-card p-8 group hover:bg-accent-soft/40 transition-smooth">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-gold group-hover:text-accent-foreground transition-smooth">
                  <f.icon className="w-5 h-5 text-primary group-hover:text-accent-foreground"/>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-28">
        <div className="container grid lg:grid-cols-2 gap-16 items-start">
          <div className="lg:sticky lg:top-24">
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">How it works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 leading-tight text-balance">
              From submission to resolution — in four steps.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              SSCMS replaces fragmented offline processes with a guided digital
              workflow that keeps students, staff and administrators on the
              same page.
            </p>
          </div>
          <div className="space-y-2">
            {steps.map((s) => (<div key={s.n} className="border-l-2 border-accent pl-6 py-5 hover:bg-accent-soft/30 transition-smooth rounded-r-lg">
                <div className="font-display text-sm font-bold text-accent">{s.n}</div>
                <h3 className="font-display text-2xl font-semibold mt-1">{s.title}</h3>
                <p className="text-muted-foreground mt-2">{s.desc}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* BENEFICIARIES */}
      <section id="beneficiaries" className="py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}/>
        <div className="container relative">
          <div className="max-w-2xl mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Built for everyone on campus</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 leading-tight text-balance">
              One system. Three perspectives.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((a) => (<div key={a.label} className="border border-white/10 rounded-2xl p-8 backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:-translate-y-1 transition-smooth">
                <a.icon className="w-8 h-8 text-accent mb-5"/>
                <h3 className="font-display text-2xl font-semibold mb-2">{a.label}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{a.desc}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="container">
          <div className="rounded-3xl bg-gold p-12 md:p-20 text-center shadow-elegant relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)", backgroundSize: "24px 24px" }}/>
            <div className="relative max-w-2xl mx-auto">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-accent-foreground text-balance">
                Stop queuing. Start resolving.
              </h2>
              <p className="mt-5 text-accent-foreground/80 text-lg">
                Join the AMU community already using SSCMS to make their voice
                count.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button variant="default" size="xl" asChild>
                  <Link to="/login">Sign in now <ArrowRight className="w-5 h-5"/></Link>
                </Button>
                <Button variant="outline" size="xl" asChild className="bg-white/40 border-accent-foreground/20">
                    <Link to="/student">View demo dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>);
};
export default Index;
