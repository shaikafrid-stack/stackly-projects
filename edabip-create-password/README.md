# EDABIP – Create New Password screen

React (Vite) + Tailwind CSS implementation of the Create New Password screen.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## States covered

1. **Default** – empty fields, dark-green Update button.
2. **Passwords do not match** – the confirm field turns into the pink "Your passwords do not match"
   banner (click it to edit again) and Update turns grey.
3. **Too short** – red hint "Password must be at least 8 characters" under the first field.

## Structure

```
public/
  bg.jpg          teal glow + shield / padlock / circuit artwork (full-bleed background)
  logo-mark.png   EDABIP "S" mark (transparent)
  badge.png       round logo badge, bottom-right
src/
  App.jsx                         page layout (left panel, card, footer, badge)
  components/CreatePasswordCard.jsx   form + validation
  components/PasswordInput.jsx        input with show/hide toggle
  components/FeatureList.jsx          4 feature rows
  components/Logo.jsx, icons.jsx
```

Font: Lato (bundled via `@fontsource/lato`, works offline).

## Notes

- The images in `public/` were extracted from the design screenshots, so their resolution is limited.
  For pixel-perfect output on large/retina screens, export the originals from Figma (bg as JPG/PNG @2x,
  logo/badge as SVG or PNG @2x-3x) and replace them using the same file names.
- Hook up your API in `handleSubmit` in `src/App.jsx`.
