# excalidraw-local

Excalidraw's editor as a static site you can host yourself, packaged as a Nix
flake.

- **Offline by default.** The JS bundle, fonts and diagram data are served from
  the same directory; nothing is fetched from a CDN at runtime.
- **Reproducible.** npm dependencies are pinned by `app/package-lock.json` and
  fetched with a Nix hash, so the site comes from the store.
- **Browser-based.** No Electron or Tauri: serve the directory and open it.
- **Persistence in `localStorage`.** Drawings survive a reload; export
  `.excalidraw` files for real backups.

This is the editor component (`@excalidraw/excalidraw`), not excalidraw.com:
there is no collaboration, no share links and no cloud library.

## Usage

```nix
{
  inputs.excalidraw-local.url = "github:jprudent/excalidraw-local";

  # then, for example:
  # excalidraw-local.packages.${system}.excalidraw
}
```

Build and serve it:

```console
$ nix build .#excalidraw
$ miniserve --interfaces 127.0.0.1 --port 8484 --index index.html --spa result
# open http://127.0.0.1:8484/
```

`--index index.html` and `--spa` make the server return the app shell instead of
a directory listing and for unknown paths. Bind to localhost: the app has no
authentication.

## Development

```console
$ cd app
$ npm install
$ npm run build   # writes app/dist/

$ npx playwright install --with-deps chromium
$ npm run test:e2e
```

Requires Node.js 20 or newer. The Playwright test serves the built app, checks
that the editor renders, draws a rectangle, verifies the scene is persisted in
`localStorage`, and fails on any request outside the local origin.

CI builds the Nix package on `x86_64-linux` and `aarch64-linux` and runs the
render test on `x86_64-linux`. The macOS outputs are advertised but not covered
by CI.

## Updating Excalidraw

1. Bump `@excalidraw/excalidraw` in `app/package.json` (exact version, no
   range).
2. Regenerate the lockfile: `cd app && npm install --package-lock-only`.
3. Set `npmDepsHash` in `nix/package.nix` to `lib.fakeHash`, run
   `nix build .#excalidraw`, and copy the reported `got:` hash.
4. Bump `version` in `nix/package.nix` if the wrapper version changes too.
5. Run `nix flake check`, `npm run test:e2e` and confirm `index.html`, the
   fonts and the diagram data are still present.

The font/data paths (`node_modules/@excalidraw/excalidraw/dist/prod/{fonts,data}`)
and `window.EXCALIDRAW_ASSET_PATH` are the two upstream details this packaging
depends on; check them first when a bump breaks rendering.

## Prior art

Excalidraw has no standalone build. Projects that solve nearby problems, and why
this flake exists next to them:

- [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) — the
  official MIT monorepo. `excalidraw-app/` is the hosted app; its supported
  self-hosting path is the Docker image, and building the workspace is heavy for
  a single static directory.
- [burnt0rice/excalidraw-desktop](https://github.com/burnt0rice/excalidraw-desktop)
  and its maintained forks — a Tauri desktop wrapper (Rust + WebKit) that
  vendors a prebuilt Excalidraw bundle. Good for a native window, but
  platform-specific and not packaged for Nix.
- [ThatXliner/excalidraw-local](https://github.com/ThatXliner/excalidraw-local) —
  an unmodified fork of the upstream monorepo from 2024; it does not add a local
  build.
- Recent local-first editors (for example
  [xcalidraw](https://github.com/xdagiz/xcalidraw),
  [excalideck](https://github.com/GokulAnand14/excalideck),
  [excalidraw-multi-tabs](https://github.com/MontejoJorge/excalidraw-multi-tabs))
  focus on file management or native windows and do not ship a Nix package.

## License

MIT. Excalidraw is MIT too; the fonts and diagram data in the build come from
the `@excalidraw/excalidraw` npm package.
