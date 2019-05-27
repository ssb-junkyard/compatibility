# compatibility

tool to run tests of your dependencies, to check they are compatible

## install

`npm install -g compatibility`

## how

first, add a list of the dependencies you wish to test into your `package.json`

```
"compatibility": [
  "foo",
  "bar",
  "baz"
]
```

then run the `compatibility` command (or include it in your test script).

## what

`compatibility` will first check that the `devDependencies` of any module you are testing
are also included in your top level module. If a dependency is out of date, `compatibility`
will exit with an error. It has updated your `devDependencies`, so run `npm install` and test again.

This time, all the tests should run (one at a time, in the order specified) hopefully they pass.

## License

MIT


