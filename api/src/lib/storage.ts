import { TableClient, TableServiceClient } from "@azure/data-tables";

let projectsClient: TableClient | null = null;
let backlogClient: TableClient | null = null;

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
