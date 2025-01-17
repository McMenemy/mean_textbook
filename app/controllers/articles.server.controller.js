'use strict';

// Load module dependencies
var mongoose = require('mongoose'),
	Article = mongoose.model('Article');

// handle error
var getErrorMessage = function(err) {
	if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) return err.errors[errName].message;
		}
	} else {
		return 'Unknown server error';
	}
};

// create article
exports.create = function(req, res) {
	var article = new Article(req.body);
	article.creator = req.user;

	article.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};

// retrieve article
exports.list = function(req, res) {
	Article.find().sort('-created').populate('creator', 'firstName lastName fullName').exec(function(err, articles) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.json(articles);
		}
	});
};

// return existing article
exports.read = function(req, res) {
	res.json(req.article);
};

// update article
exports.update = function(req, res) {
	var article = req.article;
	article.title = req.body.title;
	article.content = req.body.content;

	article.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};

// delete article
exports.delete = function(req, res) {
	var article = req.article;

	article.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};

// retrieve single article
exports.articleByID = function(req, res, next, id) {
	Article.findById(id).populate('creator', 'firstName lastName fullName').exec(function(err, article) {
		if (err) return next(err);
		if (!article) return next(new Error('Failed to load article ' + id));

		// use'request' object to pass to next middleware
		req.article = article;

		next();
	});
};

// authorization check
exports.hasAuthorization = function(req, res, next) {
	if (req.article.creator.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}

	next();
};