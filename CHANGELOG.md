# Changelog

## 0.3.0

Needs the same platform as 0.2.0. No database change. Interface rebuilt.

- **Code samples.** Each operation in the reference shows its request in curl, JavaScript (`fetch`) and Python
  (`requests`), with a Copy button: the values filled in so far, path and query encoded as the page sends them, the key
  read from `FERRUM_KEY` (a sample never holds one), `Idempotency-Key` on a create, an update or an action, `If-Match`
  on what changes a record, and a body of the required fields a caller writes with a placeholder of each type; a secret
  is left out for the caller to type. The Overview's first request is made the same way.

## 0.2.1

Needs the same platform as 0.2.0. No database change. Interface rebuilt.

- **A record can be tried by its id.** The workspace's API document puts a record's `id` on the path, shared by its
  methods; the reference read only each method's own parameters, so `GET /api/v1/{Entity}/{id}` had no `id` field
  and Send never enabled. A path's parameters are now taken with the operation's (the operation's own winning).
- **Every topic a record gives.** The Events page names `Entity.opened` for every record, as the platform lists it,
  and says that a record with a workflow also gives `Entity.transitioned`. A test holds the page's list to the
  platform's.
- **An expired key says so.** It stays in the list, marked Expired, until it is revoked.
- **One version.** `Cargo.toml`, `app.yaml` and the README all say 0.2.1 (the README said 0.1.14), and a test keeps
  them together.
- The route table moved to `ui/src/routes.tsx`, so the interface's tests mount the real one.

## 0.2.0

Needs Ferrum 0.4.0 (apps' upkeep runs one workspace at a time, on whichever replica is free).

- **Upkeep takes the workspace.** `maintenance(k, tenant)` is still empty; only its signature follows the platform's.

No database or interface change.

## 0.1.14

Needs the same platform as 0.1.13. No database change. Interface only, `ui/dist` rebuilt with Ferrum-Frontend `06bd1a2`.

- The page starts through the frontend's `mountApp`; the interface lint has no baseline file any more.

## 0.1.13

Rebuilt with Ferrum-Frontend 9e7190c, the design system as tuned after the landed build was reviewed. The left menu's icons are chosen so that none repeats on more than three rows and each fits its row; their drawings load beside the first page instead of inside it, so the page starts lighter; a row that scrolls sideways fades at the edge where there is more, in every browser and with reduced motion; a printed record leaves out empty fields and keeps its totals with the table; menus and popovers sit inside the page's landmarks for assistive technology; a selection bar folds what does not fit into More on a narrow screen. Nothing else changes.

## 0.1.12

The interface follows the upgraded design system, rebuilt with Ferrum-Frontend 76c4fad. Text uses the kit's type roles (nothing under 12px) and controls its height tokens; loading shows skeletons shaped like what is coming; empty, no matches, denied, offline and failed are told apart; status colours come from stored state ids. The interface check now runs the UI lint against an empty baseline. The Developer Hub loads the kit's base stylesheet (the previous release drew it unstyled) and is recomposed: one page title, the kit's tabs, cards with headings, code samples with a Copy button, the keys form on the kit's field row.

## 0.1.11

Rebuilt with Ferrum-Frontend 43d7779: the names of its models, fields and manifest in Arabic and Hindi (5 each in ui/src/locales/names, which the platform serves to every page of the workspace, so a record's labels, the launcher and the bar read in the person's language), and the sentences its pages still showed in English (split around a link or a figure, built in code from a template or word by word) whole and translated (51 words each in ui/src/locales). Translated by the model, to be reviewed by native speakers.

## 0.1.10

The assistant knows what its records mean in its pages (contributes.shell.assistant): their states, what counts and where figures come from, with questions it suggests asking there.

## 0.1.9

Rebuilt with Ferrum-Frontend 389b2af: its own words carry built-in Arabic and Hindi (58 words each, ui/src/locales, translated by the model and to be reviewed by native speakers), fetched for the page's language only. The labels it keeps in objects, its dialogs, its page titles and the words it keeps in variables go through t() as well, and the names and sizes it shows as they are keep their order right to left. Its pages are drawn once their words are in, and its entry carries only the parts of the kit it uses.

## 0.1.8

Rebuilt with Ferrum-Frontend 1f5981d: an action's link, code or token shown once is kept in a dialog to copy, and on a page that reads right to left, English left untranslated keeps its own order. Its own words go through the kit's t() (62 places), so a workspace's own words for its language reach them, and Admin, Interface words lists them under it (dist/words.json).

## 0.1.7

Rebuilt with Ferrum-Frontend 8a1c2e7: a workspace's own words for its interface (Admin, Interface words) reach its pages as they load; an attachment field that holds a picture shows it; and a value another record already has is said so, where the form said the record had been changed by someone else. Its own screens' margins, paddings, borders, alignment and insets go by the line's start and end, so they mirror right to left as the kit's do; what it places by coordinates (boards, timelines, charts, handles) stays as it was.

## 0.1.6

Rebuilt with Ferrum-Frontend 9d80f4f: right to left, its pages mirror as they read (icons that point along the line, margins and alignment by the line's start and end, arrow keys along it), and the records pages' words are in Arabic and Hindi.

## 0.1.5

Rebuilt with Ferrum-Frontend 204b713: a new record's box whose default is 1 shows ticked, as it is saved.

## 0.1.4

Rebuilt with Ferrum-Frontend 6cfda39: an action's dialog says every refusal, the errors on what the action made (another record's rows) among them, and an action with parameters and a confirmation asks once.

## 0.1.3

Rebuilt with Ferrum-Frontend b39fffb: its pages show times on a person's own clock when they chose one on their Account page, while today and due dates stay on the workspace's day.

## 0.1.2

Rebuilt with Ferrum-Frontend d350579: its pages show times on the workspace's clock, naming the zone when it is not the browser's, a draft numbered on submit is headed as a draft, and a record of an app that is not installed says so.

## 0.1.1

Rebuilt with Ferrum-Frontend 20d08e5: a record page reads an empty number or check as the server does, so an action whose condition needs one shows, and a workspace's settings open as their one record.

## 0.1.0

The Developer Hub, at `/developers/`: an overview of what the workspace offers someone building on
it (the REST API, the MCP endpoint, events, apps of one's own); the API reference read from the
workspace's own OpenAPI document, searchable, with reads to try as the person; the events each
record type gives, which webhooks and service apps name; and the person's API keys, made with an
expiry, shown once and revoked at once.
