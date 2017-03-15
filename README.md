# SCSS Away

**SCSSAway** is a tool that analyzes `.jsx` files within a folder (or series of subfolders) and searches for matching `.scss` files in the same folder.

This tool was created in order to quickly analyze a large project (containing hundreds of React components and corresponding stylesheets) in order to find orphaned CSS rules.

As an example, this is the ideal sort of folder structure for matching `jsx` and `scss` files:

```
rootFolder/
├── componentOne/
│   ├── componentOne.jsx
│   ├── componentOne.scss
│   ├── childComponentOne.jsx
│   └── childComponentOne.scss
└── ComponentTwo/
    ├── componentTwo.jsx
    └── componentTwo.scss
```

When an `scss` file is found, the contents are parsed in order to create a list rules to match against.

The `jsx` file is imported and any class names or ids are extracted and matched against the results from the `scss` file.

A list of orphaned rules that aren't found in the `jsx` component are returned in the terminal.

Example results:

```
/users/dave/projects/example/App.scss
[Error] Orphan Classes:
  .App-Container
  .App-Header
```

## How to start

```javascript
$ npm install scss-away
```

Run the script by providing an absolute path to the project folder as an argument. (Tip, you can get the absolute path of your current project by typing `pwd` in your terminal).

```
$ ./node_modules/scss-away/bin/scss-away /user/dave/projects/example/
```

## Tests

```
$ npm test
```


## Contribute

If you'd like to contribute to this project you can do so by following these rules:

1.  Fork this project into your own repo.
2.  Modify, improve, change, delete code.
3.  Add or update any tests related to changes you've made.
4.  Send a pull request.

Write a detailed comment and state your changes when creating the PR. Try to match the code style and comments to the current style.

Contributions are appreciated!

## Changelog

* v0.1.0
	* Initial release

## License

The MIT License (MIT)

Copyright (c) 2017 Dave Schumaker

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
