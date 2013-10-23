
exports.parseIndex = function(id) {

	var length = id.length;
	var beg = 0;

	id = id.toString().replace(/\-/g, '');

	for (var i = 0; i < length; i++) {
		if (id[i] !== '0') {
			beg = i;
			break;
		}
	}

	return parseInt(id.substring(beg), 10);
};

exports.noop = function() {};

if (!String.prototype.padLeft) {
	String.prototype.padLeft = function(max, c) {
		var self = this.toString();
		return new Array(Math.max(0, max - self.length + 1)).join(c || ' ') + self;
	};
}

if (!String.prototype.padRight) {
	String.prototype.padRight = function(max, c) {
		var self = this.toString();
		return self + new Array(Math.max(0, max - self.length + 1)).join(c || ' ');
	};
}

if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^[\s]+|[\s]+$/g, '');
	};
}