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
 * Intro Logo.
 */
const openSesame = () => {
	console.log(
		chalk.red(
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
const askThemeName = ( optional = false ) => {
	const msg = optional ? 'Leave empty if not needed.' : '(required)';
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
const askPluginName = ( optional = false ) => {
	const msg = optional ? 'Leave empty if not needed.' : '(required)';
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
	const answers = {
		type: '',
		themeName: '',
		pluginName: '',
		projectName: '',
	};

	// Ask project type.
	const answerType = await askType();
	answers.type = answerType.TYPE;

	if ( 'theme' === answers.type ) {
		const answerThemeName = await askThemeName();
		answers.themeName = answerThemeName.THEMENAME;
		if ( ! answers.themeName ) {
			console.error( 'Theme name is required. Please try again.' );
			return;
		}
	} else if ( 'plugin' === answers.type ) {
		const answerPluginName = await askPluginName();
		answers.pluginName = answerPluginName.PLUGINNAME;
		if ( ! answers.pluginName ) {
			console.error( 'Plugin name is required. Please try again.' );
			return;
		}
	} else if ( 'wp-content' ===  answers.type ) {
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
	} else {
		error.log( 'Invalid Project Type.' );
	}

	console.log( chalk.green( '(1/1) Clone something scaffold' ) );
	console.log( chalk.green( '(1/2) Bla bla bla' ) );
	console.log( chalk.green( '(1/3) Yak yak yak' ) );
	console.log( chalk.greenBright( '> Setup Complete. Have fun with the project!' ) );
};

run();
