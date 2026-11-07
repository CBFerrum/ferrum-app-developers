<div align="center">

# Ferrum Developer Hub

[![CI](https://github.com/CBFerrum/ferrum-app-developers/actions/workflows/ci.yml/badge.svg)](https://github.com/CBFerrum/ferrum-app-developers/actions/workflows/ci.yml) ![Version](https://img.shields.io/badge/version-0.1.0-0f766e?style=flat-square) ![Ferrum](https://img.shields.io/badge/Ferrum-%3E%3D0.3.2%2C%20%3C0.4-2f5bea?style=flat-square) ![License](https://img.shields.io/badge/license-AGPL--3.0-3b82f6?style=flat-square) ![Rust](https://img.shields.io/badge/Rust-native%20app-b7410e?style=flat-square&logo=rust&logoColor=white) ![Interface](https://img.shields.io/badge/interface-React%20%2B%20Vite-0ea5e9?style=flat-square&logo=react&logoColor=white)

**A native app for [Ferrum](https://github.com/CBFerrum/Ferrum), the open-source, AI-first business platform.**

[Overview](#overview) · [What it shows](#what-it-shows) · [How it works](#how-it-works) · [Install](#install) · [Develop](#develop) · [Changelog](#changelog)

</div>

---

## Overview

The Developer Hub is where someone building on a Ferrum workspace starts: what the workspace offers
(its REST API, the MCP endpoint for AI agents, events, apps of one's own), its API reference read
from the workspace's own OpenAPI document, the events each kind of record gives, and their API keys.
It has no records of its own: it reads everything through the platform's APIs as the person, so it
shows them only what they may see, and a key they make acts with their rights.

| At a glance | |
|---|---|
| 📦 Version | `0.1.0` |
| 🧱 Platform | Ferrum `>=0.3.2, <0.4` |
| 🖥️ Interface | its own, at `/developers/` |
| 🗃️ Records | none of its own |
| 🧪 Tests | 2 Rust tests (one against a real database), 1 interface test file |

## What it shows

- **Overview**: the REST API at `/api/v1/{Entity}` with a key or the session, the MCP endpoint at
  `/mcp`, webhooks and service apps, and the SDK that builds, signs and publishes apps.
- **API reference**: every operation of the workspace's OpenAPI document (`/api/openapi.json`, built
  from its metadata, so it lists the records the person may see), by record type, searchable; each
  with its parameters, and for reads a form that sends the request as the person and shows the answer.
  Changes are made from one's own code: the page only reads.
- **Events**: each record type's topics (`Customer.created`, `SalesInvoice.submitted`), which a webhook
  or a service app names, and what a delivery carries.
- **Your keys**: the person's API keys, made with an expiry and shown once, revoked at once.

## How it works

The interface is React with Ferrum-Frontend's kit, built into `ui/dist` and embedded in the crate;
the Ferrum server compiles the crate in and serves the interface at `/developers/`. It calls
`/api/openapi.json`, `/api/meta` and `/api/auth/api_keys`, as anyone's page does.

## Install

It is compiled into Ferrum's server (the `developers` feature, on by default): an administrator adds
it from Apps.

## Develop

```text
app.yaml      the manifest
src/          the crate: the manifest and the interface, embedded
ui/           its own interface (React + Vite), built into ui/dist
tests/        what the hub says, held by the platform it runs on
CHANGELOG.md  what changed in each version
```

Build the interface with Ferrum-Frontend checked out at `../ferrum/web`:

```bash
cd ui && npm run build && npm run check && npm test
```

## Changelog

| Version | Highlights |
|---|---|
| **0.1.8** | Rebuilt with Ferrum-Frontend 6537d65: once-shown answers kept; English isolated right to left; its own words translatable by a workspace. |
| **0.1.7** | Rebuilt with Ferrum-Frontend d5d98f2: a workspace's own interface words; pictures in attachment fields; a duplicate value said so; its own screens mirror right to left. |
| **0.1.6** | Rebuilt with Ferrum-Frontend 63280d3: right to left, pages mirror; the records pages' words in Arabic and Hindi. |
| **0.1.5** | Rebuilt with Ferrum-Frontend a64416a: a box whose default is 1 shows ticked. |
| **0.1.4** | Rebuilt with Ferrum-Frontend 922fcfb: action dialogs say every refusal and ask once. |
| **0.1.3** | Rebuilt with Ferrum-Frontend a76295e: times on a person's own clock when they chose one. |
| **0.1.2** | Rebuilt with Ferrum-Frontend 24c3951: times on the workspace's clock; drafts headed as drafts. |
| **0.1.1** | Rebuilt with Ferrum-Frontend bb60115: empty numbers read as the server reads them; settings open as their record. |
| **0.1.0** | The Developer Hub: an overview of what the workspace offers, its API reference with reads to try, the events each record gives, and the person's API keys. |

## License

AGPL-3.0-only.
