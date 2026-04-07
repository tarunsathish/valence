"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function SimulationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: simulation, isLoading, error } = api.simulation.get.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Card className="w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-800 border-t-purple-500" />
          </div>
          <h2 className="mb-2 font-mono text-2xl font-bold text-white">LOADING...</h2>
          <p className="font-mono text-sm text-gray-400">
            Fetching simulation data
          </p>
        </Card>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Card className="text-center">
          <h2 className="mb-4 font-mono text-2xl font-bold text-white">SIMULATION_NOT_FOUND</h2>
          <p className="mb-4 font-mono text-sm text-gray-400">
            {error?.message ?? "The simulation you're looking for doesn't exist."}
          </p>
          <Link href="/dashboard">
            <Button>← RETURN_TO_DASHBOARD</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (simulation.status === "RUNNING") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Card className="w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-800 border-t-purple-500" />
          </div>
          <h2 className="mb-2 font-mono text-2xl font-bold text-white">PROCESSING...</h2>
          <p className="mb-6 font-mono text-sm text-gray-400">
            Simulating {simulation.agentCount} synthetic agents
          </p>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-900">
            <div className="h-full w-2/3 animate-pulse bg-purple-500" />
          </div>
          <p className="font-mono text-xs text-gray-600">
            Estimated time: 2-3 minutes
          </p>
        </Card>
      </div>
    );
  }

  const { report } = simulation;
  const mfi = report?.mfiScore ?? 0;
  const tribeName = TRIBE_NAMES[simulation.targetTribe] ?? simulation.targetTribe;
  const costInCents = 0; // TODO: Calculate actual cost when available

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-900 bg-black/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <h1 className="font-mono text-2xl font-bold text-white">VALENCE</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="font-mono text-xs">
                ← DASHBOARD
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Title */}
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-xs text-gray-600">
              <span>SIMULATION_ID: {simulation.id}</span>
              <div className="h-px w-8 bg-gray-900" />
              <span>TARGET: {tribeName}</span>
            </div>
            <h2 className="font-mono text-3xl font-bold text-white">
              {simulation.title}
            </h2>
          </div>

          {/* MFI Score - Big Hero */}
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-black/50">
            <div className="text-center">
              <p className="mb-4 font-mono text-xs uppercase tracking-wide text-purple-500">
                MARKET_FIT_INDEX
              </p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-4"
              >
                <span className="font-mono text-8xl font-bold text-white">
                  {mfi.toFixed(0)}
                </span>
                <span className="font-mono text-3xl text-gray-600">/100</span>
              </motion.div>
              <div className="mx-auto mb-4 h-3 w-full max-w-md overflow-hidden rounded-full bg-gray-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mfi}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                />
              </div>
              <p className="font-mono text-sm text-gray-400">
                Confidence: {((report?.confidenceLevel ?? 0) * 100).toFixed(0)}% •
                Cost: ${(costInCents / 100).toFixed(2)}
              </p>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard label="SENTIMENT" value={report?.sentimentSummary ?? "N/A"} />
            <StatCard label="AGENTS_TESTED" value={simulation.agentCount.toString()} />
            <StatCard
              label="PROCESSING_TIME"
              value={simulation.updatedAt && simulation.createdAt
                ? `${Math.round((new Date(simulation.updatedAt).getTime() - new Date(simulation.createdAt).getTime()) / 60000)}min`
                : "N/A"
              }
            />
          </div>

          {/* Top Objections */}
          {report?.topObjections && report.topObjections.length > 0 && (
            <Card>
              <div className="mb-6 flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-purple-500">TOP_OBJECTIONS</span>
                <div className="h-px flex-1 bg-gray-900" />
              </div>
              <div className="space-y-4">
                {report.topObjections.map((obj: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between border-l-2 border-red-900 bg-red-900/10 p-4"
                  >
                    <div>
                      <h3 className="font-mono text-sm font-bold text-white">
                        {obj.objection.replace(/_/g, " ").toUpperCase()}
                      </h3>
                      <p className="font-mono text-xs text-gray-500">
                        {obj.count} mentions • {(obj.severity * 100).toFixed(0)}% severity
                      </p>
                    </div>
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-900">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${obj.severity * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {report?.recommendations && report.recommendations.length > 0 && (
            <Card>
              <div className="mb-6 flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-purple-500">RECOMMENDATIONS</span>
                <div className="h-px flex-1 bg-gray-900" />
              </div>
              <div className="space-y-4">
                {report.recommendations.map((rec: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                    className={`border-l-2 p-4 ${
                      rec.priority === "high"
                        ? "border-purple-500 bg-purple-900/10"
                        : "border-yellow-700 bg-yellow-900/10"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-xs ${
                          rec.priority === "high"
                            ? "bg-purple-900/30 text-purple-400"
                            : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="font-mono text-xs text-gray-600">
                        Expected: {rec.expectedImpact}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-white">{rec.action}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Sample Agent Reactions */}
          {simulation.agentResponses && simulation.agentResponses.length > 0 && (
            <Card>
              <div className="mb-6 flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-purple-500">AGENT_REACTIONS</span>
                <div className="h-px flex-1 bg-gray-900" />
              </div>
              <div className="space-y-4">
                {simulation.agentResponses.map((response: any, i: number) => (
                  <motion.div
                    key={response.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                    className="rounded-lg border border-gray-900 bg-black/30 p-4"
                  >
                    <p className="mb-3 font-mono text-sm italic text-gray-300">
                      "{response.rawResponse}"
                    </p>
                    <div className="flex gap-4 font-mono text-xs text-gray-600">
                      <span>
                        Sentiment: <span className={response.sentimentScore > 0.5 ? "text-purple-500" : "text-gray-400"}>
                          {response.sentimentScore.toFixed(2)}
                        </span>
                      </span>
                      <span>
                        Intent: <span className={response.purchaseIntentScore > 0.5 ? "text-purple-500" : "text-gray-400"}>
                          {(response.purchaseIntentScore * 100).toFixed(0)}%
                        </span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center">
      <p className="mb-2 font-mono text-xs uppercase text-gray-600">{label}</p>
      <p className="font-mono text-xl font-bold text-purple-500">{value}</p>
    </Card>
  );
}
