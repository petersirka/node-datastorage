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

		read_fd(fd, max, callback, 0, status);
	});
}

function read_fd(fd, max, callback, offset, status) {

	var length = (max || 10) * SIZE;
	var buffer = new Buffer(length);
	var position = offset || 0;

	buffer.fill('\0');

	fs.read(fd, buffer, 0, length, position, function(err, bytes, buffer) {

		if (bytes !== length) {
			callback(parse(buffer, max, status), true);
			fs.close(fd);
			return;
		} else
			callback(parse(buffer, max, status), false);

		read_fd(fd, max, callback, position + length, status);

	});
}

function parse(buffer, max, status) {

	var arr = [];
	var length = buffer.length;
	var current = 0;

	while (current < length) {

		var id = buffer.readUInt32LE(current);
		current += 4;

		var state = buffer.readUInt16LE(current);
		current += 2;

		if (state === status)
			arr.push(id);

	}

	return arr;
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