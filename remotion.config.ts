import { Config } from "@remotion/cli/config";

// Les effets (@remotion/effects : vignette, grain…) utilisent WebGL : il faut ce moteur pendant le rendu.
Config.setChromiumOpenGlRenderer("angle");
