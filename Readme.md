# Adobe Illustrator Scripts

## Contributing

- `yarn`, `yarn run dev` to start the rollup in watch mode
- `yarn run tests` to run tests

## ai2html

Forked from [the NYT version](https://github.com/newsdev/ai2html).

### Goals

- Refactor
  - [x] Use modern Javascript formatting
  - [ ] Build out Illustration mocks
  - [ ] Use functional programming style
  - [x] Use typescript, transpile to es3
  - [x] Extract NYT-specific code into options (?)
  - [ ] Use hashmaps instead of arrays for typeface etc. lookup tables
  - [ ] Drop legacy options and commented-out code
  - [ ] Import all existing tests and make sure they keep passing
  - [x] Allow exporting to a different volume than the one Illustrator lives on
  - [ ] Make purpose-built Illustrator files for integration testing
- Features
  - [ ] Allow multiple exports from the same file, maybe with prefixed artboard names?
  - [ ] https://github.com/newsdev/ai2html/issues/16
  - [ ] https://github.com/newsdev/ai2html/issues/88
  - [ ] https://github.com/newsdev/ai2html/pull/156

### Notes

- `create_promo_image` shows a prompt to create a PNG version of the file, seems to be an NYT deal
- Symlink ./dist to the scripts folder `mklink /j [...]/Scripts/max [...]/dist `
- You can add a shortcut to a script via Window -> Actions -> Add Action, then `Insert Menu Item` from the actions hamburger menu

## Prior work

- https://github.com/newsdev/ai2html
- https://github.com/guardian/ai2html/
- https://community.adobe.com/havfw69955/attachments/havfw69955/illustrator/426671/1/Illustrator%20JavaScript%20Scripting%20Reference.pdf
- https://extendscript.docsforadobe.dev/file-system-access/using-file-and-folder-objects/#specifying-paths
- https://github.com/newsdev/ai2html/issues/111
- https://github.com/striblab/strib-ai2html/tree/master
