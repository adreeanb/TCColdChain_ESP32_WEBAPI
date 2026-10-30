# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cold chain monitoring REST API: ESP32 sensors report temperatures for cold rooms, cold storage and reefer trucks, and readings outside a unit's limits raise alerts. Stack: Express 5, Prisma 7 (`@prisma/adapter-pg`), PostgreSQL 16, MQTT, JWT. Code comments and API error messages are in Portuguese; keep new ones consistent.

## Commands

```bash
docker compose up -d      # Postgres, exposed on host port 5433
npm run dev               # tsx watch src/server.ts (PORT from .env, falls back to 3334)
npx tsc --noEmit          # type check; there is no build script

npx prisma migrate dev --name <name>   # apply schema changes and create a migration
npx prisma generate                    # regenerate the client
npx prisma db seed                     # upsert the base enterprise and MASTER user
```

There is no test runner or linter configured (`npm test` is a placeholder that exits 1).

`.env` needs `DATABASE_URL`, `PORT`, `MQTT_BROKER_URL` and `JWT_SECRET`. Optional: `QUARANTINE_TTL_HOURS` (default 2), `SENSOR_OFFLINE_MINUTES` (default 10) and `CORS_ORIGINS` (comma-separated).

The web client lives in the sibling repository `D:\Workspace\ColdChain_Web` and is its only consumer, so response shapes can change as long as both move together. Its Playwright suite starts this API from `../ColdChain_API`.

## Architecture

Requests flow `src/routes/index.ts` → middleware → controller → service → `prisma` from `src/lib/prisma.ts`.

- **Controllers** (`src/controllers/<domain>/`) are classes with a `handle(req, res)` method. They read the request, instantiate the service, and map thrown errors to HTTP responses in a local `try/catch`. There is no global error handler.
- **Services** (`src/services/<domain>/`) are classes with a single `execute()` method holding the business logic. They signal failures with `throw new Error(message)`.
- **One class per action**, with file names like `CreateColdUnitController.ts` / `CreateColdUnitService.ts`. Routes are all registered in `src/routes/index.ts`.
- **ESM**: `"type": "module"` with `nodenext` resolution, so relative imports need the `.js` extension. `verbatimModuleSyntax` requires `import type` for type-only imports.

**Auth and tenancy**: `isAuthenticated` verifies the Bearer JWT and sets `req.user` (`id`, `name`, `email`, `role`, `enterpriseId`). `isMaster` and `isAdmin` (ADMIN or MASTER) must run after it. Roles are `MASTER`, `ADMIN` and `OPERATOR`: operators read, resolve alerts and bind boards; admins also manage the units and users of their enterprise; only MASTER manages enterprises and boards. Tenancy is by `enterpriseId` from the token, applied per service rather than centrally, so every new service has to apply it. Routes where MASTER can act on another enterprise use `resolveEnterpriseId` from `src/lib/tenant.ts`, which ignores the requested enterprise for other roles. Tokens are not checked against the database, so a removed user or a changed role only takes effect when the token expires (1 day).

**Dashboard**: `GET /dashboard/summary` returns each unit with its status, computed from the latest reading of each active board: `OUT_OF_RANGE` wins over `NO_SIGNAL`, and one silent board is enough for `NO_SIGNAL`. A board's last contact (`src/lib/deviceStatus.ts`) uses `createdAt`, not `timestamp`, because store-and-forward data is old but proves the board is alive. Raw SQL here and in `ListTemperatureSeriesService` converts timestamps as UTC text, since the columns have no time zone.

**Devices and associations**: `ColdUnitDevice` is the ESP32 board, owned by an enterprise and identified by a normalized MAC (`src/lib/macAddress.ts`). `AssociationHistory` links a board to a `ColdUnit`; `endDate` null means active. A partial unique index added by hand in the migration, which `schema.prisma` cannot express, allows one active association per board, while a unit can have several boards. `BindDeviceService` is the QR Code handshake: in one transaction it closes the old association, opens the new one and moves the board's quarantined data into official readings as `HISTORICAL`.

**Telemetry**: `IngestTelemetryService` is the single entry point, used by the public `POST /telemetry/readings` route and the MQTT subscriber in `src/services/mqtt/mqttSubscriber.ts` (`REALTIME` and store-and-forward `HISTORICAL` topics). It drops data from unknown or inactive boards, then looks up the association in force at the reading's timestamp, not its arrival time. With one, it calls `CreateTemperatureReadingService`, which stores the reading and raises alerts through `buildTemperatureAlert`. Without one, the data goes to `UnboundTelemetry`, which `GET /devices/unbound` reports (`Alert` requires a `coldUnitId`, so it cannot represent this) and `src/jobs/purgeExpiredTelemetry.ts` clears after expiry.

**Soft delete**: `Enterprise`, `User` and `ColdUnit` have `isDeleted`. The client extension in `src/lib/prisma.ts` turns `delete`/`deleteMany` into updates and filters reads, so services call them normally (the explicit `isDeleted: false` in services is redundant). It does not cover `findUnique`, which uniqueness checks rely on to see deleted rows, or relation filters and includes, which need their own `isDeleted: false`. Its `delete` runs outside `$transaction`, so inside a transaction use `update`/`updateMany` with `isDeleted: true`.

## Known incomplete state

The code does not currently match itself in these places; check before relying on them:

- `src/app.ts` and `src/config/auth.ts` are empty.
- `req.user` is declared twice with different shapes: `src/@types/express/index.d.ts` (full) and `src/types/express.d.ts` (optional, `enterpriseId` only).
