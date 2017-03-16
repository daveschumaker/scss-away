# SCSS Away

**SCSS Away** is a tool that analyzes `.js` or `.jsx` files within a folder (or series of subfolders) and searches for matching `.scss` files in the same folder. It then compares the rules in order to find abandoned / orphaned attributes that might be lingering inside your stylesheets.

## Overview

We run a fairly robust web app created with React. There are hundreds and hundreds of components and associated stylesheets inside our project. Ideally, when we add, update, or remove code in a React component, we should be doing the same thing in corresponding stylesheets. Sometimes life gets in the way and we forget to do this for some reason or another. Over time, this adds up to a lot of code bloat that gets added to our project.

This tool was created in order to quickly analyze a large project (containing hundreds of React components and corresponding stylesheets) in order to find orphaned CSS rules.

## How to start

```javascript
npm install scss-away --save-dev
```

Run the script from your project folder. Providing an absolute path to your project folder as an argument. (Tip, you can get the absolute path of your current project by typing `pwd` in your terminal).

```
./node_modules/scss-away/bin/scss-away /user/dave/projects/example/
```

## How to use

As an example, this is the ideal sort of folder structure for matching `js` / `jsx` and `scss` files:

```
projectFolder/
├── componentOne/
│   ├── componentOne.jsx
│   ├── componentOne.scss
│   ├── childComponentOne.jsx
│   ├── childComponentOne.scss
│   └── anotherFolder/
│       ├── anotherComponent.jsx
│       └── anotherComponent.scss
└── ComponentTwo/
    ├── componentTwo.jsx
    └── componentTwo.scss
```

When an `scss` file is found, the contents are parsed in order to create a list rules to match against.

The `js` / `jsx` file is imported and any class names or ids are extracted and matched against the results from the `scss` file.

A list of orphaned rules that aren't found in the `jsx` component are returned in the terminal.

Example results:

```
/users/dave/projects/example/App.scss
[Error] Orphan Classes:
  .App-Container
  .App-Header
```

## Tests

```
npm test
```

## Contribute

If you'd like to contribute to this project you can do so by following these rules:

1.  Fork this project into your own repo.
2.  Modify, improve, change, delete code.
3.  Add or update any tests related to changes you've made.
4.  Send a pull request.

Write a detailed comment and state your changes when creating the PR. Try to match existing code style and comments..

Contributions are much appreciated!

## TODO / Wishlist

* Add ability to provide optional folder where `css` or `scss` files may be located (i.e., if they're kept in a separate directory rather than in the same directory as the components).
* Provide ability to load some sort of exclusion list so certain class names, ids or maybe even files can be ignored.
* More robust tests and examples, especially for `appUtils.js`.
* Add ability to check other stylesheet filetypes (right now, it only looks for stylesheets with an extension of `scss`).

## Changelog

* v0.2.0
    * Add ability to check html component for orphaned attributes not found in its corresponding scss file.
* v0.1.0
	* Initial release

## License

The MIT License (MIT)

Copyright (c) 2017 Dave Schumaker

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
