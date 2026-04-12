const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );
const fs = require( 'fs' );

/**
 * Webpack plugin to add ABSPATH guard to generated .asset.php files.
 */
class AddABSPATHGuardPlugin {
	apply( compiler ) {
		compiler.hooks.afterEmit.tap( 'AddABSPATHGuardPlugin', () => {
			const outputPath = compiler.options.output.path;
			this.processDirectory( outputPath );
		} );
	}

	processDirectory( dir ) {
		if ( ! fs.existsSync( dir ) ) {
			return;
		}
		const entries = fs.readdirSync( dir, { withFileTypes: true } );
		for ( const entry of entries ) {
			const fullPath = path.join( dir, entry.name );
			if ( entry.isDirectory() ) {
				this.processDirectory( fullPath );
			} else if ( entry.name.endsWith( '.asset.php' ) ) {
				this.addGuard( fullPath );
			}
		}
	}

	addGuard( filePath ) {
		const content = fs.readFileSync( filePath, 'utf8' );
		if ( content.includes( "defined( 'ABSPATH' )" ) ) {
			return;
		}
		const guard = "if ( ! defined( 'ABSPATH' ) ) {\n\texit;\n}\n";
		const newContent = content.replace( '<?php ', '<?php\n' + guard );
		fs.writeFileSync( filePath, newContent );
	}
}

module.exports = {
	...defaultConfig,
	mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
	entry: path.join( __dirname, 'assets/src/index.js' ),
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
	},
	// module: {},
	resolve: {
		extensions: [ '*', '.js', '.jsx' ],
	},
	plugins: [
		...( defaultConfig.plugins || [] ),
		new AddABSPATHGuardPlugin(),
	],
};
