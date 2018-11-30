# LPH Cribbage

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Deploy to Github-Pages with a Master Branch and Docs folder:

1. On your master branch, run `npm run build`.
2. Change the name of the `dist` folder to `docs`.
3. In `docs/index.html`, find and replace `src=/` with `src=`.
4. Commit your changes (or else the next step won't work).
4. In the repo's Github Pages settings, change the `Source` from `gh-pages branch` to `master branch/docs folder`.
5. When merging to the master branch, delete `docs`, and follow the instructions from step 1.

### Vue Reference
See [Configuration Reference](https://cli.vuejs.org/config/).
