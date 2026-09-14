import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { Backpack } from "lucide-react";
import { ChecklistIndex } from "@/components/app/ChecklistPage";
import { PACKING_TYPES } from "@/lib/categories";

export const Route = createFileRoute("/app/packing")({ component: PackingLayout });

function PackingLayout() {
  const matches = useMatches();
  const hasChild = matches.some((m) => m.routeId === "/app/packing/$listId");
  if (hasChild) return <Outlet />;
  return <ChecklistIndex kind="packing" icon={Backpack} color="green" defs={PACKING_TYPES} />;
}
