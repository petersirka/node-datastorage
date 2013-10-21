
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