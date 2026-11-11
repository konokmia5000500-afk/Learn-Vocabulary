# Learn Vocabulary (PWA) – version 0.0.3

English words with Bengali meanings. Works offline after the first visit.

## Publish on GitHub Pages
1. Create a repository and upload EVERYTHING in this folder (keep the `data` and `icons` folders).
2. Settings > Pages > Branch `main` / root > Save.
3. Open `https://USERNAME.github.io/REPO/` in Chrome. Menu > Add to Home screen / Install app.

## Updating
If you change any file, change `V='lv-v3'` at the top of `sw.js` (e.g. `lv-v4`) so Chrome refreshes the offline cache.

## Credits
Fonts: Noto Sans/Serif Bengali, Playfair Display (SIL OFL, see fonts/LICENSE-fonts-OFL.txt).
Word data: BengaliDictionary by Minhas Kamal (GPL-3.0, see LICENSE-data.txt), filtered with word-frequency ranks from the `wordfreq` package.
