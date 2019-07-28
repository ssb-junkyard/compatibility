const fs = require('fs')
const path = require('path')
const semver = require('semver')
const debug = require('debug')('compatibility:pretest')
var install = require('npm-install-package')

// polyfill!
if (!Object.entries) {
  Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    
    return resArray;
  };
}

debug.enabled = true

module.exports = function (dir, cb) {
  const fullPath = path.join(dir, 'package.json')
  debug('getting dependencies from %s', fullPath)
  const parentPackage = JSON.parse(fs.readFileSync(fullPath))
  // get dependencies from ssb-server
  const root_module = parentPackage.name
  const plugins = parentPackage.compatibility || []
  const parent = {}
  if(plugins.length == 0)
    throw new Error('compatibility: please specify an array of dependencies to be tested in package.json')
  Object.entries(parentPackage.dependencies || {}).forEach(e => parent[e[0]] = e[1])
  Object.entries(parentPackage.devDependencies || {}).forEach(e => parent[e[0]] = e[1])

  // initialize empty array for new deps needed
  const needDeps = []

  // get dependencies from plugin directories
  plugins.forEach(plugin => {
    const fullPath = path.join(dir, 'node_modules', plugin, 'package.json')
    debug('getting dependencies from %s', fullPath)
    const childPackage = JSON.parse(fs.readFileSync(fullPath))
    const pluginDeps = {}
    Object.entries(childPackage.devDependencies || {}).forEach(e => pluginDeps[e[0]] = e[1])

    Object.entries(pluginDeps).forEach(e => {
      const [ k, v ] = e

      if (Object.keys(parent).includes(k) === false || semver.intersects(parent[k], v) === false) {
        if (k !== root_module ) {
          if (needDeps[k] == null) {
            debug('new dependency from %s: %o', plugin, { name: k, range: v })
            needDeps[k] = v
          } else {
            const pairs = [
              [needDeps[k], v],
              [parent[k], v]
            ]

            pairs.forEach(pair => {
              if (pair[0] && semver.intersects(pair[0], pair[1]) === false) {
                throw new Error('plugins have incompatible devDependencies, for:'+k+' '+pair.join(' '))
              }
            })
          }
        }
      }
    })
  })

  const devDeps = Object.entries(needDeps).map(e => [e[0], e[1]].join('@'))

  if (devDeps.length > 0) {
    debug('installing: %O', devDeps)
    var opts = { saveDev: true, cache: true }

    debug.enabled = true
    debug('installing new plugin devDependencies')
    install(devDeps, opts, function (err) {
      if (err) throw err
      // avoid tests passing via Travis CI if dependencies are out-of-date
      debug('done! please re-run tests with these new dependencies')
      //process.exit(1)
      cb(new Error('compatibility:updated devdeps'))
    })


  } else {
    debug('plugin devDeps look great!')
    cb()
  }
}







