'use strict';

// Load module dependencies
var mongoose = require('mongoose'),
	crypto = require('crypto'),
	Schema = mongoose.Schema;

// Define Schema
var UserSchema = new Schema({
	firstName: String,
	lastName: String,
	email: {
		type: String,
		match: [/.+\@.+\..+/, "Please fill a valid email address"]
	},
	username: {
		type: String,
		unique: true,
		required: 'Username is required',
		trim: true
	},
	password: {
		type: String,
		validate: [
			function(password) {
				return password && password.length > 6;
			}, 'Password should be longer'
		]
	},
	salt: {
		type: String
	},
	// provider for setting up oAuth
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerId: String,
	providerData: {},
	created: {
		type: Date,
		default: Date.now
	}
});

// Set 'fullname' virtual property
UserSchema.virtual('fullName').get(function() {
	return this.firstName + ' ' + this.lastName;
}).set(function(fullName) {
	var splitName = fullName.split(' ');
	this.firstName = splitName[0] || '';
	this.lastName = splitName[1] || '';
});

// Use pre-save middleware to hash password
UserSchema.pre('save', function(next) {
	if (this.password) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

// instance method for hashing a password
UserSchema.methods.hashPassword = function(password) {
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

// instance method for authenticating user
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

// Find possible not used username
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;

	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

// Configure 'UserSchema' to use getters and virtuals when transforming to JSON
UserSchema.set('toJSON', {
	getters: true,
	virtuals: true
});

mongoose.model('User', UserSchema);