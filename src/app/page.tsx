"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4">
      {/* Cyber grid background */}
      <div className="cyber-grid pointer-events-none absolute inset-0 opacity-30" />

      {/* Animated scanlines */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-5xl text-center"
      >
        {/* Logo */}
        <motion.div
          className="mb-6 flex items-center justify-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" />
          <h1 className="font-mono text-7xl font-bold tracking-tighter text-white md:text-9xl glitch">
            VALENCE
          </h1>
          <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" />
        </motion.div>

        {/* Subtitle with typing effect */}
        <motion.div
          className="mb-4 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <span className="text-purple-500 font-mono">&gt;</span>
          <p className="font-mono text-xl text-purple-400 md:text-3xl">
            SYNTHETIC_REALITY.init()
          </p>
        </motion.div>

        {/* Main tagline */}
        <motion.p
          className="mb-12 font-mono text-2xl text-gray-400 md:text-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Preview the future before you ship.
        </motion.p>

        {/* Description */}
        <motion.p
          className="mx-auto mb-12 max-w-3xl border-l-2 border-purple-500 pl-4 text-left font-mono text-sm leading-relaxed text-gray-300 md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <span className="text-purple-500">// SYSTEM_LOG:</span> Decision-simulation platform
          generating Digital Twins of markets + organizations. Test ideas against synthetic
          reality before committing resources. No more launch-and-pray. Welcome to the truth layer.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="group relative w-full overflow-hidden border-2 border-purple-500 bg-purple-500 font-mono text-white hover:bg-purple-400 sm:w-auto"
            >
              <span className="relative z-10">ENTER_SYSTEM →</span>
              <div className="absolute inset-0 -translate-x-full bg-purple-400 transition-transform group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="secondary"
              className="w-full border-2 border-purple-500 bg-transparent font-mono text-purple-500 hover:bg-purple-500/10 sm:w-auto"
            >
              VIEW_SIMULATIONS
            </Button>
          </Link>
        </motion.div>

        {/* Tech specs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-24 grid gap-6 md:grid-cols-3"
        >
          <TechCard
            icon="◉"
            title="4D_AGENTS"
            description="Skeleton × Soul × Shadow × Memory = synthetic humans with emotional states"
            delay={0}
          />
          <TechCard
            icon="◈"
            title="BAYESIAN_CORE"
            description="Adaptive sampling reduces compute cost by 70% while maximizing accuracy"
            delay={0.1}
          />
          <TechCard
            icon="◬"
            title="TRUTH_LAYER"
            description="Unbiased synthetic reality replacing focus groups and market research"
            delay={0.2}
          />
        </motion.div>

        {/* System status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-16 flex items-center justify-center gap-6 font-mono text-xs text-gray-600"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span>SYSTEM_ONLINE</span>
          </div>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span>LLM_READY</span>
          </div>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span>DB_CONNECTED</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 border-t border-gray-900 bg-black/50 py-4 text-center font-mono text-xs text-gray-600 backdrop-blur-sm"
      >
        <p>[ VALENCE v1.0.0 ] — Make simulation the standard before every decision.</p>
      </motion.footer>
    </div>
  );
}

function TechCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 + delay, duration: 0.6 }}
      whileHover={{ y: -5, borderColor: "rgb(168 85 247)" }}
      className="group relative overflow-hidden rounded-lg border border-gray-800 bg-black/50 p-6 backdrop-blur-sm transition-all"
    >
      {/* Corner accent */}
      <div className="absolute right-0 top-0 h-px w-12 bg-gradient-to-r from-transparent to-purple-500" />
      <div className="absolute right-0 top-0 h-12 w-px bg-gradient-to-b from-purple-500 to-transparent" />

      <div className="mb-3 font-mono text-3xl text-purple-500">{icon}</div>
      <h3 className="mb-2 font-mono text-sm font-bold text-white">{title}</h3>
      <p className="font-mono text-xs leading-relaxed text-gray-400">{description}</p>

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
      </div>
    </motion.div>
  );
}
