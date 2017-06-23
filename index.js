'use strict';

var readFileSync = require('fs').readFileSync;
var Transform = require('stream').Transform;
var UglifyJS = require('uglify-js');

module.exports = function() {
  var stream = new Transform();
  stream._flush = function(callback) {
    var files = {};
    UglifyJS.FILES.forEach(function(file) {
      files[file] = readFileSync(file, 'utf8');
    });
    stream.push(UglifyJS.minify(files, {
      compress: false,
      mangle: false,
      wrap: 'exports'
    }).code);
    callback();
  };
  stream._transform = function(chunk, encoding, callback) {
    callback();
  };
  return stream;
};
