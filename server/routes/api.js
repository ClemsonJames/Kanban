var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UserController');

/**
 * helper function for checking permission
 * returns token from header
 */
function getToken(req){
    return req.headers.authorization.slice(7);
}

/**
* check if user is admin
*/
function isAdmin(req, res, next){

    var token = getToken(req);

    UserController.getByToken(token, function(err, user) {

        if (err) {
            return res.status(500).send(err);
        }

        if (user && user.admin){
            req.user = user;
            return next();
        }

        return res.status(401).send({
            message: 'Get outta here, punk!'
        });

    });
}

/**
*   check if you are owner or admin
*   used for updating user info 
*/
function isOwnerOrAdmin(req, res, next){
    var token = getToken(req);
    var userId = req.params.id;

    UserController.getByToken(token, function(err, user){

        if (err || !user) {
            return res.status(500).send(err);
        }

        if (user.id == userId || user.admin){
            return next();
        }
        return res.status(400).send({
            message: 'Token does not match user id.'
        });
    });
}

/**
 * get user based on id 
 * id = :id
 */
router.get('/users/:id', isOwnerOrAdmin, function(req, res){
    var id = req.params.id;
    UserController.getUserById(id, function(err, user) {
        if (err){
            return res.status(400).send(err);
        }
        return res.status(200).send(user);
    });
});

/**
 * updating user info in the database
 * id = :id
 * body {
 *  info: info 
 * }
 */
router.put('/users/:id/info',isOwnerOrAdmin, function(req, res){
    var info = req.body.info;
    var app = req.body.app;
    var id = req.params.id;
    UserController.updateInfo(id, info, app, function(err, user) {
        if (err){
            return res.status(400).send(err);
        } 
        return res.status(200).send(user);
    });
    
});


/**
* Get all users or based on the filter
*/
router.get('/users', isAdmin, function(req, res){
    var query = req.query;

    if (query.query){
        UserController.getUsers(query, function(err, users) {
            if (err){
                return res.status(400).send(err);
            } 
            return res.status(200).send(users);
            });
    } 
    else {
        UserController.getAll(function(err, users) {
            if (err){
                return res.status(400).send(err);
            } 
            return res.status(200).send(users);
        });
    }
});




module.exports = router