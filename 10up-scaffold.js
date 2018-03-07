const fs = require( 'fs' );
const path = require( 'path' );
const clone = require( 'git-clone' );
const replace = require( 'replace-in-file' );

const directoryName = 'project-name';
const repoToClone = 'https://github.com/timwright12/webpack-starter';

if  (fs.existsSync( './' + directoryName ) ) {

	console.log( '' );
	console.log( '' );
	console.log( 'WARNING: A ' + directoryName + ' directory already exists, please remove it or change the path' );
	console.log( '' );
	
	// Bail out so you don't delete the directory or error out
	return false;

}

clone( repoToClone, './' + directoryName,
	function( err ) {
		
		if ( err ) {

			console.log( err ) ;

		} else {

			console.log( '' );
			console.log( 'Clone Successful' );
			console.log( '' );

			
			// Delete unnecessary files
			deleteFile( directoryName, 'README.md', function() {
				console.log( 'README.md deleted' );
				console.log( '' );
			} );
			
			// Delete unnecessary directories
			deleteDirectory( directoryName + '/.git', function() {
				console.log( '.git deleted' );
				console.log( '' );
			} );
			
			// Find and replace text
			replace( {
				files: directoryName + '/*.*',
				from: 'Hi.',
				to: 'Hello!',
			} )
			.then( changes => {
				console.log( 'Modified files:', changes.join( ', ' ) );
				console.log( '' );
			} )
			.catch( error => {
				console.error( 'Error occurred:', error );
				console.log( '' );
			} );
			
			// Rename directories
			fs.rename( directoryName + '/assets', directoryName + '/new-assets', function ( err ) {
				if ( err ) throw err;
				console.log('Renamed assets');
				console.log( '' );
			} );
		}

	}
);

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
			if ( stats.isDirectory()) {
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
};

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
					return reject(err);
				}
				Promise.all( files.map( function ( file ) {
					return deleteFile( dir, file );
				} ) ).then( function () {
					fs.rmdir( dir, function ( err ) {
						if ( err ) {
							return reject( err) ;
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
};