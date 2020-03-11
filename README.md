This website is built with Jekyll and optimized to be hosted on CloudCannon. 

`npm` is used to allow for using `vue` with `parcel`. Vue is only used and loaded on `/schufa-beratung.html`.

## Installation

```
npm run setup
```

## Run Dev server

The website uses Jekyll for static site generation and Parcel for assets (currently only for the interactive Schufa tool).

To listen to changes to all files just run `npm run dev` and both the Jekyll process and the Parcel process will start.

## Build & Deploy

Builds the site in `_site`, although not necessary for platforms like CloudCannon: 

```
npm run build
```

That will execute both `jekyll build` as well as the Parcel build step. 

Check the package.json for details. 