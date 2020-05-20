# 10up Project Scaffold

> The 10up Project Scaffold is a command line tool to quickly initialize a starter theme or plugin for your new project. It adheres to all 10up's best practice coding standards and has been reviewed for security, performance, and scalability. This project is aimed specifically at the work that 10up does, but we welcome all community contributions.

[![Support Level](https://img.shields.io/badge/support-active-green.svg)](#support-level) [![MIT License](https://img.shields.io/github/license/10up/project-scaffold.svg)](https://github.com/10up/project-scaffold/blob/master/LICENSE.md)

## Contributing

If you have an update for the theme or plugin that is generated, please submit those issues or pull requests with the associated repository:

[View the theme repository](https://github.com/10up/theme-scaffold)

[View the plugin repository](https://github.com/10up/plugin-scaffold)

## Set Up from Github

1.  Clone the [repository](https://github.com/10up/project-scaffold) locally
2.  Run `cd project-scaffold`
3.  Run `npm install`
4.  Run `npm link` to make the `create-10up` command global

## Setup from npmjs.com

`npm install @10up/create-10up -g` or `npx @10up/create-10up [type] [name]`

## Project Types

* theme
* plugin
* component

## Example Usage with local installation

`cd <your-project-directory>`

`create-10up theme human-theme-name`

`create-10up plugin human-plugin-name`

`create-10up component human-component-name`

## Example Usage without local installation

`npx @10up/create-10up theme human-theme-name`

`npx @10up/create-10up plugin human-plugin-name`

`npx @10up/create-10up component human-component-name`

## Updating this tool

`create-10up` is in active development. To get the latest, navigate to this folder in your home directory (or wherever else you have it installed) and `git pull`.

## Learn more about the packages used with this project

*   [Chalk](https://www.npmjs.com/package/chalk)
*   [Commander](https://www.npmjs.com/package/commander)
*   [FS extra](https://www.npmjs.com/package/fs-extra)
*   [Git clone](https://www.npmjs.com/package/git-clone)
*   [Path](https://www.npmjs.com/package/path)
*   [Replace in file](https://www.npmjs.com/package/replace-in-file)

## Support Level

**Active:** 10up is actively working on this, and we expect to continue work for the foreseeable future including keeping tested up to the most recent version of WordPress.  Bug reports, feature requests, questions, and pull requests are welcome.

## Like what you see?

<a href="http://10up.com/contact/"><img src="https://10updotcom-wpengine.s3.amazonaws.com/uploads/2016/10/10up-Github-Banner.png" width="850" alt="Work with us at 10up"></a>
