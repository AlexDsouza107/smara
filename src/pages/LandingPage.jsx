import { ArrowRight, ChevronDown, Users, MapPin, Music, Globe, HeartHandshake, Stethoscope } from 'lucide-react';
import Reveal from '../components/Reveal';
import BrainField from '../components/BrainField';
import BrainOrb from '../components/BrainOrb';

const PILLARS = [
  { icon: Users, title: 'Familiar Faces', text: 'Real family photos, not stock imagery.', color: 'violet' },
  { icon: MapPin, title: 'Known Places', text: 'The streets, homes, and towns from their life.', color: 'emerald' },
  { icon: Music, title: 'Favorite Music', text: 'Songs from their own youth and culture.', color: 'pink' },
  { icon: Globe, title: 'Native Language', text: 'Interactions in the language they think in.', color: 'sky' },
];

const ICON_CHIP_CLASSES = {
  violet: 'bg-violet-50 text-violet-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  pink: 'bg-pink-50 text-pink-600',
  sky: 'bg-sky-50 text-sky-600',
};

const TRUST_BADGES = [
  { icon: Users, label: 'Families' },
  { icon: HeartHandshake, label: 'Memory care specialists' },
  { icon: Stethoscope, label: 'Clinical caregivers' },
];

// Shared focus-visible treatment for every interactive element on the page —
// the default browser outline clashes with the palette, so we hide it only
// where this ring replaces it.
const FOCUS_RING =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50';

function LandingPage({ onEnterDemo }) {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-cream-50 font-sans text-slate-900">
      <BrainField />

      <div className="relative z-10">
        {/* Nav */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-cream-50/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <span className="font-display bg-gradient-to-r from-violet-600 via-indigo-500 to-pink-500 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
              SMARA
            </span>
            <button
              onClick={onEnterDemo}
              className={`rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 ${FOCUS_RING}`}
            >
              Open SMARA
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-28">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-x-12 gap-y-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-x-20">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <Reveal>
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-violet-700">
                  Personalized Cognitive Care
                </span>
              </Reveal>

              <Reveal
                delay={80}
                as="h1"
                className="font-display text-5xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
              >
                Personalized cognitive care,
                <span className="block bg-gradient-to-r from-violet-600 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                  built around who they are.
                </span>
              </Reveal>

              <Reveal delay={160} as="p" className="mx-auto mt-7 max-w-xl text-xl leading-relaxed text-slate-600 lg:mx-0">
                A cognitive engagement platform built from the faces, places, music, and
                language a person already knows — for people living with dementia.
              </Reveal>

              <Reveal delay={240} className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <button
                  onClick={onEnterDemo}
                  className={`group inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-base font-medium text-white transition hover:bg-slate-700 ${FOCUS_RING}`}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => scrollToSection('problem')}
                  className={`inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-7 py-3.5 text-base font-medium text-slate-700 backdrop-blur-sm transition hover:bg-white ${FOCUS_RING}`}
                >
                  Watch Demo
                </button>
              </Reveal>
            </div>

            {/* Visual */}
            <Reveal delay={200} className="order-first lg:order-none">
              <BrainOrb />
            </Reveal>
          </div>

          {/* Trust bar */}
          <Reveal delay={320} className="mt-20 w-full max-w-3xl">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Designed with and for
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-0 sm:divide-x sm:divide-black/10">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 px-6 text-slate-600">
                  <Icon className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <button
            onClick={() => scrollToSection('problem')}
            aria-label="Scroll to learn more"
            className={`absolute bottom-6 inline-flex h-10 w-10 animate-bounce items-center justify-center rounded-full border border-black/10 text-slate-500 transition hover:text-slate-800 ${FOCUS_RING}`}
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </section>

        {/* The Problem */}
        <section id="problem" className="border-t border-black/5 bg-gradient-to-b from-amber-50/50 via-rose-50/20 to-transparent px-6 py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                The Problem
              </span>
            </Reveal>
            <Reveal delay={80} as="h2" className="font-display mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Generic cognitive exercises don't feel like home.
            </Reveal>
            <Reveal delay={160} as="p" className="mt-6 text-xl leading-relaxed text-slate-600">
              Most dementia-care tools use the same flashcards and puzzles for everyone.
              They ignore the one thing that actually keeps a person engaged: recognizing
              their own life — the people, places, and songs that are personally theirs.
            </Reveal>
          </div>
        </section>

        {/* Our Solution */}
        <section className="border-t border-black/5 bg-gradient-to-b from-violet-50/50 via-sky-50/25 to-pink-50/20 px-6 py-28">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                  Our Approach
                </span>
              </Reveal>
              <Reveal delay={80} as="h2" className="font-display mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                We turn their own life into the activity.
              </Reveal>
              <Reveal delay={160} as="p" className="mt-6 text-xl leading-relaxed text-slate-600">
                SMARA builds every exercise from a real memory profile — actual family
                photos, familiar places, favorite songs, and native language — so
                recognition feels personal, not clinical.
              </Reveal>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((item, i) => (
                <Reveal key={item.title} delay={i * 90}>
                  <div className="h-full rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${ICON_CHIP_CLASSES[item.color]}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={360} as="p" className="mx-auto mt-14 max-w-2xl text-center text-lg text-slate-600">
              The result: activities that spark real recognition and real conversation —
              not just correct answers.
            </Reveal>
          </div>
        </section>

        {/* Final CTA — frosted glass, not a solid saturated block */}
        <section className="border-t border-black/5 px-6 py-28">
          <Reveal className="relative mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] border border-black/5 bg-white/60 px-10 py-16 text-center shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:px-16">
            <div aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-violet-300/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-pink-300/30 blur-3xl" />
            <h2 className="font-display relative text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              See it for yourself.
            </h2>
            <p className="relative mt-4 text-xl text-slate-600">
              A live, interactive demo — no sign-up required.
            </p>
            <button
              onClick={onEnterDemo}
              className={`relative mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-semibold text-white transition hover:bg-slate-700 ${FOCUS_RING}`}
            >
              Start the Demo <ArrowRight className="h-4 w-4" />
            </button>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="border-t border-black/5 px-6 py-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="SMARA logo" className="h-12 w-12 rounded-xl object-contain" />
              <span className="font-display text-xl font-semibold text-slate-800">SMARA</span>
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-slate-600">
              Designed for cognitive engagement and caregiver support. Not a medical
              diagnostic tool and does not replace professional medical advice.
            </p>
            <p className="text-xs text-slate-600">Smart India Hackathon 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
