(function(NodeBB) {
	module.exports = {
		// NodeBB modules
		Settings: NodeBB.require('./src/settings'),
		SocketIndex: NodeBB.require('./src/socket.io/index'),
		SocketPlugins: NodeBB.require('./src/socket.io/plugins'),
		SocketAdmin: NodeBB.require('./src/socket.io/admin').plugins,
		User: NodeBB.require('./src/user'),
		Groups: NodeBB.require('./src/groups'),
		Plugins: NodeBB.require('./src/plugins'),
		UploadsController: NodeBB.require('./src/controllers/uploads'),
		ControllerHelpers: NodeBB.require('./src/controllers/helpers'),
		Pagination: NodeBB.require('./src/pagination'),
		db: NodeBB.require('./src/database'),
		Templates: NodeBB.require('templates.js'),
        utils: NodeBB.require('./public/src/utils'),
		winston: NodeBB.require('winston')
	}
})(require.main);