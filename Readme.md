# Adobe Illustrator Scripts

## ai2html

Forked from [everyone's favourite newspaper](https://github.com/newsdev/ai2html).

### Goals

- [x] Use modern Javascript formatting
- [x] Extract NYT-specific code into options (?)
- [ ] Use hashmaps instead of arrays for typeface etc. lookup tables
- [ ] Drop legacy options and commented-out code
- [x] Allow exporting to a different volume than the one Illustrator lives on

### Notes

- `create_promo_image` shows a prompt to create a PNG version of the file, seems to be an NYT deal
- Symlink ./dist to the scripts folder `mklink /j [...]/Scripts/max [...]/dist `

## Prior work

- https://github.com/newsdev/ai2html
- https://github.com/guardian/ai2html/
- https://community.adobe.com/havfw69955/attachments/havfw69955/illustrator/426671/1/Illustrator%20JavaScript%20Scripting%20Reference.pdf
- https://extendscript.docsforadobe.dev/file-system-access/using-file-and-folder-objects/#specifying-paths