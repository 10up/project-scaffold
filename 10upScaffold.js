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
			answers.pluginName = directoryName;
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
};

/**
 * Completed Message
 */
const closeSesame = () => {
	console.log(
		chalk.greenBright( '> Setup Complete. Have fun with the project!' )
	);
};

/**
 * Ask Question Helper.
 */
const ask = async ( question ) => {
	question.name = 'ITEM';
	const answer = await inquirer.prompt( [ question ] );
	return answer.ITEM;
};

/* ============================ */

/*
 * Clone the repository and rename.
 */
const cloneProject = ( projectType, directoryName, name ) => {
	const nameSpaces = name.replace( /-/g, ' ' );
	const nameCapitalize = nameSpaces.replace( /\b\w/g, l => l.toUpperCase() );
	const nameCamelCase = nameCapitalize.replace( / /g, '' );
	const nameUnderscores = name.replace( /-/g, '_' );
	const nameUnderscoresUppercase = nameUnderscores.toUpperCase();

	// An array of files to remove
	const filesToRemove = ['README.md'];

	// An array of directories to remove
	const directoriesToRemove = ['.git'];

	// Objects of text strings to find and replace
	const textToReplace = [
		{
			from: /TenUpScaffold/g,
			to: nameCamelCase
		},
		{
			from: /TENUP_SCAFFOLD/g,
			to: nameUnderscoresUppercase
		},
		{
			from: /tenup-scaffold/g,
			to: name
		},
		{
			from: /tenup_scaffold/g,
			to: nameUnderscores
		},
		{
			from: /10up Scaffold/g,
			to: nameCapitalize
		}
	];

	// Objects of directories that need to be renamed
	const directoriesToRename = [
		{
			from: 'tenup-scaffold',
			to: directoryName
		},
		{
			from: 'tenup-plugin-scaffold',
			to: directoryName
		},
		{
			from: 'languages/TenUpScaffold.pot',
			to: 'languages/' + nameCamelCase + '.pot'
		}
	];

	console.log( chalk.green.bold( `✔ Starting ${projectType} setup` ) );

	clone( packageJson.tenup.repos[projectType], directoryName,
		function( err ) {

			if ( err ) {

				console.log( err ) ;

			} else {

				console.log( chalk.green.bold( '✔ Clone Successful' ) );

				// Delete unnecessary files
				if ( filesToRemove.length ) {
					filesToRemove.forEach( function( file ) {

						// Check to see if the file exists before trying to delete it
						if ( fs.existsSync( directoryName + '/' + file ) ) {
							deleteFile( directoryName, file, function() {
								console.log( chalk.green( `✔ ${file} deleted` ) );
							} );
						}
					} );
				}

				// Delete unnecessary directories
				if ( directoriesToRemove.length ) {
					directoriesToRemove.forEach( function( dir ) {
						if ( fs.existsSync( directoryName + '/' + dir ) ) {
							deleteDirectory( directoryName + '/' + dir, function() {
								console.log( chalk.green( `✔ ${dir} deleted` ) );
							} );
						}
					} );
				}

				// Synchronously find and replace text within files
				textToReplace.forEach( function( text ) {

					try {
						const changes = replace.sync( {
							files: directoryName + '/**/*.*',
							from: text.from,
							to: text.to,
							encoding: 'utf8',
						} );

						console.log(chalk.green.bold( `✔ Modified files: ` ), changes.join(', ') );
					}

					catch ( error ) {
						console.error( 'Error occurred:', error );
					}

				} );

				// Rename directories
				directoriesToRename.forEach( function( dir ) {
					if ( fs.existsSync( directoryName + '/' + dir.from ) ) {
						fs.rename( directoryName + '/' + dir.from, directoryName + '/' + dir.to, function ( err ) {
							if ( err ) throw err;
							console.log( chalk.green( '✔ Renamed ' + dir.from ) );
						} );
					}
				} );
			}

		}
	); // clone()
}

/**
 * Delete files
 * @param {string} dir Directory path
 * @param {string} [file] Filename to delete (optional, deletes directory if undefined)
 * @param {Function} [cb] Callback
 * @returns {Promise}
 */
function deleteFile( dir, file, cb ) {

	return new Promise( function ( resolve, reject ) {
		var filePath = path.join( dir, file );
		fs.lstat( filePath, function ( err, stats ) {
			if ( err ) {
				return reject( err );
			}
			if ( stats.isDirectory() ) {
				resolve( deleteDirectory( filePath ) );
			} else {
				fs.unlink( filePath, function ( err ) {
					if ( err ) {
						return reject( err );
					}
					resolve();
				} );
			}
		} );

		if ( 'function' === typeof cb ) {
			cb.call( this );
		}

	} );

} // deleteFile()

/**
 * Delete directories
 * @param {string} dir Directory
 * @param {Function} [cb] Callback
 * @returns {Promise}
 */
function deleteDirectory( dir, cb ) {

	return new Promise( function ( resolve, reject ) {
		fs.access( dir, function ( err ) {
			if ( err ) {
				return reject( err );
			}
			fs.readdir( dir, function ( err, files ) {
				if ( err ) {
					return reject( err );
				}
				Promise.all( files.map( function ( file ) {
					return deleteFile( dir, file );
				} ) ).then( function () {
					fs.rmdir( dir, function ( err ) {
						if ( err ) {
							return reject( err ) ;
						}
						resolve();
					} );
				} ).catch( reject );
			} );
		} );

		if ( 'function' === typeof cb ) {
			cb.call( this );
		}

	} );

}; // deleteDirectory()

/**
 * Run!
 */
const run = async () => {
	openSesame();

	if ( '' === answers.type ) {
		answers.type = await ask( {
			type: 'list',
			message: 'What do you want to setup?',
			choices: [
				'theme',
				'plugin',
				'wp-content',
			],
		} );
	}
	if ( 'theme' === answers.type && '' === answers.themeName ) {
		answers.themeName = await ask( {
			type: 'input',
			message: `What is the theme directory name? (required)`,
		} );
		if ( ! answers.themeName ) {
			console.error( 'Theme name is required. Please try again.' );
			return;
		}
	} else if ( 'plugin' === answers.type && '' === answers.pluginName ) {
		answers.pluginName = await ask( {
			type: 'input',
			message: `What is the plugin directory name? (required)`,
		} );
		if ( ! answers.pluginName ) {
			console.error( 'Plugin name is required. Please try again.' );
			return;
		}
	} else if ( 'wp-content' ===  answers.type && '' === answers.projectName ) {
		answers.projectName = await ask( {
			type: 'input',
			message: `What is the project name? (required)`,
		} );
		if ( ! answers.projectName ) {
			console.error( 'Project name is required. Please try again.' );
			return;
		}
		answers.themeName = await ask( {
			type: 'input',
			message: `Need to setup theme? please input directory name. (optional, leave empty to skip)`,
		} );
		answers.pluginName = await ask( {
			type: 'input',
			message: `What is the plugin directory name? (optional, leave empty to skip)`,
		} );
	}

	// Clone repository.
	if ( 'wp-content' === answers.type ) {
		if ( fs.existsSync( './wp-content' ) ) {
			console.log( chalk.yellow.bold( '✘ Warning: ' ) + '"wp-content" directory already exists, please remove it or change the path' );
			process.exit( 1 );
		}
		console.log( chalk.yellow( `Setting up your project. This might take a bit.` ) );
		await cloneProject( 'wp-content', './wp-content', answers.projectName );
		if ( '' !== answers.pluginName ) {
			cloneProject( 'plugin', './wp-content/plugins/' + answers.pluginName, answers.pluginName );
		}
		if ( '' !== answers.themeName ) {
			cloneProject( 'theme', './wp-content/themes/' + answers.themeName, answers.themeName );
		}
	} else if ( 'theme' ===  answers.type ) {
		console.log( chalk.yellow( `Setting up your theme. This might take a bit.` ) );
		cloneProject( answers.type, './' + answers.themeName, answers.themeName );
	} else if ( 'plugin' === answers.type ) {
		console.log( chalk.yellow( `Setting up your plugin. This might take a bit.` ) );
		cloneProject( answers.type, './' + answers.pluginName, answers.pluginName );
	}
};

run();
