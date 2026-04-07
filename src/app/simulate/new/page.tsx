"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/react";

const TRIBES = [
  { id: "gen-z-gamers", name: "Gen Z Gamers", description: "Digital-native gamers valuing authenticity" },
  { id: "biohackers", name: "Biohackers", description: "Health optimizers seeking peak performance" },
  { id: "climate-activists", name: "Climate Activists", description: "Environmentally conscious change-makers" },
  { id: "corporate-hr", name: "Corporate HR Managers", description: "HR professionals balancing wellbeing & goals" },
  { id: "indie-creators", name: "Indie Creators", description: "Independent content creators building audiences" },
  { id: "normal-20s", name: "Normal 20-Somethings", description: "Everyday people in their 20s navigating adult life" },
];

export default function NewSimulationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    targetTribe: "",
    stimulusText: "",
    agentCount: 50,
    chaosModes: {
      hater: false,
      recession: false,
      echoChamber: false,
    },
  });

  const createSimulation = api.simulation.create.useMutation({
    onSuccess: (data) => {
      // Redirect to the simulation detail page
      router.push(`/simulate/${data.id}`);
    },
    onError: (error) => {
      alert(`Error creating simulation: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.targetTribe) {
      alert("Please select a target tribe");
      return;
    }

    createSimulation.mutate({
      title: formData.title,
      targetTribe: formData.targetTribe,
      geography: "Global",
      stimulusType: "TEXT",
      stimulusText: formData.stimulusText,
      agentCount: formData.agentCount,
      chaosModes: formData.chaosModes,
    });
  };

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
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="font-mono text-xs">
                ← BACK
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="font-mono text-purple-500">&gt;</span>
              <h2 className="font-mono text-4xl font-bold text-white">
                NEW_SIMULATION
              </h2>
            </div>
            <p className="font-mono text-sm text-gray-400">
              Configure synthetic reality test parameters.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <Card>
              <label className="block">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs uppercase text-purple-500">SIMULATION_ID</span>
                  <div className="h-px flex-1 bg-gray-900" />
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-800 bg-black/50 p-3 font-mono text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="e.g., SaaS Pricing Test - $29/mo Plan"
                  required
                />
              </label>
            </Card>

            {/* Tribe Selection */}
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-purple-500">TARGET_TRIBE</span>
                <div className="h-px flex-1 bg-gray-900" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {TRIBES.map((tribe) => (
                  <div
                    key={tribe.id}
                    onClick={() => setFormData({ ...formData, targetTribe: tribe.id })}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      formData.targetTribe === tribe.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-800 bg-black/30 hover:border-gray-700"
                    }`}
                  >
                    <h3 className="mb-1 font-mono text-sm font-bold text-white">
                      {tribe.name}
                    </h3>
                    <p className="font-mono text-xs text-gray-500">{tribe.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stimulus Input */}
            <Card>
              <label className="block">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs uppercase text-purple-500">STIMULUS_INPUT</span>
                  <div className="h-px flex-1 bg-gray-900" />
                </div>
                <textarea
                  value={formData.stimulusText}
                  onChange={(e) => setFormData({ ...formData, stimulusText: e.target.value })}
                  className="w-full rounded-lg border border-gray-800 bg-black/50 p-3 font-mono text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  rows={6}
                  placeholder="Describe your product, pricing, positioning, or policy...&#10;&#10;Example: We're launching a productivity tool for remote teams at $29/month with unlimited projects, real-time collaboration, and AI-powered insights. Includes 14-day free trial."
                  required
                />
              </label>
            </Card>

            {/* Agent Count */}
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-purple-500">AGENT_COUNT</span>
                <div className="h-px flex-1 bg-gray-900" />
                <span className="font-mono text-sm text-white">{formData.agentCount}</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="10"
                value={formData.agentCount}
                onChange={(e) => setFormData({ ...formData, agentCount: parseInt(e.target.value) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-900"
                style={{
                  background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${((formData.agentCount - 30) / 270) * 100}%, rgb(23 23 23) ${((formData.agentCount - 30) / 270) * 100}%, rgb(23 23 23) 100%)`
                }}
              />
              <div className="mt-2 flex justify-between font-mono text-xs text-gray-600">
                <span>30 (FAST)</span>
                <span>300 (ACCURATE)</span>
              </div>
            </Card>

            {/* Chaos Modes */}
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-purple-500">CHAOS_MODES</span>
                <div className="h-px flex-1 bg-gray-900" />
              </div>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.chaosModes.hater}
                    onChange={(e) => setFormData({
                      ...formData,
                      chaosModes: { ...formData.chaosModes, hater: e.target.checked }
                    })}
                    className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-800 bg-black/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <div>
                    <span className="font-mono text-sm font-bold text-white">HATER_MODE</span>
                    <p className="font-mono text-xs text-gray-500">
                      Maximum skepticism. Agents look for BS, greenwashing, and empty promises.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.chaosModes.recession}
                    onChange={(e) => setFormData({
                      ...formData,
                      chaosModes: { ...formData.chaosModes, recession: e.target.checked }
                    })}
                    className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-800 bg-black/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <div>
                    <span className="font-mono text-sm font-bold text-white">RECESSION_MODE</span>
                    <p className="font-mono text-xs text-gray-500">
                      Financial stress simulation. Every dollar counts, affordability is key.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.chaosModes.echoChamber}
                    onChange={(e) => setFormData({
                      ...formData,
                      chaosModes: { ...formData.chaosModes, echoChamber: e.target.checked }
                    })}
                    className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-800 bg-black/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <div>
                    <span className="font-mono text-sm font-bold text-white">ECHO_CHAMBER</span>
                    <p className="font-mono text-xs text-gray-500">
                      Social influence enabled. Agents react to peer opinions and influencers.
                    </p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                isLoading={createSimulation.isPending}
                disabled={createSimulation.isPending}
                className="flex-1 border-2 border-purple-500 bg-purple-500 font-mono text-white hover:bg-purple-400"
              >
                {createSimulation.isPending ? "CREATING..." : "INITIATE_SIMULATION →"}
              </Button>
              <Link href="/dashboard" className="flex-shrink-0">
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="font-mono"
                >
                  CANCEL
                </Button>
              </Link>
            </div>
          </form>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 rounded-lg border border-gray-900 bg-black/30 p-4"
          >
            <p className="font-mono text-xs text-gray-500">
              <span className="text-purple-500">// NOTE:</span> Demo mode active. Simulations will complete instantly.
              In production, expect 2-5 minutes for 50 agents with Bayesian early stopping.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
