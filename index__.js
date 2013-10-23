var fs = require('fs');
var path = require('path');

const HEADER_VERSION = 'v0.0.1';
const HEADER_LENGTH  = 2048;
const STRING_LENGTH  = 50;
const STRING_SIZE    = 2;
const FIELD_ALLOCATE = 4 + 4 + 4 + 8 + 8;

const NUMBER = 'number';
const STRING = 'number';
const DATE = 'date';

// FILE RECORD

// index     (int)
// state     (int)
// count     (int)
// created   (int)
// updated   (int)

function Header() {
	this.version = HEADER_VERSION;
	this.schema = {};
	this.size = 0;
	this.index = 0;
	this.count = 0;
}

function DataStorage(filename) {

	this.filename = filename;
	this.name = path.basename(filename).replace(path.extname(filename), '');
	this.directory = path.dirname(filename);

	this.onPrepare = function(doc) {
		return doc;
	};

	this.onProperty = function(property, value) {
		return value;
	};

	this.header = new Header();
	this.current = null;

	this.headerRead();
}

DataStorage.prototype.headerWrite = function() {

	var self = this;

	fs.open(self.filename, 'w', function(err, fd) {

		self._headerWrite(fd, function() {
			fs.close(fd);
		});

	});

	return self;
};

DataStorage.prototype._headerWrite = function(fd, cb) {

	var self = this;
	var buf = new Buffer(HEADER_LENGTH, 'binary');
	var len = buf.write(JSON.stringify(self.header));
	buf.fill('\0', len);

	fs.write(fd, buf, 0, HEADER_LENGTH, 0, function() {
		if (cb)
			cb()
	});
}

DataStorage.prototype.headerRead = function() {

	var self = this;

	fs.open(self.filename, 'r', function(err, fd) {

		if (err)
			return;

		fs.read(fd, new Buffer(HEADER_LENGTH), 0, HEADER_LENGTH, 0, function(err, bytes, buffer) {

			var header = buffer.toString('utf8');
			var index = header.indexOf('\0');

			if (index !== -1)
				header = header.substring(0, index);

			self.header = JSON.parse(header);
			self.headerRefresh();

		});

		fs.close(fd);
	});

	return self;
};

DataStorage.prototype.schema = function(definition) {
	var self = this;
	self.header.schema = definition;
	self.headerRefresh();
	self.headerWrite();
	return self;
};

DataStorage.prototype.headerRefresh = function() {

	var self = this;
	var properties = Object.keys(self.header.schema);
	var length = properties.length;
	var size = 0;

	self.current = {};

	for (var i = 0; i < length; i++) {

		var prop = properties[i];
		var type = self.header.schema[prop].toLowerCase();
		var index = type.indexOf('(');
		var additional = parseInt(index !== -1 ? type.substring(index + 1, type.length - 1) : '0', 10);
		var bufsize = 0;

		if (index !== -1)
			type = type.substring(0, index);

		switch (type) {

			case 'str':
			case 'text':
			case 'varchar':
			case 'string':
			case 'nvarchar':

				type = 'string';

				if (additional <= 0)
					additional = STRING_LENGTH;

				bufsize = additional * STRING_SIZE;
				break;

			case 'int':
			case 'integer':
			case 'long':
			case 'number':
				type = 'number';
				bufsize = 4;
				break;

			case 'date':
			case 'datetime':
			case 'time':
				type = 'date';
				bufsize = 8;
				break;

			case 'single':
			case 'decimal':
				type = 'float';
				bufsize = 4;
				break;

			default:

				type = '';
				break;
		}

		if (type.length === 0)
			continue;

		size += bufsize + FIELD_ALLOCATE;
		self.current[prop] = { type: type, length: additional, size: bufsize };
	}

	self.header.size = size;
	return self;
}

DataStorage.prototype.insert = function(doc) {

	var self = this;

	fs.open(self.filename, 'a', function(err, fd) {

		if (err)
			throw err;

		var size = self.header.size;
		var buffer = new Buffer(size);

		var properties = Object.keys(self.current);
		var length = properties.length;
		var offset = 0;

		doc = self.onPrepare(doc);

		self.header.index++;
		self.header.count++;

		buffer.writeInt32LE(self.header.index, offset);
		offset += 4;

		buffer.writeInt32LE(1, offset);
		offset += 4;

		buffer.writeDoubleLE(new Date().getTime(), offset);
		offset += 8;

		buffer.writeDoubleLE(new Date().getTime(), offset);
		offset += 8;

		for (var i = 0; i < length; i++) {

			var name = properties[i];
			var property = self.current[name];
			var value = self.onProperty(name, doc[name]);

			switch (property.type) {

				case 'number':

					if (typeof(value) !== NUMBER)
						value = parseInt(value || '', 10);

					if (isNaN(value))
						value = 0;

					buffer.writeInt32LE(value, offset);
					offset += property.size;

					break;

				case 'float':

					if (typeof(value) !== NUMBER)
						value = parseFloat(value || '');

					if (isNaN(value))
						value = 0;

					buffer.writeFloatLE(value, offset);
					offset += property.size;

					break;

				case 'string':

					if (typeof(value) !== STRING)
						value = (value || '').toString();

					if (value.length > property.length)
						value = value.substring(0, property.length);

					var len = buffer.write(value, offset);

					if (len < property.size)
						buffer.fill('\0', offset + len, offset + len + (property.size - len));

					offset += property.size;

					break;

				case 'date':

					buffer.writeDoubleLE(value.getTime(), offset);
					offset += property.size;

					break;
			}
		}

		fs.write(fd, buffer, 0, buffer.length, HEADER_LENGTH + (self.header.count * self.header.size), function(err) {

			console.log(err);

			self._headerWrite(fd, function() {
				fs.close(fd);
			});
		});

	});

};

DataStorage.prototype.all = function(prop, fnFilter, fnCallback) {

	var self = this;

	fs.open(self.filename, 'r', function(err, fd) {

		var count = self.header.count;
		var keys = Object.keys(self.current);
		
		var buffer = new Buffer();
		fs.read()

		

	});

};

function prepareString(value) {
	var index = value.indexOf('\0');
	if (index === -1)
		return value;
	return value.substring(0, index);
}

module.exports = DataStorage;