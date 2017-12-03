module.exports = (req, res, next) => {
	if (!req.user) {
		return res.render('noPermission', { url: req.url });
	}
	next();
};