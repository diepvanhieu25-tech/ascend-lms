import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

export interface ExecutePayload {
  sql: string;
  ddl?: string;
  seedSql?: string;
  wasmUrl?: string;
}

export interface QueryResultPayload {
  columns: string[];
  values: unknown[][];
  executionTimeMs: number;
  error?: string;
}

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;

  if (type === 'INIT') {
    try {
      if (!SQL) {
        SQL = await initSqlJs({
          locateFile: (file) => payload?.wasmUrl || `/${file}`,
        });
        db = new SQL.Database();
      }
      self.postMessage({ type: 'READY' });
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (type === 'EXECUTE') {
    const { sql, ddl, seedSql, wasmUrl } = (payload || {}) as ExecutePayload;
    const startTime = performance.now();

    try {
      if (!SQL || !db) {
        SQL = await initSqlJs({
          locateFile: (file) => wasmUrl || `/${file}`,
        });
        db = new SQL.Database();
      }

      // If DDL is provided, apply table creation schema
      if (ddl && ddl.trim().length > 0) {
        db.run(ddl);
      }

      // If seedSql is provided, populate data
      if (seedSql && seedSql.trim().length > 0) {
        db.run(seedSql);
      }

      // Execute target user query
      const results = db.exec(sql);
      const executionTimeMs = performance.now() - startTime;

      if (results.length > 0) {
        const firstResult = results[0];
        self.postMessage({
          type: 'QUERY_RESULT',
          payload: {
            columns: firstResult.columns,
            values: firstResult.values,
            executionTimeMs: Math.round(executionTimeMs * 100) / 100,
          },
        });
      } else {
        self.postMessage({
          type: 'QUERY_RESULT',
          payload: {
            columns: [],
            values: [],
            executionTimeMs: Math.round(executionTimeMs * 100) / 100,
          },
        });
      }
    } catch (err) {
      const executionTimeMs = performance.now() - startTime;
      self.postMessage({
        type: 'QUERY_RESULT',
        payload: {
          columns: [],
          values: [],
          executionTimeMs: Math.round(executionTimeMs * 100) / 100,
          error: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }
};
