{ runCommand, excalidraw }:

# Guards the pieces the browser needs at runtime, without starting a server.
runCommand "excalidraw-local-check" { } ''
  set -eu
  test -f ${excalidraw}/index.html
  grep -q 'window.EXCALIDRAW_ASSET_PATH = "/"' ${excalidraw}/index.html
  test -n "$(find ${excalidraw}/assets -maxdepth 1 -name '*.js' -print -quit)"
  test -n "$(find ${excalidraw}/fonts -name '*.woff2' -print -quit)"
  test -n "$(find ${excalidraw}/data -name '*.js' -print -quit)"
  touch $out
''
