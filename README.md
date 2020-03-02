# downld-paper
It is a package that can be used to download five scientific papers directly from scholar using just the keywords. The paper is directly saved as a pdf

## Installation
It requires [Node.js](https://nodejs.org/) to run.
```sh
$ npm i @breathedude/downld-paper
```
## Usage
```js
const downld-paper = require("@breathedude/downld-paper");

scholar.search('.....search keyword here.....')
  .then(resultsObj => {
    download(resultsObj)
  })
```
## Todo

 - Allow specification of number of downoads
 
## License
MIT

