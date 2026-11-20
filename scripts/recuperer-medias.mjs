// Récupère les vraies photos et les extraits vidéo d'un épisode (à lancer sur le Mac, avant le push).
//
// Utilisation :
//   node scripts/recuperer-medias.mjs episodes/<id>.json                 (récupère seulement ce qui manque)
//   node scripts/recuperer-medias.mjs episodes/<id>.json --refaire scene,stade   (refait certains fichiers)
//
// Outils nécessaires sur le Mac (une seule fois) :  brew install ffmpeg yt-dlp
//
// Dans le fichier de l'épisode, une séquence avec un champ "source" est récupérée par ce script :
//   Vraie photo :  "type": "illustration", "image": "illustrations/<id>/scene.jpg",
//                  "source": { "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Nom.jpg?width=1600" }
//   Extrait vidéo : "type": "video", "video": "videos/<id>/stade.mp4",
//                  "source": { "url": "https://www.youtube.com/watch?v=...", "debut": "1:05", "duree": 8,
//                              "cadrage": "flou" (vidéo entière sur fond flou, par défaut) ou "recadre" (plein écran),
//                              "x": 50 (avec "recadre" : partie gardée, de 0 = gauche à 100 = droite) }
//
// Les extraits sont toujours enregistrés SANS SON (-an) : aucune musique d'origine dans la vidéo finale.
// Penser à créditer la source (champ "mention" de la séquence et "credit" de l'épisode).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fichier = process.argv[2];
if (!fichier) {
  console.error("Utilisation : node scripts/recuperer-medias.mjs episodes/<id>.json [--refaire nom1,nom2]");
  process.exit(1);
}
const iRefaire = process.argv.indexOf("--refaire");
const refaire = iRefaire > 0 ? (process.argv[iRefaire + 1] || "").split(",").filter(Boolean) : [];
const episode = JSON.parse(fs.readFileSync(path.resolve(fichier), "utf8"));

const outil = (nom) => {
  try {
    execFileSync(nom, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    try {
      execFileSync(nom, ["--version"], { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
};

/** "1:05" ou "65" ou 65 -> 65 secondes */
const secondes = (t) => {
  if (typeof t === "number") return t;
  return String(t || "0")
    .split(":")
    .reduce((acc, x) => acc * 60 + Number(x), 0);
};
const hms = (s) => {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    r = (s % 60).toFixed(2).padStart(5, "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${r}`;
};

const aFaire = [];
for (const l of episode.lignes) {
  const s = l.sequence || {};
  if (!s.source?.url) continue;
  const cible = s.video || s.image || s.photo;
  if (!cible) continue;
  const nom = path.basename(cible).replace(/\.[a-z0-9]+$/i, "");
  const chemin = path.join(RACINE, "public", cible);
  const forcer = refaire.includes(nom) || refaire.includes(String(l.id));
  if (fs.existsSync(chemin) && !forcer) continue;
  aFaire.push({ id: l.id, nom, chemin, cible, video: Boolean(s.video), source: s.source });
}

if (!aFaire.length) {
  console.log("✅ Rien à récupérer : toutes les photos et tous les extraits sont déjà là.");
  process.exit(0);
}
if (!outil("ffmpeg")) {
  console.error("❌ ffmpeg manque. Tape : brew install ffmpeg yt-dlp");
  process.exit(1);
}
if (aFaire.some((a) => a.video) && !outil("yt-dlp")) {
  console.error("❌ yt-dlp manque. Tape : brew install yt-dlp");
  process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "medias-"));
let erreurs = 0;
for (const a of aFaire) {
  fs.mkdirSync(path.dirname(a.chemin), { recursive: true });
  try {
    if (!a.video) {
      // Vraie photo : téléchargée puis ramenée à 1600 px de large au plus (fichier léger)
      const rep = await fetch(a.source.url, {
        headers: { "User-Agent": "DossiersDecryptes/1.0 (video documentaire; contact via GitHub Boubashmd)" },
        redirect: "follow",
      });
      if (!rep.ok) throw new Error(`téléchargement refusé (${rep.status})`);
      const brut = path.join(tmp, `${a.nom}-brut`);
      fs.writeFileSync(brut, Buffer.from(await rep.arrayBuffer()));
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", brut, "-vf", "scale='min(1600,iw)':-2", "-q:v", "3", a.chemin]);
    } else {
      // Extrait vidéo : seulement l'image (pas de son), seulement le passage voulu
      const debut = secondes(a.source.debut);
      const duree = Number(a.source.duree || 8);
      const brut = path.join(tmp, `${a.nom}-brut.%(ext)s`);
      execFileSync(
        "yt-dlp",
        [
          "-q",
          "--no-playlist",
          "-f",
          "bv*[height<=1080][ext=mp4]/bv*[height<=1080]/bv*/b",
          "--download-sections",
          `*${hms(debut)}-${hms(debut + duree)}`,
          "--force-keyframes-at-cuts",
          "-o",
          brut,
          a.source.url,
        ],
        { stdio: "inherit" },
      );
      const telecharge = fs.readdirSync(tmp).find((f) => f.startsWith(`${a.nom}-brut.`));
      if (!telecharge) throw new Error("yt-dlp n'a rien téléchargé");
      const x = Math.min(100, Math.max(0, Number(a.source.x ?? 50))) / 100;
      const filtre =
        a.source.cadrage === "recadre"
          ? `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(iw-ow)*${x}:(ih-oh)/2,fps=30,format=yuv420p[v]`
          : "[0:v]split[a][b];" +
            "[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=30,eq=brightness=-0.12[fond];" +
            "[b]scale=1080:1920:force_original_aspect_ratio=decrease[img];" +
            "[fond][img]overlay=(W-w)/2:max(0\\,(H-h)/2-110),fps=30,format=yuv420p[v]";
      execFileSync("ffmpeg", [
        "-y",
        "-loglevel",
        "error",
        "-i",
        path.join(tmp, telecharge),
        "-t",
        String(duree),
        "-filter_complex",
        filtre,
        "-map",
        "[v]",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "24",
        "-movflags",
        "+faststart",
        a.chemin,
      ]);
    }
    const ko = Math.round(fs.statSync(a.chemin).size / 1024);
    console.log(`✅ ${a.cible} (${ko} Ko)`);
  } catch (e) {
    erreurs++;
    console.error(`❌ ${a.cible} : ${e.message}`);
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
if (erreurs) {
  console.error(`\n${erreurs} fichier(s) non récupéré(s). Relance la commande ; si ça bloque encore, envoie ce message à Claude.`);
  process.exit(1);
}
console.log("\nTerminé. Pense à ajouter les fichiers au dépôt (git add public/illustrations public/videos).");
