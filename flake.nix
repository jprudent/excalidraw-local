{
  description = "Excalidraw as a local, offline static web app";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f (import nixpkgs { inherit system; }));
    in
    {
      packages = forAllSystems (
        pkgs:
        let
          site = pkgs.callPackage ./nix/package.nix { };
        in
        {
          excalidraw = site;
          default = site;
        }
      );

      checks = forAllSystems (pkgs: {
        default = pkgs.callPackage ./nix/check.nix {
          excalidraw = self.packages.${pkgs.system}.excalidraw;
        };
      });

      formatter = forAllSystems (pkgs: pkgs.nixpkgs-fmt);
    };
}
