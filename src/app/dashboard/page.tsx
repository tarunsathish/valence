"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/react";

const TRIBE_NAMES: Record<string, string> = {
  "gen-z-gamers": "Gen Z Gamers",
  "biohackers": "Biohackers",
  "climate-activists": "Climate Activists",
  "corporate-hr": "Corporate HR Managers",
  "indie-creators": "Indie Creators",
};

export default function DashboardPage() {
  const { data: simulationsData } = api.simulation.listForUser.useQuery();

  const simulations = simulationsData?.simulations ?? [];
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-900 bg-black/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <h1 className="font-mono text-2xl font-bold text-white">VALENCE</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-gray-500">DEMO_MODE</span>
              <div className="h-4 w-px bg-gray-800" />
              <Link href="/">
                <Button variant="ghost" size="sm" className="font-mono text-xs text-gray-400 hover:text-purple-500">
                  EXIT
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <span className="font-mono text-purple-500">&gt;</span>
              <h2 className="font-mono text-4xl font-bold text-white">
                SYSTEM_DASHBOARD
              </h2>
            </div>
            <p className="font-mono text-lg text-gray-400">
              Run simulations or review synthetic reality tests.
            </p>
          </div>

          {/* CTA Card */}
          <Card className="mb-12 border-gray-800 bg-gradient-to-br from-purple-900/10 to-black/50 backdrop-blur-sm" hover={false}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="mb-2 font-mono text-2xl font-bold text-white">
                  INITIATE_SIMULATION
                </h3>
                <p className="font-mono text-sm text-gray-400">
                  Test product concepts against 4D synthetic agents before deployment.
                </p>
              </div>
              <Link href="/simulate/new">
                <Button
                  size="lg"
                  className="border-2 border-purple-500 bg-purple-500 font-mono text-white hover:bg-purple-400"
                >
                  NEW_SIM →
                </Button>
              </Link>
            </div>
          </Card>

          {/* Simulations List */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-mono text-xl font-bold text-white">SIMULATION_LOG</h3>
              <div className="flex items-center gap-2 font-mono text-xs text-gray-600">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>{simulations.length} RECORDS</span>
              </div>
            </div>

            {simulations.length === 0 ? (
              <Card className="text-center">
                <p className="mb-4 font-mono text-gray-400">No simulations yet</p>
                <Link href="/simulate/new">
                  <Button size="sm">Create your first simulation</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {simulations.map((sim, index) => (
                  <SimulationCard key={sim.id} simulation={sim} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 grid grid-cols-3 gap-6"
          >
            <StatCard label="TOTAL_SIMS" value="3" />
            <StatCard label="AVG_MFI" value="85.4" />
            <StatCard label="COMPUTE_SAVED" value="67%" />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

function SimulationCard({ simulation, index }: { simulation: any; index: number }) {
  const mfiScore = simulation.report?.mfiScore ?? 0;
  const tribeName = TRIBE_NAMES[simulation.targetTribe] ?? simulation.targetTribe;
  const statusColors = {
    QUEUED: "bg-gray-800 text-gray-400 border-gray-700",
    RUNNING: "bg-blue-900/30 text-blue-400 border-blue-800",
    COMPLETE: "bg-purple-900/30 text-purple-400 border-purple-800",
    FAILED: "bg-red-900/30 text-red-400 border-red-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
    >
      <Link href={`/simulate/${simulation.id}`}>
        <Card className="group h-full border-gray-800 bg-black/30 backdrop-blur-sm transition-all hover:border-purple-500/50">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-3 flex items-start justify-between">
                <h4 className="font-mono text-sm font-semibold text-white line-clamp-2">
                  {simulation.title}
                </h4>
                <span
                  className={`ml-2 rounded border px-2 py-0.5 font-mono text-xs ${
                    statusColors[simulation.status as keyof typeof statusColors]
                  }`}
                >
                  {simulation.status}
                </span>
              </div>
              <p className="mb-2 font-mono text-xs text-gray-500">
                TARGET: {tribeName}
              </p>
            </div>

            {simulation.status === "COMPLETE" && simulation.report && (
              <div className="mt-4 border-t border-gray-900 pt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-gray-600">
                      MFI_SCORE
                    </p>
                    <p className="font-mono text-3xl font-bold text-purple-500">
                      {mfiScore.toFixed(0)}
                      <span className="text-lg text-gray-600">/100</span>
                    </p>
                  </div>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-900">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                      style={{ width: `${mfiScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {simulation.status === "RUNNING" && (
              <div className="mt-4 border-t border-gray-900 pt-4">
                <div className="flex items-center gap-2 font-mono text-xs text-blue-400">
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  <span>PROCESSING...</span>
                </div>
              </div>
            )}

            <p className="mt-4 font-mono text-xs text-gray-700">
              {new Date(simulation.createdAt).toLocaleDateString()} {new Date(simulation.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-900 bg-black/30 p-4 backdrop-blur-sm">
      <p className="mb-1 font-mono text-xs text-gray-600">{label}</p>
      <p className="font-mono text-2xl font-bold text-purple-500">{value}</p>
    </div>
  );
}
