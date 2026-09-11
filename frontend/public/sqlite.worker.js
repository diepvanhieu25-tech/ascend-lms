importScripts('/sql-wasm.js');

let SQL = null;
let db = null;

async function getDb(wasmUrl) {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => wasmUrl || `/${file}`,
    });
    db = new SQL.Database();
  }
  return db;
}

self.onmessage = async (event) => {
  const { type, payload } = event.data || {};

  if (type === 'INIT') {
    try {
      await getDb(payload?.wasmUrl);
      self.postMessage({ type: 'READY' });
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        error: err && err.message ? err.message : String(err),
      });
    }
    return;
  }

  if (type === 'EXECUTE') {
    const { sql, ddl, seedSql, wasmUrl, queryId } = payload || {};
    const startTime = performance.now();

    try {
      const database = await getDb(wasmUrl);

      if (ddl && typeof ddl === 'string' && ddl.trim().length > 0) {
        database.run(ddl);
      }

      if (seedSql && typeof seedSql === 'string' && seedSql.trim().length > 0) {
        database.run(seedSql);
      }

      const results = database.exec(sql);
      const executionTimeMs = performance.now() - startTime;

      if (results && results.length > 0) {
        const first = results[0];
        self.postMessage({
          type: 'QUERY_RESULT',
          payload: {
            queryId,
            columns: first.columns,
            values: first.values,
            executionTimeMs: Math.round(executionTimeMs * 100) / 100,
          },
        });
      } else {
        self.postMessage({
          type: 'QUERY_RESULT',
          payload: {
            queryId,
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
          queryId,
          columns: [],
          values: [],
          executionTimeMs: Math.round(executionTimeMs * 100) / 100,
          error: err && err.message ? err.message : String(err),
        },
      });
    }
  }
};
