<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/banner-dark.svg">
  <img alt="Ferrum Developer Hub: the API, events and keys of your workspace" src="docs/assets/banner-light.svg" width="100%">
</picture>

<br>

[![Version](https://img.shields.io/badge/version-0.1.13-0f766e?style=flat-square)](CHANGELOG.md)
[![Licence: AGPL-3.0](https://img.shields.io/badge/licence-AGPL--3.0-blue?style=flat-square)](LICENSE)
[![Ferrum platform](https://img.shields.io/badge/runs%20on-Ferrum-2f5bea?style=flat-square)](https://github.com/CBFerrum/Ferrum)
![Rust](https://img.shields.io/badge/Rust-server-b7410e?style=flat-square&logo=rust)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-data-336791?style=flat-square&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-TypeScript-0ea5e9?style=flat-square&logo=react&logoColor=white)
![Tests](https://img.shields.io/badge/tests-2%20Rust%20%2B%204%20UI-16a34a?style=flat-square)

### Start building on your Ferrum workspace: its API reference, its events and your keys, in one place.

The Developer Hub is where someone who writes code against a workspace begins. It reads the workspace's own API description, so it lists the records you may see and the way to reach them, and it lets you make and revoke the keys your programs sign in with. It replaces a hand-kept API page and a thread of "how do I get a key" messages.

[💡 Why](#-why-developer-hub) · [📸 Screenshots](#-screenshots) · [✨ Features](#-features) · [📊 Compare](#-how-it-compares) · [📍 Roadmap](#-roadmap) · [🚀 Install](#-install) · [🔧 Develop](#-develop)

</div>

## 💡 Why Developer Hub

- 📖 **The reference is your workspace's.** It is read from the workspace's own OpenAPI document, built from its metadata, so a record type you added in Studio is in it at once.
- 🔒 **It shows what you may see.** The hub has no records and reads everything as you. A person without rights on a record type does not see its operations.
- 🔑 **A key is you, in a script.** A key acts with its maker's rights and no more, until it expires or is revoked. It is shown once.
- 🧪 **Try a read without leaving the page.** Fill the parameters, press Send, and see the answer as you would get it.
- 📣 **Events are listed.** Each record type's topics are on one page, with what a delivery carries, so a webhook or a service app can name them.
- 🤖 **AI agents are first-class.** The overview points to the Model Context Protocol endpoint, where an agent signs in with OAuth or a key and acts with your rights.
- 🧩 **Open source, AGPL, no records of its own.** Nothing here can drift from the platform: it only reads the platform's APIs.

## 🎯 At a glance

| | |
|---|---|
| 📦 Version | `0.1.13` |
| 🧱 Kind | Own interface at `/developers/` |
| 🗃️ What it adds | No entities, no roles, no reports, no print formats, no menus of records, no upkeep |
| 🔗 Depends on | Ferrum `>=0.3.2, <0.4` |
| 🤝 Works with | Every app: it documents whatever records the workspace has |
| 🌍 Languages | English, Arabic and Hindi (translated by a model, to be reviewed by native speakers) |
| 🧪 Tests | 2 Rust tests (one against a real PostgreSQL), 4 interface tests |
| 📄 Licence | AGPL-3.0-only |

## 📸 Screenshots

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/screens/developers-home-dark.webp">
  <img alt="Developer Hub home" src="docs/assets/screens/developers-home-light.webp" width="100%">
</picture>

<p align="center"><b>🏠 Developer Hub home</b><br><sub>Find the API reference, the event catalogue and your keys in one place.</sub></p>

<table>
<tr>
<td width="50%" valign="top">
<picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/screens/developers-api-reference-dark.webp"><img alt="API reference" src="docs/assets/screens/developers-api-reference-light.webp"></picture>
<p><b>📖 API reference</b><br><sub>Search the operations of your workspace, open one, and try a read as yourself.</sub></p>
</td>
<td width="50%" valign="top">
<picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/screens/developers-events-dark.webp"><img alt="Events" src="docs/assets/screens/developers-events-light.webp"></picture>
<p><b>📣 Events</b><br><sub>See the events the platform publishes, to react to them in other systems.</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/screens/developers-keys-dark.webp"><img alt="Your keys" src="docs/assets/screens/developers-keys-light.webp"></picture>
<p><b>🔑 Your keys</b><br><sub>Create a key with an expiry, copy it once, and revoke it when you are done.</sub></p>
</td>
<td width="50%" valign="top"></td>
</tr>
</table>

<p align="center">
<picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/screens/developers-home-phone-dark.webp"><img alt="Developer Hub home on a phone" src="docs/assets/screens/developers-home-phone-light.webp" width="260"></picture>
</p>

<p align="center"><b>📱 On a phone</b><br><sub>The same home page on a narrow screen.</sub></p>

## ✨ Features

### 🏠 Overview

Four tabs run along the top (Overview, API reference, Events, Your keys). The address is the tab, so a page can be linked to and reloaded.

- **The REST API.** Every record you may see is at `{origin}/api/v1/{Entity}`, with a key or your session. A `curl` sample with your workspace's own address in it has a Copy button.
- **For AI agents.** The same records and actions are on the Model Context Protocol at `{origin}/mcp`. An agent signs in with OAuth or a key and acts with your rights.
- **Events.** What changed, as webhooks signed with a secret (`X-Ferrum-Signature`), or sent to an app that runs on your own servers. An administrator also sees a link to Webhooks in Administration.
- **Apps of your own.** A metadata app, a sandboxed WebAssembly plugin, or a service on your servers (`runtime: service`). The SDK, `ferrum-sdk`, and its CLI build, sign and publish them to a store.
- **Your keys.** A pointer to the keys page, with a reminder that a key acts as you.

### 📖 API reference

- **Read from your workspace.** It loads `/api/openapi.json`, which is built from the workspace's metadata, so it lists the records the signed-in person may see.
- **Grouped and sorted.** Operations are grouped by record type (tag) and sorted by tag, path and method. A badge shows the method: blue for GET, red for DELETE, green for the others.
- **Search.** Type words such as an entity, a path or an action. An operation matches when its tag, path, summary or method holds every word. The search is kept in the address (`?q=`), so a result can be shared. A line says "N of M operations".
- **Parameters.** Each operation opens to a table of its parameters: name (a `*` marks a required one), where it goes (path or query) and type. An operation that takes a body says it takes the record's fields as JSON.
- **Try a read.** For GET operations, fill the path and query parameters and press Send. The request goes from your session, so you get the answer you would get. Send waits until every path parameter has a value, the request path is shown as it will go, and long answers are cut at 20,000 characters.
- **Writes are not sent from here.** For POST, PUT, PATCH and DELETE the page says changes are made from your own code.
- **Honest states.** Loading shows skeletons; a refusal (403) shows as denied, no connection as offline, and anything else as failed with a retry; no match offers to clear the search.

### 📣 Events

- **Topics by record type.** A webhook or a service app names the topics it hears: `Customer.created`, `Customer.updated`, `Customer.deleted`, and for records that are submitted, `submitted` and `cancelled` too. Child records, which are never on their own, are left out.
- **What a delivery carries.** A sample shows the shape: entity, id, event, actor and the record. A webhook's delivery carries the record; a service app's names it, and the app reads it.
- **Find a record type.** A search box filters by name or label.
- **Held by the platform.** A test makes, updates and deletes a customer and checks that the platform records exactly the topics this page names.

### 🔑 Your keys

- **Make a key.** Name it ("Nightly export"), choose when it expires (30 days, 90 days, a year, or never; 90 is the default) and press Make the key.
- **Shown once.** The secret appears with a Copy button and the line "Copy it now: it is not shown again." It leaves the page when anything is revoked.
- **Your list.** Each live key shows its name, its prefix, a scope badge if it has one, when it was made, when it was last used and when it expires.
- **Revoke.** A confirmation says whatever uses the key stops working at once. Revoked keys leave the list.
- **Rights, tested.** A test shows that a key acts as its maker (an administrator's key writes customers), that a key made by a person with no rights on customers has none either, that keys are made for oneself only, and that a revoked key stops at once.

### 🌍 Language, accessibility and fit

- **Languages.** English, Arabic and Hindi are built in, with right-to-left mirroring.
- **Readable.** Tabs by keyboard, scrollable code samples that can be focused, labels on every control, and states that say what went wrong.
- **Phone friendly.** The hub works on a narrow screen.
- **The assistant.** Ferrum's assistant knows the hub has no records of its own. For a question about the API it describes the entity and answers from that, and it never shows a key's secret. It suggests "How do I create a sales invoice through the API?" and "Which events does a Sales Invoice give?".

## 🧭 How it works

```mermaid
flowchart LR
    P["Person in the browser"] --> HUB["Developer Hub at /developers/"]
    HUB -- "GET /api/openapi.json" --> API["Ferrum server"]
    HUB -- "GET /api/meta" --> API
    HUB -- "GET, POST, DELETE /api/auth/api_keys" --> API
    HUB -- "Send: a read as the person" --> API
    API --> K["Kernel: permissions and row-level security"]
    K --> DB[("PostgreSQL")]
    KEY["Program with a key"] -- "/api/v1 and /mcp" --> API
```

The interface is React on Ferrum-Frontend's kit, built into `ui/dist` and embedded in the crate. The Ferrum server compiles the crate in and serves the interface at `/developers/`. The hub never holds a record: every answer comes from the platform's APIs, as the person.

## 🧱 Data model

The hub adds no entities, roles, reports or print formats. It uses three platform endpoints:

| Endpoint | Used for |
|---|---|
| `/api/openapi.json` | The operations on the reference page |
| `/api/meta` | The record types on the events page, and whether each is submittable |
| `/api/auth/api_keys` | Listing, making and revoking the person's keys |

A key as the hub shows it holds: id, name, prefix, when it was made, when it expires, when it was revoked, when it was last used and an optional scope.

## 🔌 Integrations

| With | How | Needs |
|---|---|---|
| The REST API | Documented and tried from the reference | A key or a session |
| MCP (Model Context Protocol) | Explained on the overview | OAuth or a key |
| Webhooks | Topics listed here; managed in Administration | An administrator |
| Service apps and the SDK | Described on the overview; `ferrum-sdk` builds and publishes them | The SDK |
| Every installed app | Its records appear in the reference and event lists by themselves | Nothing extra |

## 📊 How it compares

The closest products are the developer areas of platforms and API tools: Stripe's dashboard and docs, Shopify's developer tools, Postman, and the open-source Backstage portal. They differ in what they are for, so the table shows what a developer expects to find.

| Capability | Ferrum Developer Hub | Stripe | Shopify | Postman | Backstage |
|---|:-:|:-:|:-:|:-:|:-:|
| API reference for your own data model | ✅ | ➖ | ➖ | 🟡 | 🟡 |
| Reference reflects the viewer's rights | ✅ | ❌ | ❌ | ➖ | ❌ |
| New record types appear automatically | ✅ | ➖ | ➖ | 🟡 | 🟡 |
| Search the operations | ✅ | ✅ | ✅ | ✅ | ✅ |
| Try a read from the browser | ✅ | ✅ | ✅ | ✅ | ✅ |
| Try writes from the browser | ❌ | ✅ | ✅ | ✅ | ✅ |
| Code samples in many languages | ❌ | ✅ | ✅ | ✅ | 🟡 |
| Self-service API keys with expiry | ✅ | ✅ | ✅ | ➖ | ❌ |
| A key acts with its maker's rights | ✅ | ➖ | ➖ | ➖ | ➖ |
| Event catalogue | ✅ | ✅ | ✅ | ➖ | ❌ |
| Manage webhook endpoints here | 🟡 | ✅ | ✅ | ❌ | ❌ |
| Delivery logs and replay | ❌ | ✅ | 🟡 | ❌ | ❌ |
| API request logs | ❌ | ✅ | 🟡 | ❌ | ❌ |
| Sandbox or test mode | ❌ | ✅ | ✅ | ➖ | ➖ |
| CLI and SDKs | 🟡 | ✅ | ✅ | ✅ | ✅ |
| Saved requests and collections | ❌ | ❌ | ❌ | ✅ | ❌ |
| Mock servers | ❌ | ❌ | ❌ | ✅ | ❌ |
| Software catalogue of services and owners | ❌ | ➖ | ➖ | 🟡 | ✅ |
| Open source and self-hosted | ✅ | ❌ | ❌ | ❌ | ✅ |
| No records of its own to keep in step | ✅ | ➖ | ➖ | ➖ | ➖ |

Notes: the platform's keys can carry a scope and the hub shows it, but the hub makes whole-API keys. Stripe and Shopify scope keys by permission, a different model, so that row is not applicable to them. Webhooks are managed in Administration, which the hub links to, hence 🟡. Backstage reads definitions registered in its catalogue and does not know your workspace's records on its own.

### 🏆 Where Developer Hub stands out

- 📖 **It is your workspace's reference.** Custom records, rights and all, with nothing to publish.
- 🔑 **Keys that are you.** One rule, the person's rights, for the reference, the keys and the agents.
- 🏠 **Self-hosted and open.** Run it where the workspace runs.

### 🚧 Where the leaders are still ahead

- 🧪 **Test mode.** Stripe and Shopify give a sandbox to build against.
- 📋 **Logs and replay.** Delivery and request logs are not in the hub.
- 💻 **Samples and tooling.** Code in many languages, saved collections and mocks are Postman's ground.
- ✍️ **Try writes.** The hub only reads.

> [!NOTE]
> Leader columns are from public product information as of November 2026 and may change.

## 📍 Roadmap

### ✅ Recently shipped

- [x] **0.1.13** Rebuilt on the tuned design system: better menu icons, a lighter first page, a visible scroll cue, cleaner print.
- [x] **0.1.12** The redesigned interface: the kit's tabs, cards with headings, code samples with a Copy button, shaped loading and told-apart states.
- [x] **0.1.11** Names in Arabic and Hindi; the last English sentences translated.
- [x] **0.1.10** The assistant knows the hub.
- [x] **0.1.9** Its own words in Arabic and Hindi.
- [x] **0.1.8** Once-shown answers kept; English isolated right to left.
- [x] **0.1.0** The hub: overview, API reference with reads to try, events, and keys.

### 🔜 Next up

- [ ] **Copy as curl.** A Send that also gives the exact command to run elsewhere.
- [ ] **Code samples** in more languages beside curl.
- [ ] **Scope on a new key.** Today the hub makes whole-API keys and shows a key's scope if the platform gave it one.
- [ ] **Webhook endpoints here.** Today an administrator manages them in Administration.

### 🔭 Later

- [ ] Try writes (POST, PUT, PATCH, DELETE) with a confirmation.
- [ ] Delivery logs and replay for webhooks.
- [ ] A log of a key's recent requests.
- [ ] Download the OpenAPI document.
- [ ] A test or sandbox workspace shortcut.
- [ ] Saved requests.

## 🚀 Install

It is compiled into the Ferrum server (the `developers` feature, on by default). A workspace administrator adds it from **Apps** (`/store/`). It needs nothing installed first and creates no records. After installing, it appears in the launcher as **Developer Hub**. Anyone in the workspace can open it; what they see and what their keys can do follow their rights.

## 🔧 Develop

Build the interface with Ferrum-Frontend checked out at `../ferrum/web`:

```bash
cd ui && npm run build && npm run check && npm test
```

The Rust tests need PostgreSQL with an ordinary (non-superuser) role, so row-level security applies. The integration test resets the public schema of its database first, so give it a database of its own:

```bash
createuser ferrum --pwprompt && createdb -O ferrum ferrum_developers_test
export FERRUM_DEVELOPERS_TEST_DATABASE_URL=postgres://ferrum:ferrum@localhost:5432/ferrum_developers_test
cargo test
```

CI runs `cargo fmt -- --check`, `cargo clippy --all-targets -- -D warnings` and `cargo test`, then for the interface `npm run check`, `npm run typecheck` and `npm test`. `ui/dist` is committed, because the crate embeds it, and must be built from `ui/` as it is.

## 📂 Project layout

```text
app.yaml      the manifest
src/          the crate: the manifest and the interface, embedded
ui/src/       Hub.tsx (the four pages), openapi.ts (operations, search, request paths, topics), locales
ui/dist/      the built interface, committed and embedded
tests/        hub_it.rs: what the hub says, held by the platform it runs on
build.rs      embeds ui/dist
CHANGELOG.md  what changed in each version
```

## 📜 Changelog

Every version is in [CHANGELOG.md](CHANGELOG.md).

## 🤝 Contributing

Issues and pull requests are welcome at [github.com/CBFerrum/ferrum-app-developers/issues](https://github.com/CBFerrum/ferrum-app-developers/issues).

## 📄 License

[AGPL-3.0-only](LICENSE), like the platform.

<div align="center">

<sub>Part of <a href="https://github.com/CBFerrum/Ferrum">Ferrum</a>, the open business platform · Made with 🦀 Rust and 🐘 PostgreSQL</sub>

</div>
