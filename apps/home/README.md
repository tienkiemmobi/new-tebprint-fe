# TebPrint Fulfillment - Frontend

Developer experience first:

- 🔥 Astro
- 🎨 Tailwind CSS with aspect ratio and typography plugin
- 🎉 TypeScript
- ✏️ ESLint compatible with .astro files
- 🛠 Prettier compatible with .astro files
- 🦊 Husky
- 🚫 lint-staged
- 🚨 Commitlint
- 🔥 Cspell

ESLint with:

- Airbnb styled guide
- TypeScript compatible
- Astro compatible
- Automatically remove unused imports
- Import sorting
- Tailwind CSS plugin

### Requirements

- Node.js and pnpm

### Getting started

Run the following command on your local environment:

``` bash
git clone https://github.com/TebPrint/tebprint-fe
cd tebprint-fe
pnpm install
```

Then, you can run locally in development mode with live reload:

``` bash
pnpm dev
```

### Deploy to production

You can create an optimized production build with:

```shell
pnpm build
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
|:----------------  |:-------------------------------------------- |
| `pnpm install`     | Installs dependencies                        |
| `pnpm dev`     | Starts local dev server at `localhost:3000`  |
| `pnpm build`   | Build your production site to `./dist/`      |
| `pnpm preview` | Preview your build locally, before deploying |
| `pnpm clean`   | Remove `./dist` folder                       |
| `pnpm lint`    | Run ESLint and report styling error          |

### License

Licensed under the MIT License, Copyright © 2023
