'use strict';

var lrSnippet = require( 'grunt-contrib-livereload/lib/utils' ).livereloadSnippet;
var mountFolder = function ( connect, dir ) {
	return connect.static( require( 'path' ).resolve( dir ) );
};

module.exports = function ( grunt ) {
	// load all grunt tasks
	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	var sourcesPaths = {
		development: 'sources',
		http: 'build',
		production: 'build',
		temp: '.tmp',
		test: 'test'
	};

	grunt.initConfig( {
		path: sourcesPaths,
		folder: {
			templates: 'templates',
			scripts: 'js',
			styles: 'css',
			fonts: 'font',
			images: 'img',
			pictures: 'pic',
			components: 'components',
			swf: 'swf'
		},
		targets: [ 'desktop' ],
		meta: {
			header: '/* Copyright 2013, INDEE Interactive */\n',
			footer: '\n/* End of source */'
		},

		watch: {
			scripts: {
				files: [ '<%= path.development %>/<%= folder.scripts %>/{,*/}*.js' ],
				tasks: [ 'rig' ],
				options: {
					livereload: true
				}
			},
			compass: {
				files: ['<%= path.development %>/<%= folder.styles %>/{,**/}*.{scss,sass}'],
				tasks: ['compass'],
				options: {
					livereload: true
				}
			}
		},

		connect: {
			options: {
				port: 9000,
				hostname: '*'
			},
			simple: {
				options: {
					middleware: function ( connect ) {
						return [
							mountFolder( connect, sourcesPaths.temp ),
							mountFolder( connect, sourcesPaths.development )
						];
					}
				}
			},
			livereload: {
				options: {
					middleware: function ( connect ) {
						return [
							lrSnippet,
							mountFolder( connect, sourcesPaths.temp ),
							mountFolder( connect, sourcesPaths.development )
						];
					}
				}
			},
			test: {
				options: {
					middleware: function ( connect ) {
						return [
							mountFolder( connect, sourcesPaths.temp ),
							mountFolder( connect, sourcesPaths.test )
						];
					}
				}
			}
		},
		open: {
			server: {
				url: 'http://localhost:<%= connect.options.port %>'
			}
		},

		clean: {
			options: {
				force: true
			},
			test: '.tmp',
			dist: {
				files: [
					{
						dot: true,
						src: [
							'.tmp',
							'<%= path.production %>/*',
							'!<%= path.production %>/.git*'
						]
					}
				]
			}
		},

		rig: {
			dist: {
				options: {
					banner: '/* Copyright 2013, INDEEPOP */\n',
					footer: '\n/* End of source */'
				},
				files: [
					{
						expand: true,
						cwd: '<%= path.development %>/<%= folder.scripts %>',
						src: '*.js',
						dest: '<%= path.temp %>/<%= folder.scripts %>'
					}
				]
			},
			compile: {
				options: {
					banner: '/* Copyright 2013, INDEEPOP */\n',
					footer: '\n/* End of source */'
				},
				files: [
					{
						expand: true,
						cwd: '<%= path.development %>/<%= folder.scripts %>',
						src: '*.js',
						dest: '<%= path.production %>/<%= folder.scripts %>'
					}
				]
			}
		},
		compass: {
			options: {
				app: 'stand_alone',
				sassDir: '<%= path.development %>/<%= folder.styles %>',
				cssDir: '<%= path.temp %>/<%= folder.styles %>',
				imagesDir: '<%= path.development %>/<%= folder.images %>',
				httpImagesPath: '/<%= path.http %>/<%= folder.images %>',
				httpGeneratedImagesPath: '/<%= path.http %>/<%= folder.images %>',
				httpFontsPath: '/<%= path.http %>/<%= folder.fonts %>',
				javascriptsDir: '<%= path.development %>/<%= folder.scripts %>',
				fontsDir: '<%= path.development %>/<%= folder.fonts %>',
				importPath: '<%= path.development %>/<%= folder.components %>',
				relativeAssets: false,
				environment: 'development',
				outputStyle: 'expanded',
				require: [
					'rgbapng',
					'toolkit',
					'./<%= path.development %>/<%= folder.styles %>/extensions/files.rb'
				]
			},
			dist: {
				options: {
					environment: 'production',
					outputStyle: 'compact',
					noLineComments: true
				}
			}
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'<%= path.development %>/<%= folder.scripts %>/{,*/}*.js',
				'!<%= path.development %>/<%= folder.scripts %>/{vendor,components}/{,*/}*.js',
				'!<%= path.development %>/<%= folder.scripts %>/common.js'
			]
		},

		uglify: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= path.temp %>/<%= folder.scripts %>',
						src: ['*.js', '!*.min.js'],
						dest: '<%= path.production %>/<%= folder.scripts %>'
					}
				]
			}
		},
		cssmin: {
			options: {
				report: true
			},
			minify: {
				expand: true,
				cwd: '<%= path.temp %>/<%= folder.styles %>',
				src: ['*.css', '!*.min.css'],
				dest: '<%= path.production %>/<%= folder.styles %>',
				ext: '.css'
			}
		},
		imagemin: {
			options: {
				force: true
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= path.development %>/<%= folder.images %>',
						src: '{,**/}*.{png,jpg,jpeg}',
						dest: '<%= path.production %>/<%= folder.images %>'
					}, {
						expand: true,
						cwd: '<%= path.development %>/<%= folder.pictures %>',
						src: '{,**/}*.{png,jpg,jpeg}',
						dest: '<%= path.production %>/<%= folder.pictures %>'
					}

				]
			}
		},

		copy: {
			dist: {
				files: [
					{
						expand: true,
						dot: true,
						cwd: '<%= path.development %>',
						dest: '<%= path.production %>',
						src: [
							'*.{ico,txt}',
							'.htaccess',
							// 'components/**/*',
							'videos/*',
							'<%= folder.scripts %>/vendor/{,**/}*.js',
							'<%= folder.images %>/{,**/}*.{gif,webp,svg,svgz}',
							'<%= folder.fonts %>/*',
							'<%= folder.swf %>/*',
							'<%= folder.components %>/jquery/jquery.min.js'
						]
					}
				]
			}
		}
	} );

	grunt.registerTask( 'server', [
		'clean:test',

		'rig:dist',
		'compass',

		'connect:livereload',
		'watch'
	] );

	grunt.registerTask( 'server_manual', [
		'clean:test',

		'rig:dist',
		'compass:test',

		'connect:simple',
		'watch'
	] );

	grunt.registerTask( 'build', [
		'clean:dist',

		// 'jshint',

		'rig:dist',
		'compass',

		'uglify',
		'cssmin',
		'imagemin',

		'copy'
	] );

	grunt.registerTask( 'default', ['build'] );
};