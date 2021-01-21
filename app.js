// Steps to run XAMPP on macOS
// (1) Install XAMPP
// (2) Open XAMPP.app and make sure to run MySQL Database, ProFTPD, and Apache Web Server
// (3) Run the following command in the terminal to start MariaDB: /Applications/XAMPP/bin/mysql -uroot
// NOTE: Path for mysql may vary

const express = require("express");
const mysql = require("mysql");
const exphbs = require("express-handlebars");

// Create connection
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "musicLibrary",
});

// Connect
db.connect((err) => {
  if (err) throw err;
  console.log("MariaDB connected...");
});

const app = express();

// Setting up static image repo so it can be used by handlebars template
app.use(express.static("assets/images"));

// Parse data sent by HTML forms
app.use(express.urlencoded({ extended: false }));

// Grabs data sent by HTML Forms in JSON format
app.use(express.json());

// Setting up handlebars as view engine
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// Test route
app.get("/test", (req, res) => {
  res.send("Server is working!");
});

// Homepage route
app.get("/", (req, res) => {
  res.render("index");
});

// Log-In page route
app.get("/login", (req, res) => {
  res.render("login");
});

// Authentication
app.post("/auth/login", (req, res) => {
  let sql = `SELECT email, password FROM User WHERE email = '${req.body["email"]}' AND password = '${req.body["password"]}'`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    // FEATURE: add error handling case here in case of wrong id or password
    if (
      result[0]["email"] == req.body["email"] &&
      result[0]["password"] == req.body["password"]
    ) {
      console.log("User is authenticated...");
      let sql_playlists = `SELECT * FROM Playlist p, User u, User_playlist up WHERE u.email = up.email AND p.playlist_id = up.playlist_id AND u.email='${req.body["email"]}'`;
      db.query(sql_playlists, (err1, result1) => {
        if (err1) throw err1;
        console.log("User playlists fetched...");
        console.log("For parsing...");
        json_len = Object.keys(result1).length;
        let parsed_json = {};
        for (i = 0; i < json_len; i++) {
          parsed_json[i] = {
            pid: result1[i]["playlist_id"],
            pname: result1[i]["pname"],
            tags: result1[i]["tags"],
            no_of_playlist: result1[i]["no_of_playlist"],
          };
        }
        res.render("playlists", {
          name: result1[0]["name"],
          playlist: parsed_json,
        });
      });
      //   res.render("playlists", sql_playlists);
    } else {
      res.send("User is not authenticated");
    }
  });
});

app.get("/auth/:pid", (req, res) => {
  //   res.send("Works for id no. " + req.params.pid);
  //   console.log("Works for id no. " + req.params.pid);
  let sql = `SELECT * FROM Playlist p, Song s, Playlist_songs ps WHERE p.playlist_id = ps.playlist_id AND s.song_id = ps.song_id AND p.playlist_id = ${req.params.pid}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Fetching songs...");
    json_len = Object.keys(result).length;
    let parsed_json = {};
    for (i = 0; i < json_len; i++) {
      parsed_json[i] = {
        playlist_id: result[i]["playlist_id"],
        tags: result[i]["tags"],
        song_id: result[i]["song_id"],
        title: result[i]["title"],
        duration_minutes: result[i]["duration_minutes"],
        genre: result[i]["genre"],
        album_id: result[i]["album_id"],
        artist_id: result[i]["artist_id"],
      };
    }
    res.render("songs", {
      pname: result[0]["pname"],
      songs: parsed_json,
    });
  });
});

app.get("/auth/album/:aid", (req, res) => {
  //   res.send("Working for album ID " + String(req.params.aid));
  let sql = `SELECT * FROM Album WHERE album_id = ${req.params.aid}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.render("albums", {
      album_id: result[0]["album_id"],
      release_date: result[0]["release_date"],
      title: result[0]["title"],
      genre: result[0]["genre"],
      no_of_songs: result[0]["no_of_songs"],
      artist_id: result[0]["artist_id"],
    });
  });
});

app.get("/auth/artist/:art_id", (req, res) => {
  //   res.send("Working for album ID " + String(req.params.aid));
  let sql = `SELECT * FROM Artist WHERE artist_id = ${req.params.art_id}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.render("artists", {
      artist_id: result[0]["artist_id"],
      artist_name: result[0]["artist_name"],
      style: result[0]["style"],
      country: result[0]["country"],
    });
  });
});

app.listen("3000", () => {
  console.log("Server started on port 3000.");
});
