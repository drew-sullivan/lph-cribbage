# lyman-cribbage

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

### How to Deploy to Github-Pages with a Master Branch and Docs folder:

1. On your master branch, run: 
```
npm run build
```
2. Change the name of your `dist` folder to `docs`
3. In your newly created `docs` folder, go to the index.html and remove the `/` in the beginning of every script and link tag’s `src` attribute.
4. In the repo's settings, change your `Source` in your Github Pages settings from `gh-pages branch` to `master branch/docs folder`. **NOTE** you must have a `docs` folder committed in the project to do this.
5. If you want to make a change to your master branch and have it detected by Github Pages, delete your `docs` folder, and follow the instructions from step 1.

### Vue Reference
See [Configuration Reference](https://cli.vuejs.org/config/).
