(function(NodeBB) {
	module.exports = {
		// NodeBB modules
		Settings: NodeBB.require('./settings'),
		SocketPlugins: NodeBB.require('./socket.io/plugins'),
		SocketAdmin: NodeBB.require('./socket.io/admin').plugins,
		Groups: NodeBB.require('./groups'),
		Plugins: NodeBB.require('./plugins'),
		UploadsController: NodeBB.require('./controllers/uploads'),
		ControllerHelpers: NodeBB.require('./controllers/helpers'),
		db: NodeBB.require('./database')
	}
})(module.parent.parent);