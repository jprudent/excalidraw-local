{ lib, buildNpmPackage }:

buildNpmPackage {
  pname = "excalidraw-local";
  version = "0.1.0";

  src = ../app;

  # npm >= 10 needs fetcher version 2 so the offline cache can answer the peer
  # resolution `npm ci` performs for React and @excalidraw/excalidraw.
  npmDepsFetcherVersion = 2;
  npmDepsHash = "sha256-0fe4Wt5GgcEg0UxTpZIB/0+h3FU5FJ2sGCBUcmPCNck=";

  # esbuild and @parcel/watcher try to fetch or compile native helpers that the
  # Vite build does not need; the npm cache already has their binaries.
  npmRebuildFlags = [ "--ignore-scripts" ];

  installPhase = ''
    runHook preInstall
    mkdir -p $out
    cp -r dist/. $out/
    # Fonts and diagram data live in the npm package, not in the JS bundle.
    # index.html points EXCALIDRAW_ASSET_PATH at these copies.
    cp -r node_modules/@excalidraw/excalidraw/dist/prod/fonts $out/fonts
    cp -r node_modules/@excalidraw/excalidraw/dist/prod/data $out/data
    runHook postInstall
  '';

  meta = {
    description = "Excalidraw editor built as a static site for local use";
    homepage = "https://github.com/excalidraw/excalidraw";
    license = lib.licenses.mit;
    platforms = lib.platforms.unix;
  };
}
