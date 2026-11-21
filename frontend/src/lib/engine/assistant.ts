// =============================================================================
// SolarOS — Business-intelligence assistant (initial stub; being expanded)
// =============================================================================

import type { AssistantAnswer, AssistantContext, AssistantFunctionInfo } from "./types";

export const ASSISTANT_FUNCTIONS: AssistantFunctionInfo[] = [
  { name: "get_delayed_projects", module: "installations", description: "Installations that are delayed or behind schedule", example: "Which projects are running late?" },
  { name: "get_stock_to_replenish", module: "inventory", description: "Items at or below their reorder level", example: "What's low on stock?" },
  { name: "get_pending_quotations", module: "quotations", description: "Draft and sent quotations awaiting a decision", example: "Show quotations awaiting approval" },
  { name: "get_monthly_revenue", module: "payments", description: "Revenue this month compared with last month", example: "How is revenue this month?" },
  { name: "get_service_attention", module: "service", description: "Service tickets and warranty claims that need attention", example: "Which service tickets need attention?" },
  { name: "get_installations_this_week", module: "installations", description: "Installations scheduled this week", example: "What installations are scheduled this week?" },
  { name: "get_outstanding_payments", module: "payments", description: "Pending and overdue customer payments", example: "Which payments are outstanding?" },
  { name: "get_lead_summary", module: "leads", description: "Lead pipeline by status, sources and conversion", example: "Give me a lead summary" },
  { name: "get_survey_queue", module: "surveys", description: "Surveys awaiting approval and upcoming site visits", example: "Which surveys are awaiting approval?" },
];

export function answerBusinessQuestion(question: string, ctx: AssistantContext): AssistantAnswer {
  void question;
  const available = ASSISTANT_FUNCTIONS.filter((fn) => ctx.canView(fn.module));
  return {
    intent: "unknown",
    allowed: true,
    text: "The assistant engine is being set up. Try one of the suggested questions.",
    blocks: [{ type: "list", items: available.map((fn) => ({ title: fn.description, description: fn.example })) }],
    sources: [],
    followups: available.slice(0, 3).map((fn) => fn.example),
  };
}
