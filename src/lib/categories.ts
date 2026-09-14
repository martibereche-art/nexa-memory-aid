import {
  Backpack,
  Briefcase,
  Car,
  Clock,
  Dumbbell,
  FileText,
  GraduationCap,
  HeartPulse,
  Home,
  Key,
  Laptop,
  MapPin,
  MoreHorizontal,
  Plane,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Sunrise,
  User,
  Wallet,
  CheckSquare,
  Search,
  type LucideIcon,
  Sparkles,
  ClipboardList,
  Package,
} from "lucide-react";

export type FeatureColor = "blue" | "green" | "orange" | "purple" | "pink" | "cyan" | "amber" | "indigo";

export const FEATURE_CLASS: Record<FeatureColor, string> = {
  blue: "feature-blue",
  green: "feature-green",
  orange: "feature-orange",
  purple: "feature-purple",
  pink: "feature-pink",
  cyan: "feature-cyan",
  amber: "feature-amber",
  indigo: "feature-indigo",
};

export interface FeatureDef {
  key: "places" | "packing" | "waiting" | "shopping" | "tasks" | "tomorrow";
  to: "/app/places" | "/app/packing" | "/app/waiting" | "/app/shopping" | "/app/tasks" | "/app/tomorrow";
  color: FeatureColor;
  icon: LucideIcon;
}

export const FEATURES: FeatureDef[] = [
  { key: "places", to: "/app/places", color: "blue", icon: MapPin },
  { key: "packing", to: "/app/packing", color: "green", icon: Backpack },
  { key: "waiting", to: "/app/waiting", color: "orange", icon: Clock },
  { key: "shopping", to: "/app/shopping", color: "purple", icon: ShoppingCart },
  { key: "tasks", to: "/app/tasks", color: "pink", icon: CheckSquare },
  { key: "tomorrow", to: "/app/tomorrow", color: "cyan", icon: Sunrise },
];

export interface CategoryDef {
  value: string;
  icon: LucideIcon;
  color: FeatureColor;
}

export const PLACE_CATEGORIES: CategoryDef[] = [
  { value: "documents", icon: FileText, color: "blue" },
  { value: "electronics", icon: Laptop, color: "cyan" },
  { value: "home", icon: Home, color: "green" },
  { value: "keys", icon: Key, color: "amber" },
  { value: "clothes", icon: Shirt, color: "purple" },
  { value: "other", icon: MoreHorizontal, color: "indigo" },
];

export const PACKING_TYPES: CategoryDef[] = [
  { value: "work", icon: Briefcase, color: "blue" },
  { value: "university", icon: GraduationCap, color: "purple" },
  { value: "travel", icon: Plane, color: "cyan" },
  { value: "doctor", icon: Stethoscope, color: "pink" },
  { value: "gym", icon: Dumbbell, color: "orange" },
  { value: "shopping", icon: ShoppingBag, color: "green" },
  { value: "tomorrow", icon: Sunrise, color: "amber" },
  { value: "custom", icon: ClipboardList, color: "indigo" },
];

export const WAITING_CATEGORIES: CategoryDef[] = [
  { value: "personal", icon: User, color: "purple" },
  { value: "work", icon: Briefcase, color: "blue" },
  { value: "purchase", icon: Package, color: "orange" },
  { value: "admin", icon: FileText, color: "cyan" },
  { value: "study", icon: GraduationCap, color: "green" },
  { value: "other", icon: MoreHorizontal, color: "indigo" },
];

export const SHOPPING_CATEGORIES: CategoryDef[] = [
  { value: "home", icon: Home, color: "green" },
  { value: "car", icon: Car, color: "blue" },
  { value: "work", icon: Briefcase, color: "indigo" },
  { value: "travel", icon: Plane, color: "cyan" },
  { value: "personal", icon: User, color: "purple" },
  { value: "groceries", icon: ShoppingBag, color: "orange" },
  { value: "custom", icon: Sparkles, color: "pink" },
];

export const TASK_CATEGORIES: CategoryDef[] = [
  { value: "home", icon: Home, color: "green" },
  { value: "work", icon: Briefcase, color: "blue" },
  { value: "personal", icon: User, color: "purple" },
  { value: "study", icon: GraduationCap, color: "cyan" },
  { value: "health", icon: HeartPulse, color: "pink" },
  { value: "finance", icon: Wallet, color: "amber" },
  { value: "other", icon: MoreHorizontal, color: "indigo" },
];

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const PRIORITY_COLOR: Record<(typeof PRIORITIES)[number], FeatureColor> = {
  low: "cyan",
  medium: "blue",
  high: "orange",
  urgent: "pink",
};

export const WAITING_STATUSES = ["waiting", "follow_up", "received", "cancelled"] as const;
export const TASK_STATUSES = ["pending", "in_progress", "completed", "archived"] as const;
export const RECURRENCES = ["none", "daily", "weekly", "monthly"] as const;

export function findCategory(list: CategoryDef[], value: string): CategoryDef {
  return list.find((c) => c.value === value) ?? list[list.length - 1];
}

export { Search as SearchIcon };
