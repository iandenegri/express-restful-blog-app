const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

// App Set Up
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer());
// End App Set Up

// Database Set Up
const mongoDB = "mongodb://localhost:27017/restful_blog_app";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on("connected", () => {console.log("Connected to MongoDB")});
db.on("error", console.error.bind(console, "MongoDB connection error:"));
// End Database Set Up

// Model Configuration
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});

const Blog = mongoose.model("Blog", blogSchema);
// End Model Configuration

// Restful Routing

// Landing Page
app.get('/', function(req, res){
    res.redirect('/blogs');
});

// Index/List Route
app.get('/blogs', function(req, res){
    Blog.find({}, function(err, result){
        if (err){
            console.log('Error:');
            console.log(err);
        } else {
            res.render('index', {blogs: result});
        }
    });
});

// New (GET Creation Form) Route
app.get('/blogs/new', function(req, res){
    res.render('new');
});

// Create (POST Creation Data) Route
app.post('/blogs', function(req, res){
    // Create blog object
    // Sanitize the body of the post to remove potentially malicious HTML.
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, function(err, result){
        if (err){
            console.log('Error:');
            console.log(err);
            res.render('new');
        } else {
            // Redirect to the index
            res.redirect('/blogs');
        }
    });
});

// Show/Detail Route
app.get('/blogs/:id', function(req, res){
    Blog.findById(req.params.id, function(err, result){
        if (err){
            console.log('Error:');
            console.log(err);
            res.redirect('/blogs');
        } else {
            console.log(result);
            res.render('show', {blog: result})
        }
    });
});

// Edit/Modify Route
app.get('/blogs/:id/edit', function(req, res){
    Blog.findById(req.params.id, function(err, result){
        if (err){
            console.log('Error:');
            console.log(err);
            res.redirect('/blogs');
        } else {
            console.log(result);
            res.render('edit', {blog: result});
        }
    });
});

// Update Route
app.put('/blogs/:id', function(req, res){
    // Sanitize the body of the post to remove potentially malicious HTML.
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, results){
        if (err){
            console.log(err);
            res.redirect('blogs');
        } else {
            res.redirect('/blogs/' + req.params.id);
        }
    })
});

// Destroy/Delete Route
app.delete('/blogs/:id', function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if (err){
            console.log(err);
            res.redirect('/blogs');
        } else {
            console.log('Blog post successfully deleted.');
            res.redirect('/blogs');
        }
    });
});

// End Routing

app.listen(3000, function(){
    console.log("Restful Blog App is live on localhost:3000!");
});
