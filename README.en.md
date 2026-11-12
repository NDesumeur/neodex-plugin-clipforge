# ClipForge

The text workshop: stacked steps that transform your text live, and templates with blanks.

*Version française : [README.md](README.md)*

![ClipForge](screenshots/1.jpg)

## Transform

On the left the input text, in the middle the recipe, on the right the result, updated on every key. A recipe is a list of steps applied in order:

- **case**: UPPERCASE, lowercase, Each Word, sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT, URL slug, no accents;
- **lines**: spaces at line edges or doubled, empty lines, duplicate lines, sort (A → Z with numbers in the right order, or by length), reverse, number, keep or remove the lines containing a text;
- **search**: replace, extract, split into lines, join lines, wrap each line. Write `/pattern/` for a regular expression (`$1` in the replacement, `\n` for a line break);
- **encodings**: Base64 (accents and emojis included), URL, HTML, indented or compact JSON.

A failing step (a malformed JSON for example) gets a pink frame with the error. Recipes are saved under a name to be replayed. **Use as input** starts again from the result, **↓ .txt** saves it.

## Templates

Texts with blanks: write `{nom}`, `{sujet}`… and a field appears for each. `{date}`, `{heure}` and `{jour}` fill themselves. Three templates to start with (follow-up email, bug report, meeting notes).

The history of what you copy is in another plugin: **Presse-papiers** (Clipboard).

## Data

The current text, the recipes and the templates are kept in the plugin folder. Permission: `storage` only (the **Paste** button asks for clipboard access; otherwise, Ctrl+V).
