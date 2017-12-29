/*global $*/
/*global Chart*/

var studentProfile;
var averageBarTopic;
var gradedStudentsChart;
var studentPerformanceChart;
var studentAvgChart;
var topicAvgChart;
var rubricUsed;
//variables used to calculate completion rate
var completedAssignmentNum = 0;
var uncompletedAssignmentNum = 0;

var assignments = [];
$(function() {
    $('#topic-chart').hide();
    $('#graded-students').hide();
    $('#perf-chart').hide();
    $('#avg-chart').hide();
    $('#topicAvg-chart').hide();
    $('#topicList').hide();
    getStudentProfile();
    getAssignmentData();
});

// function getRubricUsed(){
//     $.ajax({
//         url:'/api/rubrics',
//         method: 'GET',
//         success: function(response) {
//             studentProfile = response;
//             console.log("The ajax call for student profile returns ", studentProfile);
//             //append the html header with the correct rubric
//             $('#rubric-used').append($('<option>', {
//                 value: 'default',
//                 text : 'Select an assignment'
//             }));
//         }
//     });  
// }

function getStudentProfile() { //Gets student data
    $.ajax({
        url:'/api/students',
        method: 'GET',
        success: function(response) {
            studentProfile = response;
            console.log("The ajax call for student profile returns ", studentProfile);
        }
    });
}

function getAssignmentData() {
    $.ajax({
        url:'/api/assignments',
        method: 'GET',
        success: function(response) {
            assignments = response;
            console.log("The ajax call for assignments returns ", assignments);
            $('#assignmentList').append($('<option>', {
                value: 'default',
                text : 'Select an assignment'
            }));
            var list = response;
            
            for(var assignmentCount = 0; assignmentCount < list.length; assignmentCount++){
                $('#assignmentList').append($('<option>', {
                    value: list[assignmentCount].assignmentName,
                    text : list[assignmentCount].assignmentName
                }));
            }
            createChart();
            
        }
    });
}


function createChart() {
    var topicAverage = $('#bar-topic'); //Creates bar chart
    averageBarTopic = new Chart(topicAverage,{
        responsive:true,
        type: 'bar',
        data: {
            labels: null,
            datasets: []
        },
        options: {
            title: {
                display: true,
                text: 'Topic Averages'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
    
    var gradedStudents = $('#graded-chart'); //Graded student chart
    gradedStudentsChart = new Chart(gradedStudents, {
        responsive:true,
        type: 'pie',
        data: {
            labels: ['Graded','Ungraded'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(145, 237, 120, 0.2)',
                    'rgba(245, 154, 112, 0.2)'],
                borderColor: [
                    'rgba(145, 237, 120, 1)',
                    'rgba(245, 154, 112, 1)'],
                label: 'Averages per Topic'
            }]
        }
    });
    
    var studentPerformance = $('#student-chart');
    studentPerformanceChart = new Chart(studentPerformance, {
        responsive: true,
        type: 'radar',
        data: {
            labels: null,
            datasets: [{
                data: null,
                backgroundColor: ['rgba(209, 61, 86, 0.2)'],
                borderColor: ['rgba(209, 61, 86, 1)'],
                label: 'Class Benchmark'
            }, {
                data: null,
                backgroundColor: ['rgba(61, 135, 209, 0.2)'],
                borderColor: ['rgba(61, 135, 209, 1)'],
                label: 'Student Benchmark'
            }]
        },
        options: {
            scales: {
                ticks: {
                    min: 0,
                    max: 1
                }
            }
        }
    });
    
    var scoringAvg = $('#avg-chart');
    studentAvgChart = new Chart(scoringAvg, {
        type: 'line',
        data: {
            datasets:[{
                label: 'Assignment Average',
                radius: 0,
                data: null,
                backgroundColor: 'rgba(247, 143, 69, 0.2)',
                borderColor: 'rgba(247, 143, 69, 1)'
            }, {
                label: 'Student Score',
                data: null,
                type: 'bubble',
                backgroundColor: 'rgba(2, 178, 247, 0.2)',
                borderColor: 'rgba(2, 178, 247, 1)'
            }],
            labels: null,
        },
        options: {
            title: {
                display: true,
                text: 'Student Score VS Assignment Average'
            },
            legend: {
                labels: {
                    boxWidth: 15
                }
            },
            tooltips: {
                mode: 'index'
            }
        }
    });
    
    var topicAvg = $('#topicAvg-chart');
    topicAvgChart = new Chart(topicAvg, {
        type: 'line',
        data: {
            datasets:[{
                label: 'Topic Average',
                radius: 0,
                data: null,
                backgroundColor: 'rgba(247, 143, 69, 0.2)',
                borderColor: 'rgba(247, 143, 69, 1)'
            }, {
                label: 'Student Score',
                data: null,
                type: 'bubble',
                backgroundColor: 'rgba(2, 178, 247, 0.2)',
                borderColor: 'rgba(2, 178, 247, 1)'
            }],
            labels: null,
        },
        options: {
            responsive:true,
            title: {
                display: true,
                text: 'Student Score VS Topic Average'
            },
            legend: {
                labels: {
                    boxWidth: 15
                }
            }
        }
    });
    
}


function changeChart() { //Updates the chart with new assignment
    var searchAssignment = $('#assignmentList').val();
    if (searchAssignment !== 'default') {
        var assignmentPos;
        for (var count = 0; count < assignments.length; count++) { //Gets position of assignment
            if (assignments[count].assignmentName === searchAssignment) {
                assignmentPos = count;
            }
        }
        $('#studentList').empty();
        
        var assignmentStudents = assignments[assignmentPos].students; //Gets all assignment students
        var assignmentStats = [];
        for(var count = 0; count < assignmentStudents.length; count++) {
            var studentScoring = assignmentStudents[count].scoring;
            var studentId = assignmentStudents[count].id;
            
            //Iterate through scoring array
            for(var x = 0; x < studentScoring.length; x++){ //Adds data to assignment stats
                var dataEntry = {};
                dataEntry.id = studentId;
                dataEntry.topic = studentScoring[x].topic;
                dataEntry.score = studentScoring[x].score;
                assignmentStats.push(dataEntry);
            }
            if (assignmentStudents[count].grades != -1) {
                for (var nameCount = 0; nameCount < studentProfile.length; nameCount++) {
                    if (studentProfile[nameCount].id === assignmentStudents[count].id) {
                        $('#studentList').append($('<option>', {
                            value: assignmentStudents[count].id,
                            text : studentProfile[nameCount].fName + ' ' + studentProfile[nameCount].lName
                        }));
                    }
                }
            }
            $('#studentList').show();
        }
        var topicsList = [];
        for (var topics = 0; topics < assignmentStudents[0].scoring.length; topics++) {
            topicsList.push(assignmentStudents[0].scoring[topics].topic);
        }
        //current position
        getTopics(topicsList);
        overallAssignmentAverage(assignmentStudents);
        getAverage(assignmentStats);
        calculateGraded(assignmentStats, topicsList.length);
        $('#perf-chart').show();
        $('#avg-chart').show();
        $('#topicAvg-chart').show();
        $('#topicList').show();
    }
}

function filterAverages () { //Filters student performance base on certain aspects such as SPED or ELL
    var assignmentStudentData;
    for (var count = 0; count < assignments.length; count++) { //Finds assignment student data
        if (assignments[count].assignmentName === $('#assignmentList').val()) {
            assignmentStudentData = assignments[count].students;
        }
    }
    var assignmentStats = []; //Calculates all the student assignment data
    for(var count = 0; count < assignmentStudentData.length; count++) {
        var studentScoring = assignmentStudentData[count].scoring;
        var studentId = assignmentStudentData[count].id;
        
        //Iterate through scoring array
        for(var x = 0; x < studentScoring.length; x++){ //Adds data to assignment stats
            var dataEntry = {};
            dataEntry.id = studentId;
            dataEntry.topic = studentScoring[x].topic;
            dataEntry.score = studentScoring[x].score;
            assignmentStats.push(dataEntry);
        }
    }
    console.log(assignmentStats); //Assignment Data
    
    //Filtering the default student list with filtering tool
    var studentData = studentProfile;
    if ($('#filter-male').is(':checked')) {
        studentData = studentData.filter(function(student) {
            if (student.gender === 'M') {
                return student;
            }
        });
    }
    if ($('#filter-fmale').is(':checked')) {
        studentData = studentData.filter(function(student) {
            if (student.gender === 'F') {
                return student;
            }
        });
    }
    if ($('#filter-sped').is(':checked')) {
        studentData = studentData.filter(function(student) {
            if (student.sped === 'y') {
                return student;
            }
        });
    }
    if ($('#filter-ell').is(':checked')) {
        studentData = studentData.filter(function(student) {
            if (student.ell === 'y') {
                return student;
            }
        });
    }
    console.log(studentData);
    
    //Filter assignment student with the filtering tool
    var finalStudentData = [];
    for (var count = 0; count < studentData.length; count++) {
        assignmentStats.filter(function(student) {
            if (student.id === studentData[count].id) {
                finalStudentData.push(student);
            }
        });
    }
    console.log(finalStudentData)
    getAverage(finalStudentData);
}

//Get topic averages
function getAverage(studentData){
    var studentIDs = [];
    var topics = [];
    var score_point_avg = [];
    var score_student_total = [];
    
    //iterate through the array 
    for(var count = 0; count < studentData.length; count++){
        //get an array of just students
        if(studentIDs.indexOf(studentData[count].id) === -1){
            studentIDs.push(studentData[count].id);
        }
        //get an array of just topics
        if(topics.indexOf(studentData[count].topic) === -1){
            topics.push(studentData[count].topic);
        }
    }
    
    for(var count = 0; count < topics.length; count++) { //Cycles through all the available topics
        score_point_avg.push(0);
        score_student_total.push(0);
        for (var topicAverages = count; topicAverages < studentData.length; topicAverages = topicAverages + topics.length) { //Calculates average for each topic
            if (studentData[topicAverages].score != null) {
                score_point_avg[count] = score_point_avg[count] + studentData[topicAverages].score;
                score_student_total[count]++;
            }
        }
    }

    for(var scoreCount = 0; scoreCount < score_point_avg.length; scoreCount++){
        score_point_avg[scoreCount] = parseFloat((score_point_avg[scoreCount]/score_student_total[scoreCount]).toFixed(5)) * 100;
    }
    
    averageBarTopic.data.labels = topics;
    averageBarTopic.data.datasets = [];
    for (var count = 0; count < topics.length; count++) { //Adds to the average topic bar chart and generates a random RGBA color
        var generateRGBA = 'rgba(';
        for (var colorGenerator = 0; colorGenerator < 3; colorGenerator++) {
            generateRGBA += (Math.random()*256).toFixed(0);
            generateRGBA += ','
        }
        generateRGBA += '1)';
        averageBarTopic.data.datasets.push({label: topics[count], data: [score_point_avg[count]], backgroundColor:[generateRGBA]});
    }
    
    averageBarTopic.update();
    $('#topic-chart').show();
    
    studentPerformanceChart.data.labels = topics;
    studentPerformanceChart.data.datasets[0].data = score_point_avg;
    studentPerformanceChart.update();
}

function overallAssignmentAverage(studentData) {
    
    var gradedCount = 0;
    var gradedAvg = 0;
    for (var count = 0; count < studentData.length; count++) { //Calc graded student average
        if (studentData[count].grades != -1) {
            gradedAvg = gradedAvg + studentData[count].grades;
            gradedCount++;
            completedAssignmentNum++;
        }
        else{
            uncompletedAssignmentNum++;
        }
    }
    var tempTotal = completedAssignmentNum+uncompletedAssignmentNum;
    var completionRate = (completedAssignmentNum/tempTotal).toFixed(5) * 100;
    $('#completion-rate').text('The completion rate is ' + completionRate + '%');
    gradedAvg = (gradedAvg/gradedCount).toFixed(5) * 100;
    $('#assignment-avg').text('Assignment average is ' + gradedAvg + '%');
    
    var avgLine = []; //Gets the average line for the scatter graph
    var avgLabels = []; //Gets student count
    var studentPlots = [];
    for (var count = 0; count < studentData.length; count++) {
        avgLine.push(gradedAvg);
        avgLabels.push(studentData[count].id);
        if ((studentData[count].grades != -1)) {
            studentPlots.push({x: count, y: (studentData[count].grades.toFixed(5)) * 100, r: 6}); //Plots the student points
        } else {
            studentPlots.push({x: count, y: 0}); //Plots the student points
        }
    }
    studentAvgChart.data.datasets[0].data = avgLine;
    studentAvgChart.data.labels = avgLabels;
    studentAvgChart.data.datasets[1].data = studentPlots;
    studentAvgChart.update();
    $('#student-avg-chart').show();
}

function calculateGraded(studentData, topicsList) {
    var graded = 0;
    var ungraded = 0;
    for (var count = 0; count < studentData.length; count = count + topicsList) {
        if (studentData[count].score == null) {
            ungraded++;
        } else {
            graded++;
        }
    }  
    gradedStudentsChart.data.datasets[0].data = [graded, ungraded];
    gradedStudentsChart.update();
    
    $('#graded-students').show();
}

function drawStudentPerformance() {
    var id = $('#studentList').val();
    var assignmentVal = $('#assignmentList').val();
    var assignmentsList = assignments;
    
    var assignmentPos = function() { //Gets position of assignment
        for (var count = 0; count < assignmentsList.length; count++) {
            if (assignmentsList[count].assignmentName === assignmentVal) {
                return count;
            }
        }
    };
    
    var studentList = assignmentsList[assignmentPos()].students;
    var studentObject = function() { //Gets the student Object
        for (var count = 0; count < studentList.length; count++) {
            if (studentList[count].id === id) {
                return studentList[count].scoring;
            }
        }
    };
    
    var score = [];
    for (var labelCount = 0; labelCount < studentObject().length; labelCount++) {
        if (studentObject()[labelCount].score == null) {
            score.push(0);
        } else {
            score.push(studentObject()[labelCount].score.toFixed(5) * 100);
        }
    }
    
    studentPerformanceChart.data.datasets[1].data = score;
    studentPerformanceChart.update();
}


//update the select drop down for the topic graph
function getTopics(topicsList){
    var topicArray = topicsList;
    
    //add the default topic select
    $('#topicList').append($('<option>',{
        value: 'Default',
        text : "Select a topic"}));
    
    //go through the topic array and update the select
    for(var count = 0; count < topicArray.length; count++){
        $('#topicList').append($('<option>', {
        value: topicArray[count],
        text : topicArray[count]
        }));
    }
}

//update the graph based on what topic was selected
function drawStudentChart(){ 
    var topicId = $('#topicList').val();
    console.log("topicId is ", topicId);
    var assignmentName = $('#assignmentList').val();
    console.log("assignmentVal is ", assignmentName);
    var assignmentsList = assignments
    console.log("assignmentsList is ", assignmentsList);
    var topicScore = [];
    
    var assignmentPos = function() { //Gets position of assignment
        for (var count = 0; count < assignmentsList.length; count++) {
            if (assignmentsList[count].assignmentName === assignmentName) {
                return count;
            }
        }
    };
    
    
    var studentList = assignmentsList[assignmentPos()].students;
    
    var studentObject = function() { //Gets the student Object
        for (var count = 0; count < studentList.length; count++) {
            if (studentList[count].id === topicId) {
                return studentList[count].scoring;
            }
        }
    };

};