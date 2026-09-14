import { createFileRoute } from "@tanstack/react-router";
import { Backpack } from "lucide-react";
import { ChecklistIndex } from "@/components/app/ChecklistPage";
import { PACKING_TYPES } from "@/lib/categories";

export const Route = createFileRoute("/app/packing/")({
  component: () => <ChecklistIndex kind="packing" icon={Backpack} color="green" defs={PACKING_TYPES} />,
});
