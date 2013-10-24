var DataStorage = require('./index');
var db = new DataStorage('/users/petersirka/desktop/test/datastorage/');

setTimeout(function() {

	//console.log(db.insert({ firstname: 'Janko', lastname: 'Hraško', age: 20 }));
	//db.refresh(null);
	/*
	db.views.create('firstname', function(doc) {
		return doc.firstname;
	});
	*/
	db.views.refresh('firstname');

}, 500);
