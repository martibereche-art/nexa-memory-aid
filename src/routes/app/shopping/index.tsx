import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { ChecklistIndex } from "@/components/app/ChecklistPage";
import { SHOPPING_CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/app/shopping/")({
  component: () => <ChecklistIndex kind="shopping" icon={ShoppingCart} color="purple" defs={SHOPPING_CATEGORIES} />,
});
