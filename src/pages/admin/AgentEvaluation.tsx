import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import {
  Bot, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, Filter, Loader2, ShieldAlert,
} from "lucide-react";

type FilterMode = "all" | "has_risk_flags" | "low_readiness";

interface CoachAgent {
  id: string;
  display_name: string | null;
  readiness_score: number | null;
  missing_fields: unknown[] | null;
  risk_flags: unknown[] | null;
  agent_recommendation: string | null;
  agent_last_run: string | null;
  agent_version: string | null;
}

function scoreColor(score: number | null): string {
  if (score === null || score === undefined) return "text-zinc-500";
  if (score > 80) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score: number | null): string {
  if (score === null || score === undefined) return "bg-zinc-800";
  if (score > 80) return "bg-emerald-500/15";
  if (score >= 50) return "bg-amber-500/15";
  return "bg-red-500/15";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function arrayLength(arr: unknown): number {
  if (Array.isArray(arr)) return arr.length;
  return 0;
}

export default function AgentEvaluation() {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["agent-evaluation-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, display_name, readiness_score, missing_fields, risk_flags, agent_recommendation, agent_last_run, agent_version")
        .order("display_name", { ascending: true });

      if (error) throw error;
      return (data || []) as CoachAgent[];
    },
  });

  const filtered = (coaches || []).filter((c) => {
    if (filter === "has_risk_flags") return arrayLength(c.risk_flags) > 0;
    if (filter === "low_readiness") return c.readiness_score !== null && c.readiness_score < 50;
    return true;
  });

  const FILTERS: { id: FilterMode; label: string; icon: React.ElementType }[] = [
    { id: "all", label: "All Coaches", icon: Bot },
    { id: "has_risk_flags", label: "Has Risk Flags", icon: ShieldAlert },
    { id: "low_readiness", label: "Low Readiness (<50)", icon: AlertTriangle },
  ];

  return (
    <AdminLayout title="Agent Evaluation">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Agent Evaluation Dashboard</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Phase 2 infrastructure — evaluation fields populated by Phase 3 Claude Agent
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <Bot className="h-4 w-4" />
            <span>Phase 2 — Event Logging Active</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === id
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs text-zinc-600 self-center">
            {filtered.length} coach{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-3 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Coach</span>
              <span>Readiness</span>
              <span>Missing</span>
              <span>Risks</span>
              <span>Recommendation</span>
              <span>Last Run</span>
            </div>

            {/* Rows */}
            {filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-zinc-600">
                No coaches match the current filter.
              </div>
            )}

            {filtered.map((coach) => {
              const isExpanded = expandedId === coach.id;
              const missingCount = arrayLength(coach.missing_fields);
              const riskCount = arrayLength(coach.risk_flags);

              return (
                <div key={coach.id} className="border-b border-zinc-800/50 last:border-b-0">
                  {/* Main row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : coach.id)}
                    className="w-full grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr] gap-4 px-5 py-4 text-left hover:bg-zinc-800/30 transition-colors items-center"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                      )}
                      <span className="text-sm text-zinc-200 truncate">
                        {coach.display_name || "Unnamed Coach"}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold ${scoreColor(coach.readiness_score)} ${scoreBg(coach.readiness_score)}`}
                      >
                        {coach.readiness_score !== null ? coach.readiness_score : "--"}
                      </span>
                    </div>

                    <div>
                      <span className={`text-sm ${missingCount > 0 ? "text-amber-400" : "text-zinc-600"}`}>
                        {missingCount}
                      </span>
                    </div>

                    <div>
                      <span className={`text-sm ${riskCount > 0 ? "text-red-400" : "text-zinc-600"}`}>
                        {riskCount}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="text-sm text-zinc-400 truncate block">
                        {coach.agent_recommendation || "--"}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500">{timeAgo(coach.agent_last_run)}</span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 ml-8 space-y-4">
                      <div className="grid lg:grid-cols-2 gap-4">
                        {/* Missing Fields */}
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            Missing Fields ({missingCount})
                          </h4>
                          {missingCount === 0 ? (
                            <p className="text-sm text-zinc-600">None</p>
                          ) : (
                            <div className="space-y-1">
                              {(coach.missing_fields as string[]).map((field, i) => (
                                <div
                                  key={i}
                                  className="text-sm text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-md"
                                >
                                  {typeof field === "string" ? field : JSON.stringify(field)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Risk Flags */}
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                            Risk Flags ({riskCount})
                          </h4>
                          {riskCount === 0 ? (
                            <p className="text-sm text-zinc-600">None</p>
                          ) : (
                            <div className="space-y-1">
                              {(coach.risk_flags as string[]).map((flag, i) => (
                                <div
                                  key={i}
                                  className="text-sm text-red-300 bg-red-500/10 px-3 py-1.5 rounded-md"
                                >
                                  {typeof flag === "string" ? flag : JSON.stringify(flag)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Full recommendation */}
                      {coach.agent_recommendation && (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                            Agent Recommendation
                          </h4>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {coach.agent_recommendation}
                          </p>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-6 text-xs text-zinc-600">
                        <span>
                          <Clock className="h-3 w-3 inline mr-1" />
                          Last run: {coach.agent_last_run ? new Date(coach.agent_last_run).toLocaleString() : "Never"}
                        </span>
                        {coach.agent_version && (
                          <span>
                            <Bot className="h-3 w-3 inline mr-1" />
                            Agent version: {coach.agent_version}
                          </span>
                        )}
                        <span className="font-mono text-zinc-700">{coach.id}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
