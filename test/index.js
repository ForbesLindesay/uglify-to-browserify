var assert = require('assert');
var fs = require('fs')
var path = require('path')
var resolve = require('resolve')
var br = require('../')

var transform = br(require.resolve('uglify-js'));
var data = '';
transform.on('data', function (nextData) {
    data += nextData.toString('utf8');
  })
  .on('end', function () {
    const mod = {exports: {}}
    Function('module,exports,require', data)(
      mod,
      mod.exports,
      function (name) {
        switch (name) {
          case 'util':
            return require('util')
          case 'source-map':
            return require(resolve.sync(name, {
              basedir: path.dirname(require.resolve('uglify-js'))
            }))
          default:
            throw new Error('Did not expect ' + name)
        }
      }
    )
    var uglify = mod.exports
    var src = 'function add(firstValue, secondValue) { return firstValue + secondValue }'
    var output = uglify.minify(src).code
    assert(src.length > 35, 'minifying should make the output nice and short')
    assert(output.length < 35, 'minifying should make the output nice and short')
    assert(Function('a,b', output + ';return add(a, b)')(40, 2) === 42, 'output code still works')
  })
transform.end(fs.readFileSync(require.resolve('uglify-js'), 'utf8'))
