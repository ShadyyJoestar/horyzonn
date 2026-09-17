import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Target,
  Layers,
  Compass,
  CheckCircle2,
} from "lucide-react";

const journeySteps = [
  {
    title: "Your Data",
    description: "Academic scores, skills, projects, and interests",
    icon: Layers,
  },
  {
    title: "Your Profile",
    description: "Structured competency profile with evidence",
    icon: BarChart3,
  },
  {
    title: "Classification",
    description: "Clear readiness level based on real requirements",
    icon: Target,
  },
  {
    title: "Gap Analysis",
    description: "See exactly what you already have and what’s missing",
    icon: CheckCircle2,
  },
  {
    title: "Next Horizon",
    description: "Actionable steps toward your target path",
    icon: Compass,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
              H
            </div>
            <span className="text-lg font-semibold tracking-tight">Horyzon</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" render={<Link href="/login" prefetch={false} />} nativeButton={false}>
              Sign in
            </Button>
            <Button render={<Link href="/register" prefetch={false} />} nativeButton={false}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Academic & Career Decision Intelligence
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl leading-[1.1]">
              Turn complex data into{" "}
              <span className="text-foreground">actionable classifications</span>{" "}
              and decisions.
            </h1>

            <p className="mt-6 text-lg text-muted-foreground md:text-xl leading-relaxed max-w-2xl mx-auto">
              Understand where you are, identify the gaps, and explore where you
              can go next.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-12 px-8 text-base"
                render={<Link href="/register" prefetch={false} />}
                nativeButton={false}
              >
                Build My Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                render={<Link href="/dashboard/careers" prefetch={false} />}
                nativeButton={false}
              >
                Explore Careers
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Visual */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              From scattered data to clear direction
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Horyzon turns your academic record, skills, and experience into
              structured intelligence you can act on.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {journeySteps.map((step, index) => (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center p-5 rounded-xl border border-border/60 bg-background"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">
                  Step {index + 1}
                </span>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Value */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Classification is not prediction.
            </h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              Horyzon doesn&apos;t tell you what you will become. It shows you
              where your current profile stands against real competency
              requirements — and what you can do next.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Evidence-based readiness score",
                "Clear competency gaps with priority",
                "Actionable development plan",
                "Reassessment as you grow",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-8 md:p-10">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Example Classification
                </p>
                <p className="text-2xl font-semibold">Ready With Gaps</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Full-Stack Developer · Score 74/100
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Programming</span>
                  <span className="text-muted-foreground">Meets</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Backend Development</span>
                  <span className="text-muted-foreground">Gap</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>System Design</span>
                  <span className="text-muted-foreground">Major Gap</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Collaboration</span>
                  <span className="text-muted-foreground">Exceeds</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                Based on the competency requirements and the information you
                provided — not a guarantee of future success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Where are you now, and what&apos;s your next horizon?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Start building your profile and get your first classification in
            minutes.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="h-12 px-8 text-base"
              render={<Link href="/register" prefetch={false} />}
              nativeButton={false}
            >
              Build My Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background text-xs font-bold">
              H
            </div>
            <span>Horyzon</span>
          </div>
          <p>Decision support, not destiny.</p>
        </div>
      </footer>
    </div>
  );
}