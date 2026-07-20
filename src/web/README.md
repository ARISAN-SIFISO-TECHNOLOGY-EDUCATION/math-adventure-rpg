# `src/web/` — Community Edition feature area

Web-only features for the **Community Edition** (the innovation lab). Each folder is a boundaried
home for a feature that ships on the web build but **never** in the frozen Google Play (Stable/LTS)
edition. Introduced **2026-07-10** as a Phase B scaffold — **no gameplay logic lives here yet**.

| Folder | Feature flag | What it will hold |
|---|---|---|
| `story-theatre/` | `storyTheatre` | Narrated story cutscenes / theatre moments. |
| `living-world/` | `livingWorld` | A living overworld (this app's OWN world — not Number Kingdom). |
| `animations/` | `animations` | Advanced animation layer. |
| `advanced-ui/` | `animations` | Large-screen, keyboard & mouse affordances. |
| `community/` | `community` | Community features. |

## How gating works

Every feature is inert unless its flag is on. Gate with the platform seam:

```ts
import { isEnabled } from '../platform/featureFlags';
if (isEnabled('storyTheatre')) { /* mount the feature */ }
```

`isEnabled` is true only when the **build profile** enables the flag **and** we are on the **web
shell** — so nothing here can ever appear in the Play build (Stable Build Principle). See
`../platform/README.md`.
