// Copyright Peter Širka, Web Site Design s.r.o. (www.petersirka.sk)
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var utils = require('./utils');
var path = require('path');
var fs = require('fs');
var events = require('events');

const EXTENSION_HEADER = '.header';
const EXTENSION_SCHEMA = '.schema';
const EXTENSION_DOC = '.json';
const EXTENSION_CHANGELOG = '.log';
const EXTENSION_TMP = '.tmp';

const LENGTH_DIRECTORY = 9;

const STRING = 'string';
const BOOLEAN = 'boolean';
const JPEG = 'image/jpeg';
const PNG = 'image/png';
const GIF = 'image/gif';
const ENCODING = 'utf8';

function Header() {
	this.index = 0;
	this.count = 0;
	this.schema = {};
}

function DataStorage(filename) {

	this.path = path.dirname(filename);
	this.filename = filename;
	this.name = path.basename(filename).replace(path.extname(filename), '');
	this.directory = path.dirname(filename);
	this.header = new Header();
	this.cache = {};

	this.onPrepare = function(doc) {
		return doc;
	};

}

DataStorage.prototype = new events.EventEmitter();

/*
	===============================================================
	INTERNAL
	===============================================================
*/

DataStorage.prototype._verification = function() {
	var self = this;
	self._mkdir(self.path, true);
	self._load();
	return self;
};

DataStorage.prototype._load = function() {
	var self = this;
	var filename = path.join(self.path, self.name + EXTENSION_HEADER);

	if (!fs.existsSync(filename))
		return self;

	var json = fs.readFileSync(filename, ENCODING).toString();
	if (json.length === 0)
		return self;

	self.header = JSON.parse(json);
	return self;
};

DataStorage.prototype._mkdir = function(directory, noPath) {

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

DataStorage.prototype._directory_index = function(index) {
	return Math.floor(index / 1000) + 1;
};

DataStorage.prototype._directory = function(index, isDirectory) {
	var self = this;
	var options = self.options;
	var id = (isDirectory ? index : self._directory_index(index)).toString().padLeft(LENGTH_DIRECTORY, '0');
	var length = id.length;
	var directory = '';

	for (var i = 0; i < length; i++)
		directory += (i % 3 === 0 && i > 0 ? '-' : '') + id[i];

	return path.join(self.path, directory);
};

DataStorage.prototype._save = function() {

	var self = this;
	var filename = path.join(self.path, self.name + EXTENSION_HEADER);
	console.log(filename);
	fs.writeFile(filename, JSON.stringify(self.header), utils.noop);

};

module.exports = DataStorage;