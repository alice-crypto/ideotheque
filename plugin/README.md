# Idéothèque for Claude

> We used to have style libraries. With AI, we move to libraries of ideas.

**Idéothèque** is a free, MIT-licensed library of 206 named visual effects for the web: entrances, text effects, page transitions, scroll scenes, micro-interactions, ambient backgrounds and AI states (thinking orb, streaming text, agent steps…).

Every effect has **a name**, **an intent** and a reference sheet that fixes its timing, easing and feel. This plugin gives Claude the whole catalogue, so you can simply ask:

> “Use `curtain-soft` for the sections, `line-mask` on the title and `magnetic` on the main button.”

Claude reads the sheet of each effect and applies exactly that effect, not a guess.

**[▶ Live catalogue with a demo of every effect](https://alice-crypto.github.io/ideotheque/)** · **[Example landing pages and dashboards](https://alice-crypto.github.io/ideotheque/exemples/)**

## Install

```
/plugin install ideotheque --marketplace alice-crypto/ideotheque
```

On older versions of Claude Code:

```
/plugin marketplace add alice-crypto/ideotheque
/plugin install ideotheque@ideotheque
```

## What it does

- Adds the `ideotheque` skill. Claude uses it when you name an effect, mention Idéothèque or `data-fx`, or ask to animate a landing page, a dashboard or a website.
- The skill contains the catalogue and the 206 effect sheets, so it works offline and needs no API key.
- In plain HTML, Claude loads the library from the jsDelivr CDN and adds `data-fx="<name>"` attributes. In React, Vue, Svelte or Flutter, it reproduces the effect with the framework's own tools, with the same duration, easing and feel.
- Every effect respects `prefers-reduced-motion`.

## Language

The library and its effect sheets are written in French. Effect names are in English-style kebab-case (`fade-up`, `page-wipe`, `ai-orb`…), and Claude answers in your language.

## Data and privacy

The plugin contains only instructions and documentation. It collects no data, calls no service and stores nothing.

## License

MIT · [Source on GitHub](https://github.com/alice-crypto/ideotheque)
