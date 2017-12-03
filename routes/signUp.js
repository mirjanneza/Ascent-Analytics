const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const keys = require('../config/config.js').keys;
const url = keys.mongoURI;

var db;

MongoClient.connect(url, function(err, database) {
    if (err) {
        console.log('Fail to connect', err);
    }
    else {
        db = database;
    }
});
//Rendering the page
router.get('/', function(req, res, next) {
    res.render('signUp');
});

router.post('/', function(req, res) {
    const keysDB = db.collection('keys');
    
    keysDB.find({key: req.body.key}).toArray(function(err, result) {
        if (err) {
            console.log(err);
        } else if (result.length == 0) {
            res.send('The key you submitted is wrong');
            return;
        } else {
            console.log(result)
            var newAccount = {email: req.body.email, password: req.body.password, schoolName: req.body.schoolName, permissionLevel: result[0].level};
            createAccount(res, newAccount);
            keysDB.deleteMany({key:result[0].key}, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });
});

function createAccount(res, accountData) {
    const accountCollection = db.collection('users');
    var newAccount = accountData;
    newAccount.loggedDates = [];
    accountCollection.find().sort({id:-1}).limit(1).toArray(function(err, result) { //Sorts and get the highest ID level
        if (err) {
            console.log(err);
        } else {
            newAccount.id = result.length === 0 ? 0 : result[0].id + 1;
            accountCollection.insertOne(newAccount, function(err) {
                if (err) {
                    console.log(err); 
                    res.send(false);
                } else {
                    res.send(true);
                }
            });
        }
    });
}

module.exports = router;