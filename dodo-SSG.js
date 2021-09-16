#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const argv = require("yargs")
  .usage("Usage: $0 [options]")
  .alias("i", "input")
  .describe("i", "Load input file or directory")
  .demandOption(["i"])
  .alias("s", "stylesheet")
  .describe("s", "Provide stylesheet")
  .alias("v", "version")
  .help("h")
  .alias("h", "help").argv;

let files = [];
let currentDir = "./";
let stylesheet = "";

if (fs.existsSync(argv.input)) {
  // if input name is a '.txt' file, save it to files[0]
  if (fs.statSync(argv.input).isFile() && argv.input.match(/.txt$/)) {
    files[0] = argv.input;
  }

  // if input name is a directory, save all '.txt' files to files array
  if (fs.statSync(argv.input).isDirectory()) {
    currentDir = "./" + argv.input + "/";
    files = fs.readdirSync(currentDir).filter((file) => file.match(/.txt$/));
  }
} else {
  console.log("file or directory not found!");
}

if (fs.existsSync("./dist")) {
  fs.rmSync("./dist", { recursive: true }, (err) => {
    console.log(err);
  });
}

fs.mkdirSync("./dist", (err) => {
  console.log(err);
});

files.forEach((file) => {
  const fullText = fs.readFileSync(currentDir + file, "utf-8");

  // get title from first line of text
  const title = fullText.substr(0, fullText.indexOf("\n"));

  let body = fullText
    .split(/\r?\n\r?\n/)
    .map((para) => `\t<p>${para.replace(/\r?\n/, " ")}</p>\n\n`)
    .join(" ");

  // remove first line of body
  body = body.substr(body.indexOf("\n", 1));

  // if user provided a stylesheet, include stylesheet in the html
  if (argv.stylesheet) {
    stylesheet = `<link rel="stylesheet" href="${argv.stylesheet}">`;
  }

  const fullHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${stylesheet}
</head>
<body>
  <h1>${title}</h1>
${body}
</body>
</html>`;

  // get filename without its '.txt' extension
  const fileName = path.basename(file, ".txt");

  // write to 'dist' directory new html file
  fs.writeFileSync("./dist/" + fileName + ".html", fullHTML);
});