const SIZE = 6;

var fs = require('fs');

function insert(filename, id, status, callback) {

	fs.open(filename, 'a', function(err, fd) {

		if (err)
			throw err;

		var buffer = new Buffer(SIZE, 'binary');

		buffer.writeUInt32LE(id, 0);
		buffer.writeUInt16LE(status, 4);

		fs.write(fd, buffer, 0, buffer.length, null, function(err) {
			fs.close(fd);
			if (callback)
				callback();
		});

	});
}

function read(filename, max, status, callback) {

	fs.open(filename, 'r', function(err, fd) {

		if (err) {
			callback([], true);
			return;
		}

		var datasource = [];
		read_fd(fd, max, callback, 0, status, datasource);
	});
}

function read_fd(fd, max, callback, offset, status, datasource) {

	var length = (max || 10) * SIZE;
	var buffer = new Buffer(length);
	var position = offset || 0;

	buffer.fill('\0');

	fs.read(fd, buffer, 0, length, position, function(err, bytes, buffer) {

		var stop = parse(buffer, max, status, datasource);

		if (bytes !== length || stop) {
			callback(datasource, true);
			fs.close(fd);
			return;
		}

		read_fd(fd, max, callback, position + length, status, datasource);

	});
}

function parse(buffer, max, status, datasource) {

	var length = buffer.length;
	var current = 0;

	while (current < length) {

		var id = buffer.readUInt32LE(current);
		current += 4;

		var state = buffer.readUInt16LE(current);
		current += 2;

		if (state === status) {
			datasource.push(id);
			if (max > 0 && datasource.length >= max)
				return true;
		}

	}

	return false;
}

function update(filename, id, status, callback) {

	fs.open(filename, 'a', function(err, fd) {

		if (err)
			throw err;

		var buffer = new Buffer(SIZE, 'binary');

		buffer.writeUInt32LE(id, 0);
		buffer.writeUInt16LE(status, 4);

		fs.write(fd, buffer, 0, buffer.length, (id - 1) * SIZE, function(err) {
			fs.close(fd);
			if (callback)
				callback();
		});

	});

}

exports.read = read;
exports.insert = insert;
exports.update = update;