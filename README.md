This website is built with Jekyll and optimized to be hosted on CloudCannon. 

`npm` is used to allow for using `vue` with `parcel`. Vue is only used and loaded on `/schufa-beratung.html`.

## Installation

```
bundle install
npm install
```

## Run Dev server

When editing all HTML and CSS:

```
jekyll serve
```

When working with the "Schufa-Tool" and the JavaScript involving it als run:

```
npm run dev
```

## Build & Deploy

Builds the site in `_site`, although not necessary for platforms like Netlify/CloudCannon: 

```
jekyll build
```

**Important!** Whenever you make any changes to things in `assets/_js`, you need to run `npm run build` before deployment.