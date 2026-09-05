import { TableClient, TableServiceClient } from "@azure/data-tables";

let projectsClient: TableClient | null = null;
let backlogClient: TableClient | null = null;
let maintenanceClient: TableClient | null = null;

function getConnectionString(): string {
  const conn = process.env.TABLE_STORAGE_CONNECTION_STRING;
  if (!conn) throw new Error("TABLE_STORAGE_CONNECTION_STRING not set");
  return conn;
}

async function ensureTable(tableName: string): Promise<TableClient> {
  const conn = getConnectionString();
  const serviceClient = TableServiceClient.fromConnectionString(conn);
  try {
    await serviceClient.createTable(tableName);
  } catch {
    // Table already exists
  }
  return TableClient.fromConnectionString(conn, tableName);
}

export async function getProjectsClient(): Promise<TableClient> {
  if (!projectsClient) {
    projectsClient = await ensureTable("Projects");
  }
  return projectsClient;
}

export async function getBacklogClient(): Promise<TableClient> {
  if (!backlogClient) {
    backlogClient = await ensureTable("Backlog");
  }
  return backlogClient;
}

export async function getMaintenanceClient(): Promise<TableClient> {
  if (!maintenanceClient) {
    maintenanceClient = await ensureTable("Maintenance");
  }
  return maintenanceClient;
}

/** Tombstones live in the Projects table, partition "tombstone", rowKey "<table>:<id>". */
export async function addTombstone(table: "projects" | "backlog", id: string): Promise<void> {
  const pc = await getProjectsClient();
  await pc.upsertEntity({ partitionKey: "tombstone", rowKey: `${table}:${id}`, deletedAt: new Date().toISOString() });
}

export async function getTombstones(table: "projects" | "backlog"): Promise<Set<string>> {
  const pc = await getProjectsClient();
  const out = new Set<string>();
  try {
    const it = pc.listEntities({ queryOptions: { filter: "PartitionKey eq 'tombstone'" } });
    for await (const e of it) {
      const rk = String(e.rowKey);
      if (rk.startsWith(table + ":")) out.add(rk.slice(table.length + 1));
    }
  } catch { /* ignore */ }
  return out;
}
