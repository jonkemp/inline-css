#!/usr/bin/env node

"use strict";

var fs = require("fs");
var path = require("path");
var pkg = require("../package.json");
var inlineCss = require('../');

var binname = Object.keys(pkg.bin)[0];

var options = {};
var html = process.argv[2];

switch (html) {
  case "--version":
  case "-v":
    console.log(binname + " v" + pkg.version);

    break;

  case "--help":
  case "-h":
    console.log("Usage: " + binname + " [FILE]");
    console.log("");
    console.log("Description:");
    console.log("  " + pkg.description);
    console.log("");
    console.log("Options:");
    console.log("  -h, --help     Show this message.");
    console.log("  -v, --version  Print version information.");
    console.log("");
    console.log("With no FILE, or when FILE is -, read standard input.");

    break;

  case "-":
  case undefined:
    options.url = 'file://' + process.cwd() + '/';
    var stdin = process.openStdin();
    html = "";
    stdin.setEncoding("utf-8");
    stdin.on("data", function (chunk) {
      html += chunk;
    });
    stdin.on("end", function () {
      inlineCss(html, options)
        .then(function(html) { 
          console.log(html); 
        });
    });

    break;

  default:
    options.url = 'file://' + path.dirname(path.resolve(html)) + '/';
    html = fs.readFileSync(html, "utf8");
    inlineCss(html, options)
      .then(function(html) { 
        console.log(html); 
      });
}

