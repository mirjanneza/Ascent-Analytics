const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const keys = require('../config/config.js').keys;
const url = keys.mongoURI;

var db;
const getClassData = require('../libraries/getClassData.js');

MongoClient.connect(url, function(err, database) {
    if (err) {
        console.log(err);
    }
    else {
        db = database;
    }
});

router.get('/', function(req, res, next) {
    res.render('rubrics');
});

router.get('/rubricCreator', function(req, res, next) {
    res.render('rubricCreator');
});

//Render delete rubric 
router.get('/removeRubric', function(req, res, next) {
    res.render('removeRubric');
});

//submitting the rubric function 
router.post('/rubricCreator', function(req, res){
    var rubricCollection = db.collection('rubrics');
    var finalRubric = req.body;
    rubricCollection.find({}).toArray(function(err, result) {
        if (err) {
            console.log(err);
        } else {
            var uniqueID = 0;
            if (result.length != 0) {
                uniqueID = result[result.length - 1].id + 1;
            }
            finalRubric.id = uniqueID;
            rubricCollection.insert(finalRubric, {ordered: false}, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send({redirect: '/rubrics'});
                }
            });
        }
    });
});

//Grades students
router.post('/gradeStudent', function(req, res) {
    var assignmentCollection = db.collection('assignments');
    
    var assignmentName = req.body.assignmentName;
    var studentID = req.body.id;
    var grades = req.body.grades;
    var overallComments = req.body.overAllComments;
    var topicList = req.body.topicList;
    var topicGrades = req.body.topicGrades;
    var allComments = req.body.allComments;
    
    var scoring = [];
    for (var count = 0; count < topicGrades.length; count++) {
        scoring.push({topic: topicList[count], score: topicGrades[count], comments: allComments[count]});
    }
    
    //Updates the grade with their data
    assignmentCollection.update({'assignmentName':assignmentName, 'students':{$elemMatch:{'id':studentID}}},
    {$set:{'students.$.overAllComments':overallComments, 'students.$.grades':grades, 'students.$.scoring':scoring}}, function(err) {
        if (err) {
            console.log(err);
            res.send({resultString:'ERROR, NOT SAVED'});
        } else {
            res.send({resultString:'Grade is saved'});
        }
    });
    
    assignmentCollection.find({'assignmentName':assignmentName}).toArray(function(err, result) {
        if (err) {
            console.log(err);
        } else {
            var assignmentData = result[0];
            var gradedStudents = assignmentData.students.filter(function(students) {
                if (students.grades >= 0) {
                    return students;
                }
            });
            var avg = 0;
            for (var count = 0; count < gradedStudents.length; count++) {
                avg = avg + gradedStudents[count].grades;
            }
            avg = avg / gradedStudents.length;
            assignmentCollection.update({'assignmentName':assignmentName}, {$set:{avg:avg}}, function(err) {
                if (err) console.log(err);
            });
        }
    });
});



//Gets students grades
router.post('/getGrades', function(req, res) {
    var assignmentCollection = db.collection('assignments');
    var assignmentName = req.body.assignmentName;
    var className = req.body.className;
    getClassData.getClassID(className, db)
    .then(function(classID) {
        assignmentCollection.find({'classID':classID, 'assignmentName':assignmentName}, {'_id':0, 'students':1}).toArray(function(err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.send({studentData: result[0].students});
            }
        });
    });
});

module.exports = router;