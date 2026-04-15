# BigBotBash 2026 Generatorathingabob

[https://gaberankin.github.io/bigbotbash2026/](https://gaberankin.github.io/bigbotbash2026/)

The big bot bash is a thing that [BillMakingStuff](https://www.youtube.com/c/BillMakingStuff) has organized for the past few years. This year, I want to do a thing, but because I'm a modern-day programmer who is struggling to be excited about programming I thought I'd try to make something that is (1) completely unnecessary (you can do this with literal dice) and (2) does a thing related to something that I am already interested in (canvases, robots, making things).

To the right is the robot generator that Bill originally posted on [his instagram](https://www.instagram.com/billmakingstuff/p/DUnPyzxiE3v/), and I've added a few features to it.

First off, each "part" of the robot is clickable, and clicking on it will select it. The selected item for each region is highlighted with a border, and the name of the selected item is displayed in the sidebar. You can also click on the name of the selected item in the sidebar to deselect it.

Second, I've added a randomizer. You can click the "Randomize All" button to select a random item for each region. You can also click the "Randomize" button on each region to select a random item for that specific region.

Anyone have a good favicon i can use?

## Setup

- Vite + React + TypeScript
- Tailwind CSS v4 integration
- GitHub Actions workflow for GitHub Pages deployment
- Pages base path support through `VITE_BASE_PATH`

## Requirements

- Node.js `>= 22.12.0` (or `>= 20.19.0`)
- npm

## Local development

```bash
npm install
npm run dev
```

## Build locally

Standard build:

```bash
npm run build
```

