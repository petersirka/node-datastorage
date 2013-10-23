
function DataStorageView(db) {
	this.db = db;
};

DataStorageView.prototype.create = function(name, fn) {
	var self = this;
	self.db.header.views[name] = fn.toString();
	self.db.headerSave();
	self.db.refresh(null, name);
};


module.exports = DataStorageView;