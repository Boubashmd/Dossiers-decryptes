# Dossiers Décryptés — consignes pour Claude Code

Chaîne TikTok **Dossiers Décryptés** (ancien nom : Dossiers Classés, changé le 08/11/2026 ; identifiant @dossiersdecryptes) : récits animés d'affaires vraies et sourcées, et depuis le 08/11/2026 des « dossiers expliqués » (fonctionnement d'un système, fait de société : retraite, chômage…), toujours neutres et sourcés (sources officielles : COR, Cour des comptes, Unédic, INSEE, service-public.fr). En français. Vidéo fabriquée avec Remotion 4.0.545 (depuis le 21/11/2026 ; skills officiels Remotion dans `.claude/skills`).
Ce dépôt est **séparé** de Flash Monde et de Kalia et Kouli : ne jamais toucher à ces projets.

## L'utilisateur
- Ingénieur IT débutant. **Depuis le 13/11/2026, il ne tape plus de commandes** : Claude (dans le projet claude.ai) pousse lui-même le fichier de l'épisode sur GitHub, puis l'utilisateur colle seulement un message à Claude Code, qui fait tout le reste sur le Mac (git pull, illustrations, vérifications, commit, push) sans lui demander de commandes. Ne lui demander une action que si rien d'autre n'est possible.
- Ne jamais lui demander ses clés ou mots de passe (ElevenLabs : variable `ELEVENLABS_API_KEY`, qu'il règle lui-même).
- Répondre d'abord aux questions avant d'agir. Jamais `git add -A` : ajouter seulement les fichiers modifiés.
- Ne rien pousser sur GitHub sans son accord (le message qu'il colle vaut accord pour le commit et le push qu'il décrit).

## Ligne éditoriale
- Faits établis, au moins 2 sources par fait ; tout fait non prouvé est attribué (« selon… »).
- Suspects non jugés : ne pas les nommer. Pas de mots sensibles écrits à l'écran (bombe, arme…), pas d'explication technique de piratage, ne jamais valoriser un criminel (modération TikTok).
- Illustrations : depuis le 02/11/2026, des illustrations générées par IA (style gravure blanche sur bleu nuit) ; une image générée par IA n'imite jamais une vraie photo et ne montre jamais de visage reconnaissable.
- **Vraies photos (décision de l'utilisateur, 13/11/2026)** : autorisées sur toutes les nouvelles vidéos, en couverture comme dans la vidéo, visages compris, même sans droits libres (photos de presse, Instagram, documents officiels). Elles s'ajoutent aux illustrations générées, sans les remplacer. L'utilisateur accepte le risque de retrait par TikTok ; **au premier avertissement de TikTok, on arrête** les photos non libres (retour aux seules illustrations générées et aux documents officiels publics). Toujours créditer la source dans la description (« Photo : … (via …) »). Seules limites, pour éviter un procès ou un bannissement : pas de photo de suspect non jugé, de victime ou d'enfant, rien de choquant.

## Illustrations (méthode hybride, depuis le 02/11/2026)
- Script : `node scripts/generer-illustrations.mjs <fichier.json> [--refaire id1,id2]` (clé `GEMINI_API_KEY` dans le Terminal, jamais dans un fichier). Il ne génère que les images manquantes.
- Coût : seule l'image d'**accroche** utilise le modèle Pro (~0,13 $) ; toutes les autres le modèle simple (~0,04 $). Budget visé : ~0,45–0,60 € par épisode (plus d'illustrations depuis le 13/11/2026).
- Par épisode (depuis le 13/11/2026, à la demande de l'utilisateur : « ça donne plus envie ») : 1 accroche + **8 à 11 illustrations propres à l'histoire** (séquence `illustration` avec `prompt`), soit environ 5 de plus qu'avant selon les épisodes. Le reste en images communes et en séquences codées gratuites (compteur, document, tampon, carte, chronologie…).
- **Bibliothèque commune** à réutiliser avant de générer quoi que ce soit : `public/illustrations/commun/<nom>.jpg` (JPG qualité 85 pour alléger le dépôt ; image de style : `reference.jpg`) (liste et prompts dans `bibliotheque/commune.json`) :
  tribunal, marteau, cellule, barreaux, menottes, police, interrogatoire, commissariat, loupe, dossier, billets, lingots, coffre, hacker, ecoute, camera, avion, aeroport, mappemonde, paris, newyork, bourse, journaux, ombre, journalistes, banque, diamants, enveloppe, horloge, empreinte.
- Style imposé (champ `style` du JSON) + image de référence (`reference`) pour garder le même rendu. Pour les images générées : jamais de visage reconnaissable, jamais de rendu photo (les vraies photos sont permises, voir « Ligne éditoriale »).
- Séquence `illustration` : `image`, `titre`, `focus {x,y}` (%), `zoom [début, fin]`, `etiquettes [{texte, x, y, dx, dy}]` (x, y en % de l'écran) : vérifier visuellement leur position sur l'image. Options : `legende`, `heure` (effet vidéosurveillance, ex. « 19/10/2025 10:27 »), `tampon`. Depuis le 21/11/2026, vignette bleu nuit et grain de pellicule sur les images (CSS/SVG, `VignetteGrain`), pas sur les extraits vidéo ; `"effets": false` les retire d'une séquence. Ne pas utiliser `@remotion/effects` (WebGL) : 7 fois plus lent sur GitHub, un épisode dépasserait la limite d'une heure.
- **Vraies photos et extraits vidéo (20/11/2026)** : une séquence avec un champ `source` est récupérée sur le Mac par `node scripts/recuperer-medias.mjs <fichier.json> [--refaire nom1,nom2]` (outils : `brew install ffmpeg yt-dlp`), qui ne récupère que ce qui manque. Vraie photo : séquence `illustration` avec `image` + `source {url}` (Wikimedia Commons : `https://commons.wikimedia.org/wiki/Special:FilePath/<Fichier>.jpg?width=1600`), options `cadrage: "flou"` (photo entière sur fond flou, pour les photos en largeur), `position` (ex. « 50% 30% »), `mention` (crédit à l'écran, obligatoire pour une licence CC BY / CC BY-SA). Extrait vidéo : séquence `video` (mêmes options que `illustration`) avec `video: "videos/<id>/<nom>.mp4"` + `source {url, debut: "1:05", duree: 8, cadrage: "flou" | "recadre", x}`. **Les extraits sont toujours muets** (son supprimé au téléchargement et `muted` au rendu) : jamais de musique d'origine, pour éviter la détection TikTok. Extraits courts (6 à 10 s), 3 ou 4 par vidéo au plus ; si l'extrait est plus court que la phrase, sa dernière image reste figée. `scripts/preparer.mjs` refuse de fabriquer si une image, photo ou vidéo citée manque dans `public/`. **Depuis le 28/11/2026, le workflow GitHub lance aussi `recuperer-medias.mjs` avant la préparation** (installe ffmpeg si besoin, et yt-dlp seulement si l'épisode a une séquence `video`) : les vraies photos et extraits avec un champ `source` sont donc téléchargés au moment de la fabrication, même s'ils ne sont pas dans le dépôt. Les committer depuis le Mac reste préférable (cadrage vérifié, fabrication plus rapide).

## Format d'un épisode (`episodes/<id>.json`)
- Une ligne = une phrase lue + une séquence animée (`src/sequences/index.tsx`, liste dans `README.md`).
- Prononciation : un sigle mal lu par la voix s'ajoute dans `config.json` → `prononciation` (mot écrit → comment le dire, sans espace, avec des tirets). L'utilisateur veut les sigles américains dits à l'américaine : "FBI": "èf-bi-aï" (et non « effe-bé-i »). La voix reçoit la prononciation, les sous-titres gardent le mot écrit ; seules les phrases concernées sont refaites (et payées).
- Ouverture : séquence `accroche` (image + gros titre jaune dès la 1re image, phrase 1 très courte). Pas de générique au début.
- Fin : question à deux choix (« réponds 1 ou 2 ») + abonnement.
- Durée : 2 min 30 à 3 min. Zone sûre TikTok : rien d'important sous ~1200 px (sous-titres à 1250 px).
- Couleurs : bleu nuit #0B1626, crème #ECE6D8, jaune #FFD400, rouge #E6504A ; police Poppins.

## Logo (refonte du 07/11/2026 : « le dossier qui regarde »)
- Nom dessiné : DOSSIERS + tampon rouge DÉCRYPTÉS (les deux É portent l'accent en forme d'œil). Script qui redessine les SVG : `scripts/logo/build_decryptes.py` (besoin de fonttools). Images de marque (profil, bannière, logos PNG) : compositions `Profil`, `Banniere`, `LogoHorizontal`, `LogoVertical` (`src/Marque.tsx`).
- Fichiers dans `public/logo/` : `horizontal-couleur.svg`, `vertical-couleur.svg`, `symbole-couleur.svg`, `symbole-blanc.svg` (transparents, pour fond bleu nuit). Composants dans `src/Logo.tsx` : `Signature` (en-tête de l'accroche, de la couverture et du carrousel) et `Filigrane`.
- Filigrane : symbole blanc à 60 % en haut à gauche, de 1 s jusqu'à la séquence `cta`/`fin` (qui montre le logo). Désactivable avec `"filigrane": false` dans `config.json`. Jamais à droite ni en bas (boutons et légende TikTok).
- Ne pas retaper le nom avec une police, ne pas déformer ni recolorer le logo. Règles complètes : guide d'usage du kit du logo.

## Commandes
- **Rendu sur GitHub uniquement (depuis le 21/11/2026)** : Remotion 4.0.545 exige macOS 15 pour lire vidéo et son ; ce Mac est en macOS 13. En local, seulement des images fixes (`still`) de séquences sans extrait vidéo ; toute vidéo complète, tout extrait et toute vérification du son passent par le workflow GitHub (Linux). Mettre à jour Remotion seulement via `npx remotion upgrade`, sur une branche, testée par un run GitHub avant fusion.
- Préparer sans voix : `node scripts/preparer.mjs episodes/<id>.json --sans-voix`
- Préparer avec voix : `node scripts/preparer.mjs episodes/<id>.json` (demande `ELEVENLABS_API_KEY`)
- Vidéo : `npx remotion render src/index.ts Episode sorties/<id>/<id>.mp4 --crf=20`
- Couverture : `npx remotion still src/index.ts Couverture sorties/<id>/couverture.png`
- Image d'un instant : `npx remotion still src/index.ts Episode sorties/test.png --frame=<n>`
- Studio (aperçu interactif) : `npm run studio`

## Fabrication en ligne
GitHub Actions « Fabriquer un épisode » (`.github/workflows/fabriquer-episode.yml`), entrée `episode` = id, « avec voix ».
Après le push des illustrations : si `gh` est installé et connecté (`gh auth status`), Claude Code lance lui-même le workflow (`gh workflow run fabriquer-episode.yml -f episode=<id> -f voix="avec voix"`), suit le run (`gh run watch`), puis télécharge la vidéo dans `<id>/` à la racine (voir « Livraison »). Sinon, il s'arrête après le push et le dit : Claude (projet) lance le workflow depuis GitHub. Ne jamais lancer deux fois le même épisode (vérifier `gh run list` avant).
**Sans le Mac (28/11/2026)** : quand l'utilisateur ne peut pas être au Mac, Claude (projet) fait tout depuis GitHub : il remplace les illustrations à générer par des images déjà présentes dans le dépôt (`commun/` ou épisodes précédents), laisse les vraies photos à télécharger par le workflow, puis lance lui-même « Fabriquer un épisode ». Gemini n'est pas disponible sur GitHub tant qu'aucun secret `GEMINI_API_KEY` n'existe dans le dépôt.

## Livraison de la vidéo finale
Toujours dans un dossier `<id>/` à la **racine** du projet (comme `affaire-11-louvre-2/`), avec 3 fichiers : `<id>.mp4`, `couverture.png`, `description.txt`. Jamais dans `sorties/` ni dans un sous-dossier. Ces dossiers ne sont pas versionnés (ne pas les ajouter à git).
