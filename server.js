let fs = require('fs');

let express = require("express");
let app = express();


let cors = require('cors');
app.use(cors(
    {
        origin: /p5js\.org$/,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, letious SmartTVs) choke on 204
    }
));

let Datastore = require("nedb");

let db = new Datastore("course.db");
let db2 = new Datastore("poll.db");
let db3 = new Datastore("video.db");

let courseList = ["Algorithms", "Data Structures", "Calculus", "Markets", "Connections Lab", "Linear Algebra", "Intro to CS", "Math-1000", "Intro to Logic", "Discrete Math", "FYWS", "Mutivariable Calculus", "Data and Society", "Data Analysis", "Computer Networks", "Operating Systems", "Computer System Organization"];
let courses = [["Computer Science","Algorithms", "Data Structures"],["Economics","Markets"]];


db.loadDatabase();
db2.loadDatabase();
db3.loadDatabase();

app.use('/', express.static('public'));


let http = require("http");


let options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};


let server = http.createServer(options, app);

server.listen(4000, () => {
    console.log('listening');
});


let io = require("socket.io");
io = new io.Server(server);


app.get('/courses', (req, res) => {
    res.json({ courseArray: courseList });
});

app.get('/comments', (req, res) => {

    let c = req.query.selectedCourse;
    db.find({ courseName: c }).sort({ updateAt: 1 }).exec(function (err, docs) {
        if (err) {
            res.json({ task: "task failed" })
        }
        else {
            let obj = { comments: docs };
            res.json(obj);
        }
    });
});

/*

app.post('/videoPost', (req, res) => {
    console.log(req);
    console.log(req.body);
    db3.insert(polldata, (err, ) => {
        if (err) {
            console.log(err.message);
        }
        //console.log(newDoc);
    });

    res.send({ task: "success" });
})



app.get('/video', (req, res) => {
    let c = req.query.selectedCourse;

    let videoObject = {
        "course": req.query.selectedCourse,
        "online": 2
    }

    db3.insert(videoObject, (err, newDoc) => {
        //console.log(newDoc);
        console.log(err);
    });
    
    db3.find({ courseName: c }, function (err, docs) {
        if (err) {
            res.json({ task: "task failed" })
        }
        else {
            console.log(docs);
            let obj = { videoDetails: docs };
            res.json(obj);
        }
    });
    //res.json({ task: "task failed" })
});

*/

app.get('/polls', (req, res) => {

    let c = req.query.selectedCourse;
    db2.find({ courseName: c }).sort({ updateAt: 1 }).exec(function (err, docs) {
        if (err) {
            res.json({ task: "task failed" })
        }
        else {
            let obj = { poll: docs };
            res.json(obj);
           // console.log(obj)
        }
    });
});

io.sockets.on('connection', function (socket) {
    console.log("We have an incomplete project: " + socket.id);

    socket.on('data', (data) => {     // Listening for comment data values

        //console.log(data);
        db.insert(data, (err, newDoc) => {
            //console.log(newDoc);
            console.log(err);
        });

        io.sockets.emit('sdata', data);
    })


    socket.on('poll', (polldata) => { // Listening for poll values

       // console.log(polldata);
        db2.insert(polldata, (err, newDoc) => {
            if (err) {
                console.log(err.message);
            }
            //console.log(newDoc);
        });

        io.sockets.emit('polldata', polldata);
    })

    //Listen for this client to disconnect
    socket.on('disconnect', function () {
        console.log("A client has disconnected: " + socket.id);
    });

});

