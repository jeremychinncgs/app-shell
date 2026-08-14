# @cgsi/app-shell

Shared CGSI app header + role-aware launcher, **and the design system** every
Brain app renders through. Consumed as a git dependency pinned to a tag,
transpiled from source via Next's `transpilePackages`. Pure presentation: the
consuming app passes the session user (`{ email, apps }`) and `authHostUrl` as
props.

See `docs/superpowers/specs/2026-06-09-cgsi-app-shell-launcher-design.md` in the
CGSI Brain repo for the launcher design.

## Consuming app wiring
1. `package.json`: `"@cgsi/app-shell": "github:jeremychinncgs/app-shell#v1.0.0"`
2. `next.config.mjs`: `transpilePackages: ["@cgsi/app-shell"]`
3. `globals.css`:
   ```css
   @import "tailwindcss";
   @source "../../node_modules/@cgsi/app-shell/src";
   @import "@cgsi/app-shell/styles.css";
   ```
4. `layout.tsx`: `import { display, body } from "@cgsi/app-shell/fonts";` and put
   `` className={`${display.variable} ${body.variable}`} `` on `<html>`
5. `auth.ts`: a `session` callback exposing `session.user.apps = token.apps`
6. layout: `<Header currentApp="…" user={{email, apps}} authHostUrl={…} />`

## Design system

Three CSS layers, loaded in order by `@cgsi/app-shell/styles.css`:

| File | Holds | Edited when |
| --- | --- | --- |
| `src/styles/brand.css` | colour tokens (dark + light), font stacks, `--content-max` | the brand changes |
| `src/styles/base.css` | reset, type scale, form-control chrome | rarely |
| `src/styles/components.css` | `.chip`, `.filter-pill`, `.course-row`, `.subject-row`, `.drawer*`, `.empty-state` | a pattern reaches four apps |

Rules that keep it a system rather than fifteen near-copies:

- **An app never redeclares a design-system token.** If an app needs a colour
  that is not in `brand.css`, it belongs in `brand.css`. An app-local `@theme`
  block is the failure mode this package exists to end.
- **Every colour token in `@theme` needs a light-mode value**, unless it is
  deliberately theme-invariant and says so in a comment. Surfaces, text, accent
  and status all need one. Discipline and event-category hues are identity and
  stay fixed across themes. A token that is dark-only paints a navy panel on a
  white page, which is exactly what `--color-surface-3` did in seven apps
  before 1.27.
- **Discipline colours are not status colours.** `--color-gamedesign` and
  `--color-attention` share a hex; they do not share a meaning. Use the one
  that matches what you are communicating, so a later palette change can move
  them apart.
- **App CSS loads after this package**, so an app can still override a shared
  component at equal specificity. Do that as a stopgap, not a habit — a second
  app wanting the same override means the shared rule is wrong.

### Rebranding

Edit `src/styles/brand.css`, swap the TTFs in `src/fonts/` if the typefaces
change, bump the version, tag it, then bump the pin in each consuming app. That
is the whole surface — no app repo holds a brand value of its own.
