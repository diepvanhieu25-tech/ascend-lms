import { describe, it, expect } from 'vitest';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

describe('Task 3: Spike/PoC - SQLite WASM Execution & Benchmark', () => {
  it('executes SELECT 1 and returns result in less than 50ms', async () => {
    const wasmPath = path.resolve(__dirname, '../../public/sql-wasm.wasm');
    const fileBuffer = fs.readFileSync(wasmPath);
    const wasmBinary = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    );

    const SQL = await initSqlJs({
      wasmBinary,
    });

    const db = new SQL.Database();

    const startTime = performance.now();
    const res = db.exec('SELECT 1 AS num;');
    const executionTimeMs = performance.now() - startTime;

    expect(res.length).toBe(1);
    expect(res[0].columns).toEqual(['num']);
    expect(res[0].values).toEqual([[1]]);
    expect(executionTimeMs).toBeLessThan(50);
  });

  it('handles table creation (DDL) and seed data correctly within performance threshold', async () => {
    const wasmPath = path.resolve(__dirname, '../../public/sql-wasm.wasm');
    const fileBuffer = fs.readFileSync(wasmPath);
    const wasmBinary = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    );

    const SQL = await initSqlJs({
      wasmBinary,
    });

    const db = new SQL.Database();

    // Run DDL
    db.run('CREATE TABLE users (id INT PRIMARY KEY, name TEXT);');
    // Run Seed
    db.run("INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob');");

    const startTime = performance.now();
    const res = db.exec('SELECT name FROM users WHERE id = 1;');
    const executionTimeMs = performance.now() - startTime;

    expect(res[0].columns).toEqual(['name']);
    expect(res[0].values).toEqual([['Alice']]);
    expect(executionTimeMs).toBeLessThan(50);
  });
});
