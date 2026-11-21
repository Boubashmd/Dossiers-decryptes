import { Config } from "@remotion/cli/config";

// Les effets (@remotion/effects : vignette, grain…) utilisent WebGL pendant le rendu.
// GitHub (Linux, sans carte graphique) : « swangle » = WebGL calculé par le processeur (SwiftShader).
// Mac : « angle » utilise la carte graphique.
Config.setChromiumOpenGlRenderer(process.platform === "linux" ? "swangle" : "angle");
