var DataStorage = require('./index');
var db = new DataStorage('/users/petersirka/desktop/test/datastorage.ds');

// db.schema({ age: 'Number', firstname: 'String(30)', lastname: 'String(30)' });

//var buffer = new Buffer(256);

//buffer.write('Peter');
// buffer.fill('\0', 10, 20);
// console.log(buffer.toString('binary'));

//buffer.writeInt32LE(10, 0);
//buffer.writeInt32LE(2, 4);
//buffer.writeInt32LE(122, 8);

//var val = 'Ů';
//console.log(buffer.write(val, 0));
//console.log(val.length);

//console.log(buffer);
//console.log('');

//console.log(buffer);

setTimeout(function() {
	
	//db.insert({ firstname: 'Peter', 'lastname': 'Širka', age: 20 });
	//db.insert({ firstname: 'Janko', 'lastname': 'Hraško', age: 20 });
	db.all();

}, 1000);