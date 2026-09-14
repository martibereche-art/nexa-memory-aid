import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { ChecklistIndex } from "@/components/app/ChecklistPage";
import { SHOPPING_CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/app/shopping")({ component: ShoppingLayout });

function ShoppingLayout() {
  const matches = useMatches();
  const hasChild = matches.some((m) => m.routeId === "/app/shopping/$listId");
  if (hasChild) return <Outlet />;
  return <ChecklistIndex kind="shopping" icon={ShoppingCart} color="purple" defs={SHOPPING_CATEGORIES} />;
}
