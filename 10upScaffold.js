// @ts-check
'use strict';

const chalk = require( 'chalk' );
const clone = require( 'git-clone' );
const commander = require( 'commander' );
const fs = require( 'fs-extra' );
const packageJson = require( './package.json' );
const path = require( 'path' );
const replace = require( 'replace-in-file' );

const {
	promptFields,
	promptToContinue,
	promptOptions,
	startWith,
	onFinalError,
	exit,
	DontContinue,
} = require( 'interactive-cli' );

// @TODO: Update this with the final path
let directoryName = '',
	projectType = 'theme';

/*
	Set up the CLI
*/
new Promise((resolve, reject) => {
  // Do some preparation, such as getting
  // a reference to a database or authenticating
  resolve({
    createUser: () => Promise.resolve(),
    listUsers: () => Promise.resolve({
      "31725276-73a9-4830-aa77-a86fce4dd7f8": "Leonardo DiCaprio",
      "53bd3330-4bd7-47c5-a685-f1039e043eae": "Jennifer Lopez"
    }),
    deleteUser: () => Promise.resolve(),
  })
})
.then(api => {
  const initialOptions = {
    createUser: "Create a new user",
    deleteUser: "Delete a user"
  }
  const handler = (selection) => {
    switch (selection) {
      case 'createUser':
        return createUser(api)
 
      case 'deleteUser':
        return deleteUser(api)
 
      default: {
        throw new ExitScript(`Unknown selection "${selection}"`)
      }
    }
  }
 
  return startWith("Would you like to", initialOptions, handler)
})
.catch(onFinalError)
.then(exit)
 
function createUser (api) {
  const user = {}
  return promptFields("Enter user's email", "email")
  .then(email => { user.email = email })
 
  .then(() => promptFields("What's the name for the user", ["firstname", "lastname"]))
  .then(res => {
    user.firstname = res.firstname
    user.lastname = res.lastname
  })
 
  .then(() => {
    return api.createUser(user)
    .catch(err => {
      throw DontContinue("User could not be created because of error: " + err.message)
    })
  })
 
  .then(() => {
    console.log(`User ${user.firstname} ${user.lastname} was created successfully!`)
  })
 
}
 
function deleteUser (api) {
  const data = {}
  return api.listUsers()
  .then(users => {
    data.users = users;
    return users
  })
  .then(users => promptOptions("Which user would you like to delete?", users))
  .then(selection => {
    data.selection = selection
    return selection
  })
  .then(selection => {
    console.log("\n" + 'Are you absolutely sure?')
    return promptToContinue(selection)
  })
  .then(selection => {
    api.deleteUser(selection)
  })
  .then(() => {
    console.log(`User ${data.users[data.selection]} was successfully deleted!`)
  })
}

console.log( 'aaaaa' );
console.log( projectType );
if ( 'theme' === projectType ) {
	console.log( 'bbbb' );
	createUser();
	return;
}






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

if ( 'undefined' === typeof projectType || undefined === packageJson.tenup.repos[projectType]) {
	console.error( 'Please specify the what type of project to create:' );
	console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-type> <project-directory>')}` );
	console.log( " Valid project types are 'theme', 'plugin' and 'site'." );
	console.log();
	console.log( 'For example:' );
	console.log(`  ${chalk.cyan( program.name() ) } ${chalk.green( 'theme my-10up-project' ) }` );
	console.log();
	process.exit( 1 );
}

if ( 'undefined' === typeof directoryName || '' === directoryName ) {
	console.error( 'Please specify the project directory:' );
	console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}` );
	console.log();
	console.log( 'For example:' );
	console.log(`  ${chalk.cyan( program.name() ) } ${chalk.green( 'my-10up-project' ) }` );
	console.log();
	process.exit( 1 );
}

const nameSpaces = directoryName.replace( /-/g, ' ' );
const nameCapitalize = nameSpaces.replace( /\b\w/g, l => l.toUpperCase() );
const nameCamelCase = nameCapitalize.replace( / /g, '' );
const nameUnderscores = directoryName.replace( /-/g, '_' );
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
		to: directoryName
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

/*
	Make sure the directory isn't already there before running the script
*/

if ( fs.existsSync( './' + directoryName ) ) {

	console.log( chalk.yellow.bold( '✘ Warning: ' ) + '"' + directoryName + '" directory already exists, please remove it or change the path' );

	// Bail out so you don't delete the directory or error out
	process.exit( 1 );

} else {

	console.log( chalk.yellow( `Setting up your project. This might take a bit.` ) );

}

/*
 * Clone the repo and get to work
**/

function cloneproject( projectType, directoryName ) {
	
	clone( packageJson.tenup.repos[projectType], directoryName,
		function( err ) {

			if ( err ) {

				console.log( err ) ;

			} else {

				console.log( chalk.green( '✔ Clone Successful' ) );

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
if ( 'site' === projectType ) {
	cloneproject( 'site', './' );
	cloneproject( 'plugin', './' + 'plugins/' + directoryName );
	cloneproject( 'theme', './' + 'themes/' + directoryName );
} else {
	cloneproject( projectType, './' + directoryName );

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
