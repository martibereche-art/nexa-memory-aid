import { CASCADES, ROW_DEFAULTS, TABLES, type DataStore, type InsertRow, type Row, type TableName, type UpdateRow } from "./types";

export const GUEST_FLAG_KEY = "nexa:guest";
const PREFIX = "nexa:guest:";
export const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

function key(table: TableName) {
  return `${PREFIX}${table}`;
}

function read<T extends TableName>(table: T): Row<T>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(table));
    return raw ? (JSON.parse(raw) as Row<T>[]) : [];
  } catch {
    return [];
  }
}

function write<T extends TableName>(table: T, rows: Row<T>[]) {
  window.localStorage.setItem(key(table), JSON.stringify(rows));
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const delay = () => new Promise<void>((r) => setTimeout(r, 30));

export const localStore: DataStore = {
  kind: "local",
  async list(table) {
    await delay();
    return read(table);
  },
  async insert(table, values) {
    const [row] = await localStore.insertMany(table, [values]);
    return row!;
  },
  async insertMany<T extends TableName>(table: T, values: InsertRow<T>[]) {
    await delay();
    const now = new Date().toISOString();
    const rows = read(table);
    const created = values.map((v) => {
      const row = {
        ...ROW_DEFAULTS[table],
        ...v,
        id: uuid(),
        user_id: GUEST_USER_ID,
        created_at: now,
        updated_at: now,
      } as unknown as Row<T>;
      if (table === "waiting_items" && !(row as Record<string, unknown>)['start_date']) {
        (row as Record<string, unknown>)['start_date'] = now.slice(0, 10);
      }
      return row;
    });
    write(table, [...rows, ...created]);
    return created;
  },
  async update<T extends TableName>(table: T, id: string, values: UpdateRow<T>) {
    await delay();
    const rows = read(table);
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Not found");
    const updated = { ...rows[idx], ...values, updated_at: new Date().toISOString() } as Row<T>;
    rows[idx] = updated;
    write(table, rows);
    return updated;
  },
  async remove(table, id) {
    return localStore.removeMany(table, [id]);
  },
  async removeMany(table, ids) {
    await delay();
    const set = new Set(ids);
    write(table, read(table).filter((r) => !set.has(r.id)));
    for (const cascade of CASCADES[table] ?? []) {
      const children = read(cascade.table) as Record<string, unknown>[];
      write(
        cascade.table,
        children.filter((c) => !set.has(String(c[cascade.column]))) as Row<typeof cascade.table>[],
      );
    }
  },
};

export function isGuest(): boolean {
  return typeof window !== "undefined" && window.localStorage.getItem(GUEST_FLAG_KEY) === "1";
}

export function setGuest(on: boolean) {
  if (on) window.localStorage.setItem(GUEST_FLAG_KEY, "1");
  else window.localStorage.removeItem(GUEST_FLAG_KEY);
}

export function readAllGuestData(): { [T in TableName]: Row<T>[] } {
  return Object.fromEntries(TABLES.map((t) => [t, read(t)])) as { [T in TableName]: Row<T>[] };
}

export function guestDataCount(): number {
  return TABLES.filter((t) => t !== "notifications").reduce((n, t) => n + read(t).length, 0);
}

export function clearGuestData() {
  for (const t of TABLES) window.localStorage.removeItem(key(t));
}
