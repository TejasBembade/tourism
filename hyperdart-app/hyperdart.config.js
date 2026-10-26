import pkg from './package.json' with {type:'json'}

export default  {
	// import name from package.json
	name: pkg.name,
	triggers: {
		keywords: [
			'tourist attractions',
			'things to do',
			'places to visit',
			'landmarks',
			'sights',
			'points of interest',
			'museums',
			'temples',
			'historic sites',
			'attractions',
			'places',
			'visit',
			'tourism',
			'travel',
			'explore',
			'monuments',
			'parks'
		]
	},
	query_format: {
		regex: [
			'((best|top|famous)\\s+)?(tourist\\s+attractions?|things\\s+to\\s+do|places\\s+to\\s+(visit|see)|landmarks|sights|points\\s+of\\s+interest)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.*',
			'((best|top|famous)\\s+)?(museums?|monuments?|temples?|forts?|viewpoints?|parks?|historic(al)?\\s+sites?)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.*',
			'.*(tourist|places|attraction|visit|things to do|museum|temple|monument|fort|park|landmark|sights).*',
			'.*\\b(in|near|around|at)\\s+HD_LOCATION(__\\w+)?.*',
			'HD_LOCATION'
		]
	},
	server: {
		location: 'dist/backend/index.js',
		configPath: 'dist/backend/wrangler.jsonc',
		schemaPath: 'dist/backend/schema.jsonc'
	},
	client: {
		// location of client side code
		// should point to pkg.umd - but currently that points to dist/index.umd.js
		location: pkg.module,
		// name of the UMD module
		moduleName: pkg.umdName || 'HD' + pkg.name,
		// baseURL is only used in local testing and ignored after publish
		// Optional: defaults to '/name' (the name of the component)
		baseURL: '/' + pkg.name,

	},
	format: {
		mainline: true,
		sidebar: true
		// "sidebar" / "mainline" / "ribbon" / "fullscreen"
	},
	permissions: {
		
	},
	info: {
		// key-values added here will be added to the compInfo section of searchData
	},
	github: "",
	demovideo: ""
}
