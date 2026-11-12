# ClipForge

Le monteur vidéo de NeoDex : une timeline à plusieurs pistes, des transitions, des textes, des effets, et l'export en vidéo.

*English version: [README.en.md](README.en.md)*

![ClipForge](screenshots/1.jpg)

## Monter

- **Importer** des vidéos, des images et des sons (ou les glisser sur ClipForge), puis cliquer sur un média pour le poser au bout de sa piste.
- **Cinq pistes** :
  - **Textes**, par-dessus tout ;
  - **Vidéo 2**, par-dessus Vidéo 1 (pour une incrustation, réduis sa taille) ;
  - **Vidéo 1** ;
  - **Son 1** et **Son 2**, pour la musique et les bruitages.
- **Glisser un clip** le déplace, aussi vers une autre piste du même genre. **Glisser ses bords** le rogne. Les clips s'aimantent au début, à la tête de lecture et aux bords des autres clips.
- **Couper** (S) coupe le clip choisi sous la tête de lecture, ou tous les clips sous elle si aucun n'est choisi.
- Le carré devant chaque piste la coupe ou la remet.
- **Annuler** et **Rétablir** (Ctrl+Z, Ctrl+Y) reviennent sur chaque changement.

## Régler un clip

Clique sur un clip pour ouvrir ses réglages :

- **entrée** : fondu, glisse, zoom ou volet, avec sa durée, et un **fondu de sortie** ;
- **taille**, **position** et **remplir le cadre** pour les images et les vidéos ;
- **effets** : luminosité, contraste, saturation, noir et blanc, sépia, teinte, flou, pixels, et des looks d'un clic (Noir et blanc, Ancien, Vif, Froid, Nuit, Rétro pixel) ;
- **vitesse** de ×0,25 à ×4 et **volume** jusqu'à 200 % pour les vidéos et les sons ;
- **textes** : plusieurs lignes, police, couleur, taille, fond sombre.

## Exporter

Choisis le **format** (paysage 16:9, portrait 9:16 ou carré 1:1), puis **Exporter en WebM**. Le montage est filmé en temps réel avec ses sons mixés : garde ClipForge ouvert jusqu'au bout. La vidéo arrive dans tes Téléchargements.

## Commandes

| Touche | Action |
|---|---|
| Espace | lecture / pause |
| S | couper sous la tête de lecture |
| Suppr | effacer le clip choisi |
| ← → | image précédente / suivante |
| Origine | revenir au début |
| Ctrl+Z / Ctrl+Y | annuler / rétablir |

## Données

Le montage est gardé dans le dossier du plugin, avec les médias de 15 Mo au plus. Un média plus gros reste dans la liste mais il faut le choisir à nouveau à la prochaine ouverture (il est marqué « À réimporter »). Autorisation : `storage` seulement.

Les recettes et modèles de texte de l'ancienne version de ClipForge ne sont plus utilisés ; ils restent dans le dossier du plugin.
