# Jenkins Build Analyzer

A React + Vite web app prototype for analyzing Jenkins `testReport` JSON across multiple builds.

## What this app does

- Loads sample multi-build test data by default.
- Computes flaky tests, regressions, fixed tests, pass/fail trends, and suite-level health.
- Supports importing additional builds from Jenkins `/testReport/api/json` payloads.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## Jenkins JSON endpoint

Use this endpoint per build:

```text
/job/<name>/<build#>/testReport/api/json
```
