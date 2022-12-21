import path, { resolve } from 'path'
import fs from 'fs-extra'
import PugPlugin from 'pug-plugin'
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin'

const __dirname = resolve()
const mode = process.env.NODE_ENV || 'development'
const target = mode === 'development' ? 'web' : 'browserslist'

const templates = fs
	.readdirSync(path.join(__dirname, 'src/templates'))
	.reduce((entries, file) => {
		if (path.extname(file) === '.pug') {
			let tplName = path.parse(file).name
			let tplPath = path.join(__dirname, 'src/templates', file)
			entries[tplName] = tplPath
		}
		return entries
	}, {})

export default {
	mode: mode,
	target: target,

	entry: {
		...templates
	},

	output: {
		path: path.join(__dirname, 'dist/'),
		filename: 'scripts/bundle.min.js',
		clean: true
	},

	module: {
		rules: [
			// Styles
			{
				test: /\.(scss|css)$/i,
				use: [
					{
						loader: 'css-loader'
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [['postcss-preset-env']]
							}
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								includePaths: ['node_modules']
							}
						}
					}
				]
			},

			// Scripts
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},

			// Images
			{
				test: /\.(png|jpg|jpeg|gif|svg)$/i,
				exclude: /images[\\/]icons/,
				type: 'asset/resource',
				generator: {
					filename: (pathData) => {
						let relativePath = pathData.module.resourceResolveData.relativePath
						let dirName = path.dirname(relativePath).replace('./src/', '')
						return dirName + '/[name][ext]'
					}
				}
			},

			// Icons
			{
				test: /\.(svg)$/i,
				type: 'asset',
				include: /images[\\/]icons/
			},

			// Fonts
			{
				test: /\.(woff|woff2)$/i,
				type: 'asset/resource',
				generator: {
					filename: (pathData) => {
						let relativePath = pathData.module.resourceResolveData.relativePath
						let dirName = path.dirname(relativePath).replace('./src/', '')
						return dirName + '/[name][ext]'
					}
				}
			},

			// Templates
			{
				test: /\.pug$/,
				loader: PugPlugin.loader,
				options: {
					method: 'render'
				}
			}
		]
	},

	plugins: [
		new PugPlugin({
			pretty: true,
			extractCss: {
				filename: 'styles/bundle.min.css'
			}
		})
	],

	optimization: {
		minimizer: [
			'...',
			new ImageMinimizerPlugin({
				deleteOriginalAssets: true,
				minimizer: {
					implementation: ImageMinimizerPlugin.squooshMinify,
					options: {
						encodeOptions: {
							mozjpeg: {
								quality: 84
							},
							webp: {
								quality: 90
							},
							oxipng: {
								level: 4,
								interlace: true
							}
						}
					}
				}
			})
		]
	},

	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			'~': path.join(__dirname, 'src/')
		}
	},

	devtool: mode === 'development' ? 'source-map' : false,
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	},

	watchOptions: {
		ignored: '**/node_modules'
	},

	devServer: {
		open: false,
		liveReload: true,
		hot: false,
		port: 3000,
		static: {
			directory: resolve(__dirname, 'dist'),
			staticOptions: {},
			publicPath: resolve(__dirname, 'dist'),
			serveIndex: true,
			watch: false
		}
	}
}
