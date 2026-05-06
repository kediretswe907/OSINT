import { Link } from 'react-router-dom';
import { Search, Shield, Users, Globe, Fingerprint, Database, ArrowRight, Mail, MapPin, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Sources',      href: '#sources' },
  { label: 'About',        href: '#about' },
  { label: 'Contact',      href: '#contact' },
];

const steps = [
  { number: '01', title: 'Submit Subject Details',   desc: "Enter the subject's name, course of study, institution, and year of commencement." },
  { number: '02', title: 'Cross-Reference Registries', desc: 'The system searches CIPA, BICA, BHPC, LinkedIn, and academic registries simultaneously.' },
  { number: '03', title: 'Receive Verified Report',  desc: 'Get a confidence-scored report with source attribution, drift detection, and actionable findings.' },
];

const dataSources = [
  { name: 'CIPA',          desc: 'Company & Intellectual Property Authority', icon: Database },
  { name: 'BICA',          desc: 'Botswana Institute of Chartered Accountants', icon: Shield },
  { name: 'BHPC',          desc: 'Botswana Health Professions Council',         icon: Users },
  { name: 'LinkedIn',      desc: 'Professional Network Intelligence',            icon: Globe },
  { name: 'Public Records', desc: 'Government & Court Records',                  icon: Fingerprint },
  { name: 'Academic',      desc: 'University & Institution Registries',          icon: Search },
];

const metrics = [
  { value: '6',    label: 'Registry Sources', sublabel: 'Authoritative databases' },
  { value: '24h',  label: 'Turnaround',        sublabel: 'Average report time' },
  { value: '98%',  label: 'Accuracy Rate',     sublabel: 'Verified intelligence' },
  { value: 'SOC 2', label: 'Compliant',        sublabel: 'Enterprise-grade security' },
];

const trustBadges = ['6 Data Sources', '98% Accuracy', 'SOC 2 Compliant', '24h Turnaround'];

const contactItems = [
  { icon: Mail,   label: 'Email',    value: 'akanyang@afrifable.com', href: 'mailto:akanyang@afrifable.com' },
  { icon: MapPin, label: 'Location', value: 'Gaborone, Botswana',     href: null },
  { icon: Globe,  label: 'Web',      value: 'afrifable.com',          href: 'https://afrifable.com' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen text-foreground" style={{ background: '#0c1c30' }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(12,28,48,0.92)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:shadow-[0_0_16px_rgba(99,91,255,0.5)]" style={{ background: 'linear-gradient(135deg,#5850EC,#635BFF)' }}>
              <Search className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold" style={{ fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.03em' }}>
              FABLE<span className="text-gradient">SINT</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
            ))}
          </div>
          <Button asChild size="sm" className="gap-1.5 text-[13px]" style={{ background: 'linear-gradient(135deg,#5850EC,#635BFF)', border: '1px solid rgba(99,91,255,0.5)' }}>
            <Link to="/dashboard">Open Dashboard <ArrowRight className="w-3.5 h-3.5" /></Link>
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="mesh-bg min-h-screen flex flex-col items-center justify-center text-center relative pt-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          <Badge variant="outline" className="reveal-1 mb-8 gap-2 px-3.5 py-1.5 text-xs font-medium tracking-wide rounded-full border-primary/35 bg-primary/10 text-indigo-300">
            <Sparkles className="w-3 h-3" /> OSINT Debtor Tracing — Botswana
          </Badge>
          <h1 className="reveal-2 display-hero mb-6" style={{ maxWidth: '820px' }}>
            <span className="text-gradient-white">Trace. Verify.</span><br />
            <span className="text-gradient">Know the Truth.</span>
          </h1>
          <p className="reveal-3 text-[15px] leading-relaxed mb-10 text-muted-foreground" style={{ maxWidth: '480px' }}>
            Cross-reference CIPA, BICA, BHPC, and LinkedIn records to verify employment claims
            and trace debtors across Botswana's professional registries — with AI-powered confidence scoring.
          </p>
          <div className="reveal-4 flex items-center gap-3 flex-wrap justify-center mb-14">
            <Button asChild className="gap-2" style={{ background: 'linear-gradient(135deg,#5850EC,#635BFF)', padding: '0.75rem 1.5rem', border: '1px solid rgba(99,91,255,0.5)' }}>
              <Link to="/dashboard">Run a Trace <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <a href="#how-it-works" className="btn-ghost">Learn More <ChevronDown className="w-4 h-4" /></a>
          </div>
          <div className="reveal-4 flex flex-wrap items-center justify-center gap-3">
            {trustBadges.map(t => (
              <Badge key={t} variant="outline" className="gap-1.5 text-[11px] px-3 py-1.5 rounded-full border-white/10 bg-white/[0.04] text-muted-foreground font-medium tracking-wide">
                <CheckCircle2 className="w-3 h-3 text-primary" /> {t}
              </Badge>
            ))}
          </div>
        </div>
        <a href="#how-it-works" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/50">
          <ChevronDown className="w-5 h-5" />
        </a>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: '#0a1828', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="mb-14">
            <p className="text-xs font-bold tracking-[0.14em] uppercase mb-3 text-primary">Process</p>
            <h2 className="display-lg text-white" style={{ maxWidth: '420px' }}>Three steps to verified intelligence</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <Card key={step.number} className="relative overflow-hidden py-0 gap-0 border-border hover:border-primary/30 transition-all duration-200" style={{ background: 'hsl(var(--card))' }}>
                <CardContent className="p-6">
                  <div className="absolute -top-3 -right-2 font-black leading-none select-none pointer-events-none" style={{ fontSize: '6rem', fontFamily: 'Outfit,sans-serif', color: 'rgba(99,91,255,0.08)' }}>
                    {step.number}
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest mb-4 block" style={{ color: 'rgba(99,91,255,0.8)' }}>{step.number}</span>
                  <h3 className="font-semibold text-[15px] text-white mb-2" style={{ fontFamily: 'Outfit,sans-serif' }}>{step.title}</h3>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DATA SOURCES */}
      <section id="sources" style={{ background: '#0c1c30', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="mb-14">
            <p className="text-xs font-bold tracking-[0.14em] uppercase mb-3 text-primary">Coverage</p>
            <h2 className="display-lg text-white" style={{ maxWidth: '480px' }}>Every search. Every registry.</h2>
            <p className="text-sm mt-3 max-w-md leading-relaxed text-muted-foreground">
              We cross-reference multiple authoritative sources to build a complete, verified picture.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dataSources.map(source => {
              const Icon = source.icon;
              return (
                <Card key={source.name} className="py-0 gap-0 group cursor-default border-t-2 border-t-primary border-border hover:border-primary/40 transition-all duration-200" style={{ background: 'hsl(var(--card))' }}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,91,255,0.12)', border: '1px solid rgba(99,91,255,0.22)' }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: '#818CF8' }} />
                      </div>
                      <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Outfit,sans-serif' }}>{source.name}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{source.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT + METRICS */}
      <section id="about" style={{ background: '#0a1828', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-20 items-start">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] uppercase mb-3 text-primary">About</p>
                <h2 className="display-lg text-white mb-5">Built for Southern Africa's registries.</h2>
              </div>
              <p className="text-[14px] leading-[1.8] text-muted-foreground">
                FABLESINT is an OSINT platform built by <strong className="text-white font-semibold">Afrifable</strong>. We specialise
                in debtor tracing, identity verification, and employment screening across Southern Africa's professional registries.
              </p>
              <p className="text-[14px] leading-[1.8] text-muted-foreground">
                Our system cross-references CIPA, BICA, BHPC, LinkedIn, and academic registries to build verified intelligence
                profiles — with confidence scoring, drift detection, and full source attribution.
              </p>
              <Button asChild variant="link" className="gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 p-0 h-auto">
                <Link to="/dashboard">Open Dashboard <ArrowRight className="w-3.5 h-3.5" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(m => (
                <Card key={m.label} className="metric-tile py-0 gap-0 border-border hover:border-primary/25 transition-all duration-200" style={{ background: 'hsl(var(--card))' }}>
                  <CardContent className="p-6">
                    <p className="font-black text-white mb-1" style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.25rem', lineHeight: 1, background: 'linear-gradient(135deg,#fff,#c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {m.value}
                    </p>
                    <p className="text-sm font-semibold text-white mt-2">{m.label}</p>
                    <p className="text-xs mt-0.5 text-muted-foreground">{m.sublabel}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ background: '#0c1c30', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] uppercase mb-3 text-primary">Contact</p>
                <h2 className="display-lg text-white mb-4">Get in touch.</h2>
                <p className="text-sm leading-relaxed text-muted-foreground" style={{ maxWidth: '340px' }}>
                  Interested in using FABLESINT for your organisation? Contact us for a demo.
                </p>
              </div>
              <div className="space-y-4">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: '#818CF8' }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-0.5 text-muted-foreground">{label}</p>
                      {href
                        ? <a href={href} className="text-sm text-white hover:text-indigo-300 transition-colors">{value}</a>
                        : <p className="text-sm text-white">{value}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Card className="card-glow py-0 gap-0">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-white font-bold mb-2" style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.375rem', letterSpacing: '-0.02em' }}>Request a Demo</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Send us an email with your organisation details and use case. We'll respond within 24 hours.
                    </p>
                  </div>
                  <Button asChild className="w-full gap-2 justify-center" style={{ background: 'linear-gradient(135deg,#5850EC,#635BFF)', border: '1px solid rgba(99,91,255,0.5)' }}>
                    <a href="mailto:akanyang@afrifable.com?subject=FABLESINT%20Demo%20Request&body=Hi%20FABLESINT%20team%2C%0A%0AI%20am%20interested%20in%20a%20demo.">
                      <Mail className="w-4 h-4" /> Send Demo Request
                    </a>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Or reach us directly at{' '}
                    <a href="mailto:akanyang@afrifable.com" className="text-white hover:text-indigo-300 transition-colors">akanyang@afrifable.com</a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#070f1c', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md flex items-center justify-center transition-all group-hover:shadow-[0_0_12px_rgba(99,91,255,0.4)]" style={{ background: 'linear-gradient(135deg,#5850EC,#635BFF)' }}>
                <Search className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold" style={{ fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.03em' }}>
                FABLE<span className="text-gradient">SINT</span>
              </span>
            </Link>
            <div className="flex flex-wrap justify-center gap-6 text-[12px]">
              {navLinks.map(l => (
                <a key={l.label} href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
              ))}
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            </div>
            <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} Afrifable. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
