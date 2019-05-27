#! /usr/bin/env node

if(!module.parent) {
  if(process.argv[2] == 'pretest')
    require('./pretest')(process.cwd())
  else
    require('./test')(process.cwd(), process.argv.slice(3))
}

