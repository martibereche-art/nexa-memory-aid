import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export const TABLES = [
  "saved_items",
  "packing_lists",
  "packing_items",
  "waiting_items",
  "shopping_lists",
  "shopping_items",
  "tasks",
  "notes",
  "notifications",
] as const;

export type TableName = (typeof TABLES)[number];

export type Row<T extends TableName> = Tables<T>;
export type InsertRow<T extends TableName> = Omit<TablesInsert<T>, "user_id" | "id" | "created_at" | "updated_at">;
export type UpdateRow<T extends TableName> = Omit<TablesUpdate<T>, "user_id" | "id" | "created_at" | "updated_at">;

export type SavedItem = Tables<"saved_items">;
export type PackingList = Tables<"packing_lists">;
export type PackingItem = Tables<"packing_items">;
export type WaitingItem = Tables<"waiting_items">;
export type ShoppingList = Tables<"shopping_lists">;
export type ShoppingItem = Tables<"shopping_items">;
export type Task = Tables<"tasks">;
export type Note = Tables<"notes">;
export type Notification = Tables<"notifications">;
export type Profile = Tables<"profiles">;

export type Priority = "low" | "medium" | "high" | "urgent";
export type WaitingStatus = "waiting" | "follow_up" | "received" | "cancelled";
export type TaskStatus = "pending" | "in_progress" | "completed" | "archived";
export type Recurrence = "none" | "daily" | "weekly" | "monthly";

/** Column defaults mirrored from the database so the local (guest) store produces identical rows. */
export const ROW_DEFAULTS: { [T in TableName]: Omit<Row<T>, "id" | "user_id" | "created_at" | "updated_at"> } = {
  saved_items: {
    name: "",
    description: "",
    location: "",
    category: "other",
    image_url: null,
    tags: [],
    is_favorite: false,
    is_archived: false,
  },
  packing_lists: {
    title: "",
    list_type: "custom",
    date: null,
    destination: "",
    notes: "",
    is_completed: false,
    is_archived: false,
    reminder_at: null,
  },
  packing_items: { list_id: "", name: "", is_checked: false, sort_order: 0 },
  waiting_items: {
    title: "",
    from_whom: "",
    description: "",
    category: "personal",
    start_date: "",
    expected_date: null,
    last_follow_up: null,
    next_reminder: null,
    priority: "medium",
    status: "waiting",
    notes: "",
  },
  shopping_lists: { title: "", category: "home", notes: "", is_archived: false },
  shopping_items: {
    list_id: "",
    name: "",
    quantity: "1",
    notes: "",
    priority: "medium",
    is_purchased: false,
    is_recurring: false,
  },
  tasks: {
    title: "",
    description: "",
    category: "personal",
    due_date: null,
    reminder_at: null,
    priority: "medium",
    status: "pending",
    is_recurring: false,
    recurrence: "none",
    notes: "",
    completed_at: null,
  },
  notes: { content: "", for_date: null, is_done: false },
  notifications: {
    title: "",
    body: "",
    kind: "reminder",
    entity_type: null,
    entity_id: null,
    source_key: null,
    is_read: false,
  },
};

/** Child tables removed when a parent row is deleted (mirrors ON DELETE CASCADE). */
export const CASCADES: Partial<Record<TableName, { table: TableName; column: string }[]>> = {
  packing_lists: [{ table: "packing_items", column: "list_id" }],
  shopping_lists: [{ table: "shopping_items", column: "list_id" }],
};

export interface DataStore {
  readonly kind: "local" | "cloud";
  list<T extends TableName>(table: T): Promise<Row<T>[]>;
  insert<T extends TableName>(table: T, values: InsertRow<T>): Promise<Row<T>>;
  insertMany<T extends TableName>(table: T, values: InsertRow<T>[]): Promise<Row<T>[]>;
  update<T extends TableName>(table: T, id: string, values: UpdateRow<T>): Promise<Row<T>>;
  remove(table: TableName, id: string): Promise<void>;
  removeMany(table: TableName, ids: string[]): Promise<void>;
}

export function todayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return todayISO(d);
}
