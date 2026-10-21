# Debug Session: prisma-db-unreachable
- **Status**: [OPEN]
- **Issue**: The public site fails during server rendering because Prisma cannot reach PostgreSQL at `127.0.0.1:55432`.
- **Debug Server**: Not started; evaluating whether instrumentation is necessary for this connection failure.
- **Log File**: `.dbg/trae-debug-log-prisma-db-unreachable.ndjson`

## Reproduction Steps
1. Start the local Next.js development server.
2. Request `/`.
3. Observe Prisma `P1001`-style connection failure to `127.0.0.1:55432` in `readFixed()`.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | The configured PostgreSQL endpoint has no listener because the local development database is stopped. | High | Low | Confirmed: no listener found on `127.0.0.1:55432` |
| B | `DATABASE_URL` points to port `55432`, while the local PGlite helper defaults to port `5433`. | High | Low | Confirmed: safe `.env` inspection showed port `55432`; `scripts/dev-db.ts` defaults to `5433` |
| C | A database container or port-forward that should expose `55432` is stopped. | Medium | Low | Likely: no process/listener found; no container setup identified in project instructions |
| D | PostgreSQL is listening on a different host/interface than the URL's `127.0.0.1`. | Low | Low | Rejected for configured local endpoints: no listener found on ports `5432`, `5433`, or `55432` |
| E | The PGlite socket connection cap is lower than Prisma's concurrent pool demand, terminating connections during dynamic page rendering. | High | Low | Confirmed: 12-query integration test yielded 10 successes with configured cap 8; all 12 pass with cap 24 |

## Log Evidence
- User-provided runtime error identifies target `127.0.0.1:55432` and call site `features/content/site-data.ts:29`; this indicates connection failure before query evaluation.
- Safe `.env` inspection found only endpoint metadata: protocol `postgresql:`, host `127.0.0.1`, port `55432`, database `postgres`; no username or password was printed.
- `ss -ltnp` found no listener on `5432`, `5433`, or `55432`; no PostgreSQL/PGlite helper process was running.
- `.pgdata` did not exist, so initializing the documented local PGlite database will not overwrite existing local DB files.
- Started the documented PGlite helper on the configured port `55432`; Prisma migration `20260101000000_init` applied to the new local database.
- A direct `pg` query and a direct Prisma `$queryRawUnsafe("select 1 as ok")` both succeeded against the configured endpoint.
- The pre-existing Next.js server process (PID `83175`) started at 14:20, before PGlite. Subsequent requests to `/` still returned HTTP 500 with `Connection terminated unexpectedly`; restarting this existing process is needed to verify whether its stale connection pool is the remaining cause.
- Regression test `test/db/dev-database-concurrency.test.ts` failed before the fix: 10 of 12 concurrent Prisma queries succeeded using the helper's configured cap of 8.
- Changed the dev helper connection cap to 24. The same regression test then passed all 12 queries.
- Restarted the local Next.js and PGlite processes with the updated setting. With the database confirmed listening before Next.js started, `/` returned the expected 404 for the intentionally empty local profile and emitted no connection errors. A separate 12-request burst also returned 404 for every request without further `Connection terminated unexpectedly` logs.

## Verification Conclusion
Confirmed root causes: the local database was not running at `.env`'s `127.0.0.1:55432` endpoint, and the documented PGlite helper's cap of 8 connections was too low for Prisma's concurrent page queries. The helper now allows 24; the regression test and post-restart HTTP burst pass without Prisma connection errors. The blank local database intentionally contains no real profile, so `/` correctly returns 404 rather than inventing content. Awaiting user confirmation of the original browser error.
