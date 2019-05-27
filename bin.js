#! /usr/bin/env node

var dir = process.cwd()
require('./pretest')(dir, function (err) {
  if(err) process.exit(1)
  require('./test')(process.cwd(), process.argv.slice(2), function (code) {
    if(code) process.exit(code)
  })
})
//if(!module.parent) {
//  if(process.argv[2] == 'pretest')
//    require('./pretest')(process.cwd(), function
//  else
//    require('./test')(process.cwd(), process.argv.slice(3))
//}

