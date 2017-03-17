# SCSS Away

**SCSS Away** is a tool that analyzes `.js` or `.jsx` files within a folder (or series of subfolders) and searches for matching `.scss` files (by default, in the same folder but you can provide a flag for a different folder where `scss` files may be located).

It then compares the rules in order to find abandoned / orphaned attributes that might be lingering inside your stylesheets as well as provide a warning when nested selectors are found ([you might ask, why?](http://thesassway.com/intermediate/avoid-nested-selectors-for-more-modular-css)).

To install:

```javascript
npm install scss-away --save-dev
```

## Overview

We run a fairly robust web app created with React. There are hundreds and hundreds of components and associated stylesheets inside our project. Ideally, when we add, update, or remove code in a React component, we should be doing the same thing in corresponding stylesheets. Sometimes life gets in the way and we forget to do this for some reason or another. Over time, this adds up to a lot of code bloat that gets added to our project.

This tool was created in order to quickly analyze a large project (containing hundreds of React components and corresponding stylesheets) in order to find orphaned CSS rules.

Running this in our own React project took 0.54 seconds, found 405 files that matched `jsx` or `js`, matched 226 corresponding stylesheets and found errors in 115 stylesheets. (We used to nest our scss and we've started slowly moving away from that).

## How to start

```javascript
npm install scss-away --save-dev
```

Run the script from your project folder. Providing an absolute path to your project folder as an argument. (Tip, you can get the absolute path of your current project by typing `pwd` in your terminal).

```
scss-away --path /user/dave/example-project/src/
```

(Depending on how Node is setup on your machine, you may have to invoke this script using `./node_modules/scss-away/bin/scss-away` )

## How to use

By default, the running the script above will search for `scss` files inside `/user/dave/example-project/src/`.

As an example, this is the ideal sort of default folder structure for matching `js` / `jsx` and `scss` files:

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

You can use an optional `--css` flag to point to a custom location where stylesheets may be stored.

```
scss-away --path /user/dave/example-project/src/ --css /user/dave/example-project/stylesheets/
```

This will look for stylesheets inside `/user/dave/example-project/stylesheets/`. The internal folder structure should match the internal folder structure for the components path. For example:

```
projectFolder/
├── src/
│   ├── componentOne.jsx
│   ├── componentTwo.jsx
│   └── childComponents/
│       ├── childComponentOne.jsx
│       └── childComponentTwo.jsx
└── stylesheets/
│   ├── componentOne.scss
│   ├── componentTwo.scss
│   └── childComponents/
│       ├── childComponentOne.scss
│       └── childComponentTwo.scss
```

When an `scss` file is found, the contents are parsed in order to create a list rules to match against.

The `js` / `jsx` file is imported and any class names or ids are extracted and matched against the results from the `scss` file.

A list of orphaned rules that aren't found in the `jsx` component are returned in the terminal.

Example results:

```
/user/dave/example-project/src/App.scss
[Error] Orphan Classes:
    .App-Container
    .App-Header

/user/dave/example-project/src/Users.jsx
[Error] Orphan Classes:
    .user-name-bold
[Error] Orphan Ids:
    #user-id

/user/dave/example-project/src/Users.scss
[Error] Orphan Classes:
    .user-email-address
```

## Exclude files, ids, or classes.

You can tell `scss-away` to exclude certain file types, class names, or ids by creating a json file named `scss-away.exclude.js` in the root folder of your project (typically whereever your `package.json` file is located). Format the exclusion file like below:

```
{
    "files": [
        "/project/folder/src/AppTemplate.jsx",
        "/project/folder/src/templates/UserPage.scss"
    ],
    "classes": [
        "active",
        "UserDashboardTemplate"
    ],
    "ids": [
        "app-root"
    ]
}
```

## Options

```
--path   // Absolute path to project folder
--css    // (Optional) Absolute path to stylesheets folder.
--ext    // (Optional) Look for stylsheets matching this extension rather than defaulting to 'scss'
```

Example usage:

```
scss-away --path /project/src --css /project/css --ext css
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

Write a detailed comment and state your changes when creating the PR. Try to match existing code style and comments.

Contributions are much appreciated!

## TODO / Wishlist

* Ability to load some sort of exclusion list so certain class names (e.g., class names for icon fonts), ids or maybe even entire files can be ignored.
* Create an MD5 hash of each rule so we can check if duplicate rulesets are being used in project.
* More optional flags (e.g., ability to analyze `.html` files instead of just `.js` or `.jsx`.
* Option to auto-delete orphaned rules (oh, dear God)?
* More robust tests and examples, especially for `appUtils.js`.

## Changelog

* v0.3.0
	* Add `--css` flag to look for stylesheets in a different location and ability to exclude certain files.
* v0.2.1
	* Fix wrongly named bin property in `package.json`
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
