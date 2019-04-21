// @ts-check
'use strict';

const chalk = require( 'chalk' );
const clone = require( 'git-clone' );
const commander = require( 'commander' );
const fs = require( 'fs-extra' );
const packageJson = require( './package.json' );
const path = require( 'path' );
const replace = require( 'replace-in-file' );
const figlet = require( 'figlet' );
const inquirer = require( 'inquirer' );
const shell = require( 'shelljs' );

/**
 *  Start!
 */
let directoryName = '';
let projectType = '';
const answers = {
	type: '',
	themeName: '',
	pluginName: '',
	projectName: '',
};

/**
 * Commander
 */
const program = new commander.Command( packageJson.name )
	.version( packageJson.version )
	.arguments( '<project-type> <project-directory>' )
	.usage( `${chalk.green( '<project-type> <project-directory>' )} [options]` )
	.action( (type, name) => {
		projectType   = type.toLowerCase();
		directoryName = name.toLowerCase();
	} )
	.allowUnknownOption()
	.parse( process.argv );

if ( projectType && packageJson.tenup.repos[ projectType ] ) {
	answers.type = projectType;

	if ( directoryName && '' !== directoryName ) {
		if ( 'theme' === projectType ) {
			answers.themeName = directoryName;
		} else if ( 'plugin' === projectType ) {
			answers.themeName = directoryName;
		}  else if ( 'wp-content' === projectType ) {
			answers.projectName = directoryName;
		}
	}
}

/**
 * Intro Logo.
 */
const openSesame = () => {
	console.log(
		chalk.redBright(
			figlet.textSync( 'create-10up', {
				horizontalLayout: "default",
				verticalLayout: "default"
			} )
		)
	);
}

/**
 * Ask: Project Type
 */
const askType = () => {
	const questions = [
		{
			name: 'TYPE',
			type: 'list',
			message: 'What do you want to setup?',
			choices: [
				'theme',
				'plugin',
				'wp-content',
			],
		},
	];
	return inquirer.prompt( questions );
};

/**
 * Ask: Theme Name
 */
const askThemeName = ( required = true ) => {
	const msg = required ? '(required)' : '(optional)';
	const questions = [
		{
			name: 'THEMENAME',
			type: 'input',
			message: `What is the theme name? ${msg}`,
		},
	];
	return inquirer.prompt( questions );
};

/**
 * Ask: Plugin Name.
 */
const askPluginName = ( required = true ) => {
	const msg = required ? '(required)' : '(optional)';
	const questions = [
		{
			name: 'PLUGINNAME',
			type: 'input',
			message: `What is the plugin name? ${msg}`,
		},
	];
	return inquirer.prompt( questions );
};

/**
 * Ask: Project Name.
 */
const askProjectName = () => {
	const questions = [
		{
			name: 'PROJECTNAME',
			type: 'input',
			message: 'What is the project name? (required)',
		},
	];
	return inquirer.prompt( questions );
};

/**
 * Run!
 */
const run = async () => {
	openSesame();

	// Ask project type.
	if ( '' === answers.type ) {
		const answerType = await askType();
		answers.type = answerType.TYPE;
	}

	if ( 'theme' === answers.type && '' === answers.themeName ) {
		const answerThemeName = await askThemeName();
		answers.themeName = answerThemeName.THEMENAME;
		if ( ! answers.themeName ) {
			console.error( 'Theme name is required. Please try again.' );
			return;
		}
	} else if ( 'plugin' === answers.type && '' === answers.pluginName ) {
		const answerPluginName = await askPluginName();
		answers.pluginName = answerPluginName.PLUGINNAME;
		if ( ! answers.pluginName ) {
			console.error( 'Plugin name is required. Please try again.' );
			return;
		}
	} else if ( 'wp-content' ===  answers.type && '' === answers.projectName ) {
		const answerProjectName = await askProjectName();
		answers.projectName = answerProjectName.PROJECTNAME;
		if ( ! answers.projectName ) {
			console.error( 'Project name is required. Please try again.' );
			return;
		}
		const answerThemeName = await askThemeName( true );
		answers.themeName = answerThemeName.THEMENAME;
		const answerPluginName = await askPluginName( true );
		answers.pluginName = answerPluginName.PLUGINNAME;
	}
	console.log(  answers );

	console.log( chalk.green( '(1/1) Clone something scaffold' ) );
	console.log( chalk.green( '(1/2) Bla bla bla' ) );
	console.log( chalk.green( '(1/3) Yak yak yak' ) );
	console.log( chalk.greenBright( '> Setup Complete. Have fun with the project!' ) );
};

run();
