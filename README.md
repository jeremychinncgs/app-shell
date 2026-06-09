# @cgsi/app-shell

Shared CGSI app header + role-aware launcher. Consumed by all CGSI apps as a
git dependency pinned to a tag, transpiled from source via Next's
`transpilePackages`. Pure presentation: the consuming app passes the session
user (`{ email, apps }`) and `authHostUrl` as props.

See `docs/superpowers/specs/2026-06-09-cgsi-app-shell-launcher-design.md` in the
CGSI Brain repo for the design.

## Consuming app wiring
1. `package.json`: `"@cgsi/app-shell": "github:jeremychinncgs/app-shell#v1.0.0"`
2. `next.config.mjs`: `transpilePackages: ["@cgsi/app-shell"]`
3. `globals.css`: `@source "../../node_modules/@cgsi/app-shell/src";`
4. `auth.ts`: a `session` callback exposing `session.user.apps = token.apps`
5. layout: `<Header currentApp="…" user={{email, apps}} authHostUrl={…} />`
