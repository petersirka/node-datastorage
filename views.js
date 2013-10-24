
function View(db) {
	this.db = db;
};

View.prototype.create = function(name, fnMap, fnSort) {
	var self = this;
	var db = self.db;
	db.header.views[name] = { map: fnMap.toString(), sort: (fnSort || '').toString() };
	db.headerSave();
	db.refresh(null, name);
	return self;
};

View.prototype.refresh = function(name, callback) {

	var self = this;
	var db = self.db;
	var view = db.header.views[name];

	if (typeof(view) === 'undefined')
		return false;

	var fnSort = (view.sort || '').length === 0 ? null : eval('(' + view.sort + ')');
	var fnMap = eval('(' + view.map + ')');

	db.db(0, 1, function(arr) {
		var datasource = [];
		db.datasource(arr, fnMap, function(datasource) {
			
			if (fnSort)
				datasource.sort(fnSort);

			var str = '';
			var length = datasource.length;
			
			for (var i = 0; i < datasource.length; i++)
				str += JSON.stringify(datasource[i]) + '\n';

			db._saveView(name, str);

		}, datasource);
	});

};

module.exports = View;