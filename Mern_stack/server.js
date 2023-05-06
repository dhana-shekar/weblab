var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var db = require("./config.js");
var ejs = require("ejs");

var app = express();
app.set("view engine", "ejs");
var port = process.env.port || 8888;
var srcpath = path.join(__dirname, "/public");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connectivity
var Schema = mongoose.Schema;
var stuSchema = new Schema(
  {
    stuid: { type: String, unique: true, dropDups: true },
    stuname: { type: String },
  },
  { versionKey: false }
);
var model = mongoose.model("student", stuSchema, "student");

app.get("/home", function (req, res) {
  console.log("Got a GET request for the homepage");
  res.send("<h1>Welcome to RIT</h1>");
});

app.get("/about", function (req, res) {
  console.log("Got a GET request for /about");
  res.send("Dept. of Computer Science & Engineering");
});

//api for INSERT data from database
app.post("/api/savedata", function (req, res) {
  var mod = new model(req.body);
  req.body.serverMessage = "NodeJS replying to REACT";
  mod.save().then(function (result) {
    console.log("student Inserted");
    /*Sending the respone back to the angular Client */
    res.json({
      msg: "We received your data!!!(nodejs)",
      status: "success",
      mydata: req.body,
    });
  });
});

// get data from database DISPLAY
app.get("/display", function (req, res) {
  //------------- USING EMBEDDED JS -----------
  model
    .find()
    .sort({ stuid: 1 })
    .exec()
    .then(function (i) {
      res.render("disp.ejs", { students: i });
    });
  //---------------------// sort({stuid:-1}) for descending order -----------//
});

app.get("/delete.html", function (req, res) {
  res.sendFile(__dirname + "/" + "delete.html");
});

//api for Delete data from database
app.get("/delete", function (req, res) {
  //var stuidnum=parseInt(req.query.stuid)  // if stuid is an integer
  var stuidnum = req.query.stuid;

  model.deleteMany({ stuid: stuidnum }).then(function (obj) {
    if (obj.deletedCount >= 1) {
      res.send("<br/>" + stuidnum + ":" + "<b>student Deleted</b>");
      console.log("student Deleted");
    } else res.send("student Not Found");
  });
});

//Update data from database
app.get("/update.html", function (req, res) {
  res.sendFile(__dirname + "/" + "update.html");
});

app.get("/update", function (req, res) {
  var stuname1 = req.query.stuname;
  model
    .findOneAndUpdate(
      { stuname: stuname1 },
      { stuname: "newstu" },
      { multi: true }
    )
    .then(function (obj) {
      console.log(obj);
      if (obj == null) {
        res.send("student Not Found");
      } else {
        res.send("<br/>" + stuname1 + ":" + "<b>student Name Updated</b>");
        console.log("student Updated");
      }
    });
});

//--------------SEARCH------------------------------------------
app.get("/search.html", function (req, res) {
  res.sendFile(__dirname + "/" + "search.html");
});

app.get("/search", function (req, res) {
  //var stuidnum=parseInt(req.query.stuid)  // if stuid is an integer
  var stuidnum = req.query.stuid;
  model
    .find({ stuid: stuidnum }, { stuname: 1, stuid: 1, _id: 0 })
    .exec()
    .then(function (docs) {
      if (docs == "") {
        res.send("<br/>" + stuidnum + ":" + "<b>student Not Found</b>");
      } else {
        res.status(200).json(docs);
      }
    });
});

// call by default index.html page
app.get("*", function (req, res) {
  res.sendFile(srcpath + "/index.html");
});
//server stat on given port
app.listen(port, function () {
  console.log("server start on port:" + port);
});