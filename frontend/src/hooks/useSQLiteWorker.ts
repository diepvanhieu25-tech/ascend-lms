import { useState, useEffect, useRef, useCallback } from 'react';

export interface QueryResult {
  columns: string[];
  values: unknown[][];
  executionTimeMs: number;
  error?: string;
}

export function useSQLiteWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Khởi tạo Web Worker từ static bundle trong public
    const worker = new Worker('/sqlite.worker.js');
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent) => {
      if (event.data.type === 'READY') {
        setIsReady(true);
      }
    };

    worker.onerror = (err) => {
      console.error('SQLite Worker Error:', err);
    };

    worker.postMessage({ type: 'INIT' });

    return () => {
      worker.terminate();
    };
  }, []);

  const runQuery = useCallback(
    (sql: string, ddl = '', seedSql = ''): Promise<QueryResult> => {
      return new Promise((resolve) => {
        const worker = workerRef.current;
        if (!worker) {
          return resolve({
            columns: [],
            values: [],
            executionTimeMs: 0,
            error: 'Worker chưa sẵn sàng',
          });
        }

        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'QUERY_RESULT') {
            worker.removeEventListener('message', handleMessage);
            resolve(event.data.payload);
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({
          type: 'EXECUTE',
          payload: { sql, ddl, seedSql },
        });
      });
    },
    []
  );

  return { isReady, runQuery };
}
