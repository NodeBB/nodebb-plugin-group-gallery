(function(NodeBB) {
	module.exports = {
		// NodeBB modules
		Settings: NodeBB.require('./settings'),
		SocketIndex: NodeBB.require('./socket.io/index'),
		SocketPlugins: NodeBB.require('./socket.io/plugins'),
		SocketAdmin: NodeBB.require('./socket.io/admin').plugins,
		User: NodeBB.require('./user'),
		Groups: NodeBB.require('./groups'),
		Plugins: NodeBB.require('./plugins'),
		UploadsController: NodeBB.require('./controllers/uploads'),
		ControllerHelpers: NodeBB.require('./controllers/helpers'),
		db: NodeBB.require('./database')
	}
})(module.parent.parent);