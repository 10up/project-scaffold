'use strict';

const fs = require( 'fs-extra' );
const path = require( 'path' );
const clone = require( 'git-clone' );
const replace = require( 'replace-in-file' );
const chalk = require( 'chalk' );
const commander = require( 'commander' );
const packageJson = require( './package.json' );

// @TODO: Update this with the final path
const repoToClone = 'https://github.com/timwright12/test-scaffold';

// @TODO: Update this with the final path
const repoToClonePlugin = '';
let directoryName;

/*
	Set up the CLI
*/

const program = new commander.Command( packageJson.name )
	.version( packageJson.version )
	.arguments( '<project-type> <project-directory>' )
	.usage( `${chalk.green( '<project-type> <project-directory>' )} [options]` )
	.action( (type, name) => {
		projectType   = type.toLowerCase()
		directoryName = name
	} )
  	.allowUnknownOption()
	.parse( process.argv );

if ( typeof projectType === 'undefined' || undefined === reposToClone[projectType]) {
	console.error( 'Please specify the what type of project to create:' );
	console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-type> <project-directory>')}` );
	console.log( " Valid project types are 'theme' and 'plugin'." );
	console.log();
	console.log( 'For example:' );
	console.log(`  ${chalk.cyan( program.name() ) } ${chalk.green( 'theme my-10up-project' ) }` );
	console.log();
	process.exit( 1 );	
}

if ( typeof directoryName === 'undefined' ) {
	console.error( 'Please specify the project directory:' );
	console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}` );
	console.log();
	console.log( 'For example:' );
	console.log(`  ${chalk.cyan( program.name() ) } ${chalk.green( 'my-10up-project' ) }` );
	console.log();
	process.exit( 1 );
}

directoryName = directoryName.toLowerCase();
const nameSpaces = directoryName.replace( /-/g, ' ' );
const nameCapitalize = nameSpaces.replace( /\b\w/g, l => l.toUpperCase() );
const nameCamelCase = nameCapitalize.replace( ' ', '' );
const nameUnderscores = directoryName.replace( /-/g, '_' );
const nameUnderscoresUppercase = nameUnderscores.toUpperCase();

// An array of files to remove
const filesToRemove = ['README.md'];

// An array of files to remove
const filesToRename = ['TenUpThemeScaffold.pot'];

// An array of directories to remove
const directoriesToRemove = ['.git'];

// Objects of text strings to find and replace
const textToReplace = [
	{
		from: /TenUpThemeScaffold/g,
		to: nameCamelCase
	},
	{
		from: /TENUP_THEME_SCAFFOLD/g,
		to: nameUnderscoresUppercase
	},
	{
		from: /tenup-theme-scaffold/g,
		to: directoryName
	},
	{
		from: /tenup_theme_scaffold/g,
		to: nameUnderscores
	},
	{
		from: /10up Theme Scaffold/g,
		to: nameCapitalize
	}
];

// Objects of directories that need to be renamed
const directoriesToRename = [
	{
		from: 'tenup-theme-scaffold',
		to: directoryName
	},
	{
		from: 'languages/TenUpThemeScaffold.pot',
		to: 'languages/' + nameCamelCase + '.pot'
	}
];

/*
	Make sure the directory isn't already there before running the script
*/

if ( fs.existsSync( './' + directoryName ) ) {

	console.log( chalk.yellow.bold( '✘ Warning: ' ) + '"' + directoryName + '" directory already exists, please remove it or change the path' );
	
	// Bail out so you don't delete the directory or error out
	return false;

} else {

	console.log( chalk.yellow( `Setting up your project. This might take a bit.` ) );

}

/*
	Clone the repo and get to work
*/

clone( repoToClone, './' + directoryName,
	function( err ) {
		
		if ( err ) {

			console.log( err ) ;

		} else {

			console.log( chalk.green( '✔ Clone Successful' ) );

			
			// Delete unnecessary files
			if ( filesToRemove.length ) {
				filesToRemove.forEach( function( file ) {
					deleteFile( directoryName, file, function() {
						console.log( chalk.green( `✔ ${file} deleted` ) );
					} );
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

					console.log(chalk.green.bold( `✔ Modified files: '` ), changes.join(', ') );
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

/*
	Delete files
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
		
		if ( typeof cb === 'function' ) {
			cb.call( this );
		}
		
	} );

} // deleteFile()

/*
	Delete directories
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
					});
				} ).catch( reject );
			} );
		} );
		
		if ( typeof cb === 'function' ) {
			cb.call( this );
		}
		
	} );

}; // deleteDirectory()