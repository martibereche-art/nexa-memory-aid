import { supabase } from "@/integrations/supabase/client";
import type { DataStore, InsertRow, Row, TableName, UpdateRow } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
// The generic table name defeats supabase-js's per-table typing, so calls are
// cast internally. Public signatures stay fully typed via DataStore.

function from(table: TableName) {
  return supabase.from(table as any) as any;
}

export function createCloudStore(userId: string): DataStore {
  return {
    kind: "cloud",
    async list<T extends TableName>(table: T) {
      const { data, error } = await from(table)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row<T>[];
    },
    async insert<T extends TableName>(table: T, values: InsertRow<T>) {
      const { data, error } = await from(table)
        .insert({ ...(values as object), user_id: userId })
        .select("*")
        .single();
      if (error) throw error;
      return data as Row<T>;
    },
    async insertMany<T extends TableName>(table: T, values: InsertRow<T>[]) {
      if (values.length === 0) return [];
      const { data, error } = await from(table)
        .insert(values.map((v) => ({ ...(v as object), user_id: userId })))
        .select("*");
      if (error) throw error;
      return (data ?? []) as Row<T>[];
    },
    async update<T extends TableName>(table: T, id: string, values: UpdateRow<T>) {
      const { data, error } = await from(table)
        .update(values as object)
        .eq("id", id)
        .eq("user_id", userId)
        .select("*")
        .single();
      if (error) throw error;
      return data as Row<T>;
    },
    async remove(table, id) {
      const { error } = await from(table).delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    async removeMany(table, ids) {
      if (ids.length === 0) return;
      const { error } = await from(table).delete().in("id", ids).eq("user_id", userId);
      if (error) throw error;
    },
  };
}
