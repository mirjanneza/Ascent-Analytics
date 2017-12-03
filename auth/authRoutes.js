const passport = require('passport');

module.exports = app => {
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email'],
    }));
    
    app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
        res.redirect('https://ascents.herokuapp.com/');
    });
    
    app.get('/api/current-user', (req, res) => {
        if (req.user) {
            res.send(req.user);
        } else {
            res.send(null);
        }
    });
    
    
    
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/', failureRedirect: '/login'
        }), (req, res) => {
            res.redirect('/');
        }
    );

    
    app.get('/auth/logout', (req, res) => {
        if(req.user) {
            console.log(`user ${req.user.email} logged out`);
            req.logout();
            res.redirect('/');
        }
    });
};