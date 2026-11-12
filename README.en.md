# ClipForge

NeoDex's video editor, in the spirit of CapCut: an 8-track timeline, 13 transitions, styled and animated texts, stickers, 16 effects, 14 filters, and video export.

*Version française : [README.md](README.md)*

![ClipForge](screenshots/1.jpg)

## The library (left)

- **Media**: import videos, images and sounds (or drop them on ClipForge), add a **solid background**; a click places the media at the end of its track.
- **Text**: a plain text or one of 10 ready-made styles (Subtitle, Title, Outline, Neon, Bubble, Retro, Typewriter, Label…).
- **Stickers**: 40 emojis placed at the playhead.
- **Effects**: vignette, grain, VHS, glitch, flash, shake, pulse zoom, cinema bars, black and white, blur, pixels, snow, confetti, rain, stars, hearts. They apply to the whole picture below them.
- **Transitions**: 13 entries and exits (fade, slide, rise, drop, zoom, zoom out, wipe, circle, blur, flash, spin, glitch) for the selected clip.
- **Filters**: 14 looks previewed on your clip.

## Tracks

Texts 2, Texts, Effects, Overlay (above the video), Video, Sound 1, Sound 2 and Music. Videos show their filmstrip, sounds their waveform.

- **Dragging a clip** moves it, also to another track of the same kind; **dragging its edges** trims it. The 🧲 magnet snaps clips to the start, the playhead and the edges of other clips.
- Tools: **cut**, **duplicate**, **delete**, **ripple delete**, **freeze frame** (2 s), **detach audio** from a video, undo, redo.
- The dot in front of each track mutes or restores it.

## Clip settings (right)

- **Picture**: size, position, rotation, opacity, fill the frame, **blurred background**, mirrors.
- **Animation**: entry and exit transitions with their duration, and a motion during the clip (slow zoom, zoom out, pan, shake, pulse, spin, float).
- **Colour**: the looks and 8 settings (brightness, contrast, saturation, black and white, sepia, hue, blur, pixels).
- **Sound**: speed from ×0.1 to ×8, volume up to 200%, fades.
- **Text**: 8 fonts, colour, size, alignment, outline, shadow (drop, soft, glow), background (band or bubble) and animation (typewriter, word by word, pop, bounce, wave, beat).

## Export

With no clip selected, the right panel sets the project: **format** (16:9, 9:16, 1:1, 4:5, 4:3, 21:9), background colour, **quality** (480p, 720p, 1080p), **frames per second** (24, 30, 60) and **file** (WebM, or MP4 when the recorder supports it). **PNG image** saves the picture under the playhead. Export films the edit in real time with its mixed sounds: keep ClipForge open until the end.

## Controls

| Key | Action |
|---|---|
| Space | play / pause |
| S | cut under the playhead |
| Del / Shift+Del | delete / ripple delete |
| Ctrl+C / Ctrl+V | copy / paste the clip at the playhead |
| Ctrl+D | duplicate |
| ← → | previous / next frame |
| Home | back to start |
| Ctrl+Z / Ctrl+Y | undo / redo |

## Data

The edit is kept in the plugin folder, with media of 15 MB or less. A bigger media stays in the list but must be picked again next time (it is marked "To re-import"). Edits from earlier versions open as they are. Permission: `storage` only.
