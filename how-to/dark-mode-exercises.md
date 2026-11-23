# Learning: Build Dark Mode Yourself

A guided project in 7 exercises. **Nothing here is built yet. That's the point.**
You write the code; this page tells you what to aim for, where the traps are
in *this* codebase, and how to check you got it right.

Each exercise has:
- **Goal:** what should work when you're done.
- **Hints:** read these if you're stuck. Try first.
- **Answer:** hidden (click to open). Check *after* you've tried.
- **Check:** how to prove it works.

Do them in order. Each one builds on the last. Make a git branch first so
you can experiment freely:

```bash
git checkout -b dark-mode
```

Written 2026-11-18, against the code as it was then. If a file has moved,
search for the name in quotes.

---

## Before you start: how colors work on this site

Open [`src/styles/global.css`](../src/styles/global.css). At the top:

```css
:root {
  --background: hsl(42, 40%, 97%);   /* warm ivory */
  --foreground: hsl(0, 10%, 15%);    /* near-black text */
  --primary:    hsl(359, 73%, 29%);  /* brand maroon */
  --card, --border, --muted-foreground, --accent-soft, --accent-warm …
}
```

These are **design tokens**: named colors. Components almost never say
"ivory". They say `bg-[var(--background)]` or `text-[var(--foreground)]`.

That's why dark mode is very doable here: **change the values of the
tokens, and most of the site follows.** Your whole job is:

1. Give each token a dark value.
2. Decide *when* the dark values apply (the visitor's system setting, or a
   button).
3. Fix the places that **don't** use tokens. There are a handful, and
   finding them is the real learning.

Three words you'll see:

| Term | Meaning |
| --- | --- |
| `prefers-color-scheme` | The visitor's operating-system setting (light or dark). CSS can read it. |
| `data-theme="dark"` | An attribute *we* put on `<html>` when the visitor picks dark with a button. |
| FOUC / "flash" | The page briefly shows light before switching to dark. Exercise 4 fixes this. |

**One past decision to know about:** the comment at the top of `global.css`
says *"Light-only palette (committed)."* Dark mode reverses that. When you
finish, update that comment and add a CHANGELOG entry saying why.

---

## Exercise 1: Dark colors from the system setting (CSS only)

**Goal:** if your computer is in dark mode, the site's tokens switch to dark
values. No button yet, no JavaScript.

**Where:** `src/styles/global.css`, right after the `:root { … }` block.

**Starter palette.** You may tune it, but these values pass contrast checks:

| Token | Light (now) | Dark (suggested) |
| --- | --- | --- |
| `--background` | `hsl(42, 40%, 97%)` | `hsl(0, 8%, 10%)` |
| `--foreground` | `hsl(0, 10%, 15%)` | `hsl(40, 25%, 92%)` |
| `--card` | `hsl(40, 40%, 95%)` | `hsl(0, 6%, 14%)` |
| `--muted-foreground` | `hsl(0, 6%, 45%)` | `hsl(30, 8%, 68%)` |
| `--border` | `hsl(38, 18%, 86%)` | `hsl(0, 5%, 24%)` |
| `--accent-soft` | `hsl(18, 30%, 90%)` | `hsl(0, 15%, 18%)` |
| `--accent-warm` | `hsl(24, 82%, 56%)` | keep the same |
| `--primary` | `hsl(359, 73%, 29%)` | ⚠️ leave it for now. See Exercise 2, trap C |

<details><summary><b>Hints</b></summary>

- A CSS media query can wrap a selector: `@media (…) { :root { … } }`.
- You only re-declare the tokens that change. Everything else is inherited
  from the first `:root`.
- Tailwind reads the tokens through `@theme inline`, so you don't touch that
  block at all.

</details>

<details><summary><b>Answer</b></summary>

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: hsl(0, 8%, 10%);
    --foreground: hsl(40, 25%, 92%);
    --card: hsl(0, 6%, 14%);
    --muted-foreground: hsl(30, 8%, 68%);
    --border: hsl(0, 5%, 24%);
    --accent-soft: hsl(0, 15%, 18%);
  }
}
```

</details>

**Check:** `npm run dev`. In Chrome DevTools: `⋮` → **More tools →
Rendering** → **Emulate CSS media feature prefers-color-scheme → dark**.
The page should go dark. **Parts of it will look wrong.** Good: that's
Exercise 2.

---

## Exercise 2: The bug hunt

**Goal:** find and fix everything that looks wrong in dark mode.

Leave DevTools emulating dark and walk every page: home, /what-we-do,
/volunteer, /volunteer/apply, /contact, /gallery, /journal, /faq, /history.
Write down each problem *before* reading the traps below. Then compare.

### The traps in this codebase

**A. The footer turns light.** 😮
`Footer.tsx` uses `bg-[var(--foreground)]`. The footer *borrows the text
color* as its background, because near-black text made a nice dark footer.
In dark mode, `--foreground` is nearly white, so the footer flips to a light
panel.
- *Fix idea:* give the footer its own token (e.g. `--footer-bg`) that stays
  dark in both themes.
- *Lesson:* **a token should mean one job.** Reusing "text color" as "footer
  color" works until the values change.

**B. The navbar stays light grey.**
`Navbar.tsx` hard-codes `bg-[#e5e5e5]` in **three** places: the bar, the
scrolled bar (`/80`), and the mobile menu. None of them are tokens.
- *Fix idea:* a `--nav-bg` token. Don't forget the mobile menu: open it at
  390px wide to check.
- *Also check:* the logo (`/newlogo.png`) on the dark bar. Does it still read?

**C. Maroon text disappears.**
`--primary` (dark maroon) is used two ways:
1. As **text** on the page background: links, `.eyebrow` labels, "Learn
   more". On a dark background it's barely visible.
2. As a **band background** with white text: the Support Us and Newsletter
   sections, and admin buttons. Here the dark maroon is *right*.

If you lighten `--primary`, (1) is fixed but (2) breaks (white text on light
pink). This is the most interesting decision in the project. Options:
- Lighten `--primary` in dark mode, and give the bands a new token
  (`--primary-band`) that stays dark maroon. **Recommended.**
- Or keep `--primary` dark and add a `--link` token for text. That means
  changing more files.

There's already a lightened maroon: `--primary-on-dark` (≈7:1 on dark).
Reuse it.

**D. Shadows vanish.**
Cards use shadows like `shadow-[0_18px_40px_-16px_rgba(40,18,20,0.28)]`, a
dark brown shadow. On a dark page, it's invisible. That's mostly fine (dark
UIs rely on borders and lighter surfaces instead), but check the cards still
look separated from the page. If not, lighten `--card` a little or strengthen
`--border`.

**E. Form fields and scrollbars stay light.**
Browsers draw native controls (checkboxes, scrollbars, date pickers) in
light style unless told otherwise.
- *Fix:* the CSS property `color-scheme`. One line inside your dark block.

**F. Photo sections: probably fine.**
The hero, photo headers, Moments mosaic and lightbox use `text-white` on
black gradients *on purpose*. They should look the same in both themes.
Don't "fix" them. Just confirm.

**G. Small one-offs.** Search for these and decide each:

```bash
# hard-coded colors outside global.css
grep -rnE "#[0-9a-fA-F]{3,6}\b|rgba?\(|hsl\(" src --include=*.tsx --include=*.astro
# white/black utilities (most are on photos, and correct)
grep -rnE "(bg|text|border)-(white|black)" src --include=*.tsx --include=*.astro
```

Watch especially: `MediaPlaceholder.tsx`, `EmergencyNotice.astro` (it must
stay very readable: it's the crisis notice), and the footer's
`text-[hsl(42,40%,92%)]`.

**H. Bonus bug that has nothing to do with dark mode:**
`global.css` maps `--color-rb-teal: var(--rb-teal)`, but `--rb-teal` is
never defined. Leftover from the old teal palette. Delete the line or
define it.

<details><summary><b>Answer for trap E (the one-liner)</b></summary>

```css
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    /* …your tokens… */
  }
}
```

</details>

<details><summary><b>Answer sketch for traps A + C</b></summary>

```css
:root {
  --footer-bg: hsl(0, 10%, 15%);      /* same as old --foreground */
  --primary-band: var(--primary);     /* bands stay maroon */
}
@media (prefers-color-scheme: dark) {
  :root {
    --footer-bg: hsl(0, 10%, 7%);     /* a bit darker than the page */
    --primary: var(--primary-on-dark);
    /* --primary-band is NOT overridden: still dark maroon */
  }
}
```

Then in `Footer.tsx`: `bg-[var(--foreground)]` → `bg-[var(--footer-bg)]`.
In `DonateBlock.tsx` and `Newsletter.tsx`: `bg-[var(--primary)]` →
`bg-[var(--primary-band)]`. Search for every `bg-[var(--primary)]` (there are
several in admin pages too) and decide for each one: band or text?

</details>

**Check:** walk all pages again in dark. Then switch DevTools back to light
and walk them again. **Light mode must look exactly like it did before.**
That's the easiest thing to break without noticing.

---

## Exercise 3: Let a button override the system

**Goal:** the theme can be forced by an attribute on `<html>`:

| `<html>` has | Result |
| --- | --- |
| nothing | follow the system (Exercise 1 behavior) |
| `data-theme="dark"` | dark, whatever the system says |
| `data-theme="light"` | light, whatever the system says |

No button yet. You'll test by editing the attribute in DevTools.

<details><summary><b>Hints</b></summary>

- You need your dark tokens to apply in two situations: "system is dark AND
  no light override", or "dark override".
- `:root:not([data-theme="light"])` matches `<html>` unless it's forced light.
- Duplicating the token list twice is OK for learning. Later you could
  avoid it with a CSS custom-property trick, but readability matters more.

</details>

<details><summary><b>Answer</b></summary>

```css
/* System says dark, and the visitor hasn't forced light */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    /* dark tokens */
  }
}
/* Visitor forced dark */
:root[data-theme="dark"] {
  color-scheme: dark;
  /* the same dark tokens again */
}
```

</details>

**Tailwind `dark:` classes (optional).** If you'd like to write
`dark:bg-something` in components, Tailwind v4 needs to be told what "dark"
means. Add to `global.css`:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

⚠️ That only covers the *forced* dark. It won't fire for "system is dark,
no override". **Prefer tokens over `dark:` classes.** Tokens handle all three
states automatically. Use `dark:` only for rare one-offs.

**Check:** DevTools → Elements → click `<html>` → add attribute
`data-theme="dark"`. Page goes dark even with the system on light. Change it
to `light` with the system emulating dark: page goes light.

---

## Exercise 4: Remember the choice, without a flash

**Goal:** a visitor who picked dark sees dark on every page and every
visit, **with no white flash** while the page loads.

The choice is saved in `localStorage` (`theme` = `"dark"` or `"light"`; no
value = follow system). Something has to read it and set `data-theme`
**before the browser paints anything.**

### Why not in React?

`Navbar` is a React island (`client:load`). React code runs *after* the
HTML is shown, so the page would appear light, then snap dark. That's the
flash.

The fix is a tiny **blocking script in `<head>`**, which runs before the
`<body>` is drawn.

**Where:** `src/layouts/BaseLayout.astro`, inside `<head>`, as early as
possible (just after the `<meta name="viewport">` line).

<details><summary><b>Hints</b></summary>

- In Astro, a plain `<script>` gets bundled and deferred, which is too late.
  `<script is:inline>` is left exactly as written and runs immediately.
- `localStorage` can throw (private browsing, blocked storage). Wrap it in
  `try { … } catch {}`.
- `document.documentElement` is `<html>`.

</details>

<details><summary><b>Answer</b></summary>

```astro
<script is:inline>
  try {
    const t = localStorage.getItem('theme')
    if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t
  } catch {}
</script>
```

</details>

**Check:** in the DevTools Console, run `localStorage.setItem('theme','dark')`,
then reload. Dark, no flash. Throttle the network (DevTools → Network → "Slow
4G") and reload again. Still no flash? You got it.
`localStorage.removeItem('theme')` puts it back to "follow system".

---

## Exercise 5: The toggle button

**Goal:** a sun/moon button in the navbar (desktop **and** the mobile menu)
that switches the theme and remembers it.

**Where:** `src/components/layout/Navbar.tsx`. Icons: `Sun` and `Moon` from
`lucide-react` (already installed).

**Requirements:**
1. Click → flip between light and dark, set `data-theme` on `<html>`, save to
   `localStorage`.
2. The button shows the right icon on page load, including when the theme
   came from the *system* (no saved value).
3. Screen readers know what it does: an `aria-label` like "Switch to dark
   mode" that changes with the state.
4. It's at least 44×44px (an easy tap on phones).

<details><summary><b>Hints</b></summary>

- **Hydration trap.** The server renders the Navbar without knowing the
  visitor's theme. If your first render reads `localStorage` or
  `matchMedia`, the server HTML and the browser's first render disagree, and
  React complains. Start with a neutral state (e.g. `null`) and read the real
  theme in a `useEffect`. `useSlideshow.ts` does the same with
  `prefers-reduced-motion`: look at it for the pattern.
- **Current theme** = `document.documentElement.dataset.theme`, or if
  that's empty, `matchMedia('(prefers-color-scheme: dark)').matches`.
- Render no icon (or a same-size empty box) while the state is `null`, so
  nothing jumps.
- Pull it into its own small component (`ThemeToggle`) so you can drop it in
  both the bar and the mobile menu.

</details>

<details><summary><b>Answer (one way to do it)</b></summary>

```tsx
import { Sun, Moon } from 'lucide-react'

function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null)

  useEffect(() => {
    const forced = document.documentElement.dataset.theme
    setDark(forced ? forced === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
    >
      {dark === null ? null : dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
```

</details>

**Check:**
- Click it: theme flips. Reload: still flipped. Visit another page: still
  flipped.
- `localStorage.removeItem('theme')`, set the system (DevTools emulation) to
  dark, reload: the button shows the **sun**.
- Keyboard: Tab to it, press Enter. Works, focus ring visible.
- 390px wide: it's in the mobile menu and easy to tap.
- DevTools Console: no hydration warnings.

---

## Exercise 6: Polish

Pick these off one by one:

- [ ] **Browser chrome color.** Phones tint the address bar from
      `<meta name="theme-color">`. Add two to `BaseLayout.astro`, one with
      `media="(prefers-color-scheme: dark)"`.
- [ ] **Photos.** Bright photos can glare on a dark page. Optional:
      `filter: brightness(0.92)` on content images in dark mode. Not on the
      hero (it already has a scrim).
- [ ] **Smooth switch (careful).** A short `transition` on
      `background-color, color` feels nice. Don't use `transition: all` on
      `*`: it makes every hover and animation sluggish.
- [ ] **Admin pages.** `/admin` uses the same `global.css`, so it goes dark
      too. Check the login, Submissions and Admins pages. Keystatic
      (`/keystatic`) has its own styles and is unaffected.
- [ ] **Contrast.** Body text needs **4.5:1** against its background, large
      headings 3:1. Check with DevTools: inspect a text element, click the
      color swatch, and it shows the ratio. Check: muted text on `--card`,
      `--primary` links on `--background`, the Emergency Notice.
- [ ] **Givebutter popup.** It's Givebutter's own window. You can't theme it.
      Make sure that's acceptable, rather than a surprise.

---

## Exercise 7: Ship it

- [ ] `npm run build` passes.
- [ ] Every page checked in **light** (must be unchanged), **dark** (system),
      and **forced dark/light** (button), at 1280px and 390px.
- [ ] Update the comment at the top of `global.css` (no longer "light-only").
- [ ] Notes:
  - `notes/CHANGELOG.md`: what you built, which traps you hit, which option
    you chose for trap C and why.
  - `notes/component-responsibilities.md`: the new ThemeToggle in Navbar.
  - `how-to/editing-the-site.md` → colors: "every color now needs a light
    *and* a dark value. Add new tokens in both places."
  - Tick this guide's row in `how-to/README.md` to ✅.
- [ ] Merge your branch: `git checkout main && git merge dark-mode`, then push.

---

## When you get stuck

| Symptom | Likely cause |
| --- | --- |
| Nothing changes in dark | DevTools emulation is off, or your `@media` block is above the original `:root` and gets overridden. Order matters: put it **after**. |
| Page flashes light on load | The inline script is missing `is:inline`, or it's placed after the stylesheet/body. |
| React "hydration mismatch" warning | Your toggle reads the theme during render instead of in `useEffect`. |
| Button icon wrong on first load | You only check `data-theme`, not the system setting when it's empty. |
| One section stays light | It uses a hard-coded color instead of a token. Grep for it (trap G). |
| Light mode changed by accident | You edited the first `:root` instead of adding to the dark block. |

Want a second pair of eyes? Ask Claude to **review** your branch rather than
write it: "review my dark mode branch against how-to/dark-mode-exercises.md".
