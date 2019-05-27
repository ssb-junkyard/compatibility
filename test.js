const debug = require('debug')('compatibility:test')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn

debug.enabled = true
module.exports = function (dir, _modules, cb) {
  const fullPath = path.join(dir, 'package.json')
  debug('getting dependencies from %s', fullPath)
  const package = JSON.parse(fs.readFileSync(fullPath))
  // get dependencies from ssb-server
  var modules = package.compatibility
  if(!modules.length)
    throw new Error('compatibility: please specify an array of dependencies to be tested in package.json')

  const root_module = package.name
  try {
    fs.symlinkSync(dir, path.join(dir, 'node_modules', root_module))
  } catch(_) { }

  function test(name, cb) {
    debug('testing dependency for compatibilty:'+name)
    var mod_dir = path.join(dir, 'node_modules', name)
    var pkg = JSON.parse(fs.readFileSync(path.join(mod_dir, 'package.json')))
    if(!pkg.scripts.test)
      throw new Error('compatibility: module to be tested is missing tests:'+name)
    debug('running test script: ' + pkg.scripts.test)

    var cp = spawn('bash', ['-c', pkg.scripts.test], {
      stdio: ['inherit', 'inherit', 'inherit'],
      cwd: mod_dir
    })
    cp.on('exit', cb)
  }

  if(_modules.length) {
      _modules.forEach(function (m) {
        if(!~modules.indexOf(m))
          throw new Error('compatibility: requested test run of module:'+m+' but it was not in compatibiltiy testing list')
      })
      modules = _modules
  }

  ;(function next(i) {
    if(i >= modules.length)
      return debug('all tests passed')
    test(modules[i], function (code) {
      if(code) {
        debug('tests for '+modules[i]+' failed with:'+code)
//        process.exit(code)
        cb(code)
      }
      else
        next(++i)
    })
  })(0)
}

