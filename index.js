var fs = require('fs');
var path = require('path');
var utils = require('./utils');
var events = require('events');
var View = require('./views');
var binary = require('./binary');

const HEADER_VERSION = 'v0.0.1';
const LENGTH_DIRECTORY = 9;
const EXTENSION_DOCUMENT = '.json';
const EXTENSION_VIEW = '.view';
const FILE_META = 'db.meta';
const FILE_DB = 'db.data';

const NUMBER = 'number';
const STRING = 'number';
const DATE = 'date';
const UNDEFINED = 'undefined';

function DataStorage(directory) {

	this.name = path.basename(directory);
	this.directory = directory;
	this.path = directory;
	this.cache = {};
	this.isReady = false;

	this.callbackWrite = [];

	this.header = {
		version: HEADER_VERSION,
		index: 1,
		count: 0,
		updated: null,
		created: null,
		description: "",
		views: {},
		stored: {},
		custom: {},
		empty: []
	};

	this.onPrepare = function(doc) {
		return doc;
	};

	this.mkdir('');
	this.headerLoad();

	this.views = new View(this);
}

DataStorage.prototype = new events.EventEmitter();

DataStorage.prototype.headerLoad = function(callback) {
	var self = this;

	fs.readFile(path.join(self.directory, FILE_META), function(err, data) {

		if (!err)
			self.header = JSON.parse(data.toString('utf8'));

		self.isReady = true;

		if (callback)
			callback();

	});
};

DataStorage.prototype.headerSave = function(callback) {
	var self = this;

	if (!callback)
		callback = utils.noop;

	fs.writeFile(path.join(self.directory, FILE_META), JSON.stringify(self.header), callback);
};

DataStorage.prototype.mkdir = function(directory, noPath) {

	var self = this;
	var cache = self.cache;

	if (!noPath)
		directory = path.join(self.path, directory);

	var key = 'directory-' + directory;

	if (cache[key])
		return true;

	if (!fs.existsSync(directory))
		fs.mkdirSync(directory);

	cache[key] = true;
	return true;
};

DataStorage.prototype.directory_index = function(index) {
	return Math.floor(index / 1000) + 1;
};

DataStorage.prototype.directory_name = function(index, isDirectory) {
	var self = this;
	var options = self.options;
	var id = (isDirectory ? index : self.directory_index(index)).toString().padLeft(LENGTH_DIRECTORY, '0');
	var length = id.length;
	var directory = '';

	for (var i = 0; i < length; i++)
		directory += (i % 3 === 0 && i > 0 ? '-' : '') + id[i];

	return path.join(self.path, directory);
};

DataStorage.prototype.insert = function(doc, callback) {

	var self = this;
	var index = self.header.index++;
	var directory = self.directory_name(index);
	var filename = directory + '/' + index.toString().padLeft(LENGTH_DIRECTORY, '0') + EXTENSION_DOCUMENT;

	self.mkdir(directory, true);
	binary.insert(path.join(self.directory, FILE_DB), index, 1);

	fs.writeFile(filename, JSON.stringify(self.onPrepare(doc)), function(err) {

		if (err)
			self.emit('error', err, 'insert', doc);

		self.headerSave();
		self.refresh(doc);

		if (callback)
			callback();

	});

	return index;
};

DataStorage.prototype.db = function(max, status, cb) {
	var self = this;
	binary.read(path.join(self.directory, FILE_DB), max, status, cb);
	return self;
};

DataStorage.prototype.refresh = function(doc, name) {

	var self = this;

	binary.read(path.join(self.directory, FILE_DB), 100, 1, function(arr) {
		console.log(arr);
	});

};

DataStorage.prototype.datasource = function(id, fnFilter, callback, source) {

	var self = this;
	var index = id.shift();

	if (typeof(index) === UNDEFINED) {
		callback(source);
		return;
	}

	var directory = self.directory_name(index);
	var filename = directory + '/' + index.toString().padLeft(LENGTH_DIRECTORY, '0') + EXTENSION_DOCUMENT;

	fs.readFile(filename, function(err, data) {

		if (!err) {

			try
			{
				var json = JSON.parse(data.toString('utf8'));
				var view = fnFilter(json);
				
				if (view !== null && typeof(view) !== UNDEFINED)
					source.push(view);

			} catch (err) {}
		}

		self.datasource(id, fnFilter, callback, source);

	});

	return self;
};

DataStorage.prototype._saveView = function(name, source) {
	var self = this;
	fs.writeFile(path.join(self.directory, name + EXTENSION_VIEW), source);
	return self;
};

module.exports = DataStorage;