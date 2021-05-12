// Xiaofeng Zhang
// Assignment3-gallery.js
const HTTP_PORT = process.env.PORT || 3000;
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");


const session = require("client-sessions");
const randomStr = require("randomstring");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, "/views"),
  })
);

app.set("view engine", "hbs");

app.use(express.static(path.join(__dirname, "/public")));

var strRandom = randomStr.generate();

var fs = require("fs");
var users = {};
fs.readFile("./user.json", "utf-8", (err, userJsonData) => {
  users = JSON.parse(userJsonData);
});

app.use(
  session({
    cookieName: "MySession",
    secret: strRandom,
    duration: 5 * 60 * 1000,
    activeDuration: 1 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true,
  })
);


let data = { author: "Xiaofeng Zhang"};

const purchase = require("./purchase.js");
app.use("/purchase", purchase);


app.get("/", (req, res) => {

  const {MongoClient} = require ('mongodb');
  async function main(){
    let data = { author: "Xiaofeng Zhang", title: [], status:[]};
    const url = "mongodb+srv://xzhang346:Alex%40sk2@cluster0.f3tlg.mongodb.net/mongodatabase?retryWrites=true&w=majority";
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect();
        await updataAll(client);
        let lists = await findAll(client);
        for(list of lists){
        
          data.status.push(list.status);
        }
        let r = data.status.reduce(function(arr, item, index){
          if(item === "A"){
              arr.push(index);
          }
          return arr
      }, []);   
      for(i of r){
          data.title.push(lists[i].fileName.slice(0, -4));
      }
      
      
    } catch(e){
        console.error(e);
    } finally{
        await client.close();
    } 
  }
  var placeholderValues = {
    username: "",
    userpassword: "",
  };
  res.render("login", {
    data: data,
    form: placeholderValues,
  });
  main().catch(console.error);


});


app.post("/", (req, res) => {
  let data = { author: "Xiaofeng Zhang", title: [], status:[]};
  const {MongoClient} = require ('mongodb');
  async function main(){
    const url = "mongodb+srv://xzhang346:Alex%40sk2@cluster0.f3tlg.mongodb.net/mongodatabase?retryWrites=true&w=majority";
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect();
        await updataAll(client);
        let lists = await findAll(client);
        for(list of lists){
        
          data.status.push(list.status);
        }
        let r = data.status.reduce(function(arr, item, index){
          if(item === "A"){
              arr.push(index);
          }
          return arr
      }, []);   
      for(i of r){
          data.title.push(lists[i].fileName.slice(0, -4));
      } 
    } catch(e){
        console.error(e);
    } finally{
        await client.close();
    } 
    var placeholderValues = {
      username: req.body.textUserName,
      userpassword: req.body.textPassword,
    };
    var temp = 0;
    for (user in users) {
      if(placeholderValues.username === user){
        temp = 1; 
        break; 
      }else{
          temp = 0;
      }
    }
    if(temp === 1){
      if(placeholderValues.userpassword === users[placeholderValues.username]){
        req.MySession.user ={
          username: placeholderValues.username,
          userpassword: placeholderValues.userpassword,
        }; 
        var selection = "Gallery";
        return res.render("index", {
          data: data,
          selection: selection,
          username: req.MySession.user.username,
          })
      }else{
        var errorMsg = "Invalid password";
        return res.render("login", {
          data: data,
          username:placeholderValues.username,
          password:placeholderValues.userpassword,
          errorMsg: errorMsg,
        });
      }
    
    }else{
      var errorMsg = "Not a registered username.";
      return res.render("login", {
        data: data,
        username:placeholderValues.username,
        password:placeholderValues.userpassword,
        errorMsg: errorMsg,
      })
    }   
  }
  main().catch(console.error);
  
});

function checkLogin(req, res, next) {
  if (!req.MySession.user) {
    res.redirect("/");
  } else {
    next();
  }
}

app.post("/gallery", checkLogin, (req, res) => {
  let data = { author: "Xiaofeng Zhang", title: [], status:[]};
  const {MongoClient} = require ('mongodb');
  async function main(){
    const url = "mongodb+srv://xzhang346:Alex%40sk2@cluster0.f3tlg.mongodb.net/mongodatabase?retryWrites=true&w=majority";
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect();
        let lists = await findAll(client);
        for(list of lists){
        
          data.status.push(list.status);
        }
        let r = data.status.reduce(function(arr, item, index){
          if(item === "A"){
              arr.push(index);
          }
          return arr
      }, []);   
      for(i of r){
          data.title.push(lists[i].fileName.slice(0, -4));
      }                        
    
    } catch(e){
        console.error(e);
    } finally{
        await client.close();
    } 
    if(req.body.imageTitle){
      var selection = req.body.imageTitle;
      var click = true;
      res.render("index", {
        data: data,
        selection: selection,
        click:click,
        username: req.MySession.user.username,
      });
    }else{
      var selection = "Gallery";
      var click = false;
      res.render("index", {
        data: data,
        click:click,
        selection: selection,
        username: req.MySession.user.username,
      });
    }
  }
  main().catch(console.error);


});

app.get("/gallery", checkLogin, (req, res) => {
  let data = { author: "Xiaofeng Zhang", title: [], status:[]};
  const {MongoClient} = require ('mongodb');
  async function main(){
    const url = "mongodb+srv://xzhang346:Alex%40sk2@cluster0.f3tlg.mongodb.net/mongodatabase?retryWrites=true&w=majority";
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect();
        let lists = await findAll(client);
        for(list of lists){
        
          data.status.push(list.status);
        }
        let r = data.status.reduce(function(arr, item, index){
          if(item === "A"){
              arr.push(index);
          }
          return arr
      }, []);   
      for(i of r){
          data.title.push(lists[i].fileName.slice(0, -4));
      }                        
    
    } catch(e){
        console.error(e);
    } finally{
        await client.close();
    } 
    var selection = "Gallery";
    res.render("index", {
      data: data,
      selection: selection,
      username: req.MySession.user.username,
    });
  }

  main().catch(console.error);
 
});



app.get("/logout", (req, res) => {
  const {MongoClient} = require ('mongodb');
  async function main(){
    const url = "mongodb+srv://xzhang346:Alex%40sk2@cluster0.f3tlg.mongodb.net/mongodatabase?retryWrites=true&w=majority";
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect();
        await updataAll(client);
    } catch(e){
        console.error(e);
    } finally{
        await client.close();
    }   
  }
  main().catch(console.error);

  req.MySession.reset();
  res.redirect("/");
});

app.get("/register", (req, res)=>{
  res.render("register", {
    data: data,
  })
})

app.post("/register", (req, res) => {
  var placeholderValues = {
    username: req.body.textUserName,
    userpassword: req.body.textPassword,
    conformpassword:req.body.textConfirmPassword,
  };
  var temp = 0;

  for(user in users){
    
    if(placeholderValues.username === user){
      temp = 1;
      break;     
    }else{
      temp = 0;
    }
  }
  if(temp === 1){
    var errorMsg = "Duplicate username";
    return res.render("register", {
      data: data,
      username:placeholderValues.username,
      password:placeholderValues.userpassword,
      confirmpassword: placeholderValues.conformpassword,
      errorMsg: errorMsg,
    });
  }else{
    if(placeholderValues.userpassword.length < 8){
      var errorMsg = "Password must be at least eight characters";
      return res.render("register", {
        data: data,
        username:placeholderValues.username,
        password:placeholderValues.userpassword,
        confirmpassword: placeholderValues.conformpassword,
        errorMsg: errorMsg,
      });

    }else if(placeholderValues.userpassword !== placeholderValues.conformpassword){
      var errorMsg = "Passwords do not match";
      return res.render("register", {
        data: data,
        username:placeholderValues.username,
        password:placeholderValues.userpassword,
        confirmpassword: placeholderValues.conformpassword,
        errorMsg: errorMsg,
      }); 
    }
    else{
      users[placeholderValues.username] = placeholderValues.userpassword;
      fs.writeFile("user.json", JSON.stringify(users, null, 4), function(err) {
        if (err) throw err;    
    });

      var errorMsg = "Successfully registered";
      return res.render("login", {
        data: data,
        errorMsg: errorMsg,
      });
        
    }
  }

})

async function updataAll(client){
  result = await client.db("mongodatabase").collection("GalleryCollection").updateMany({status:{$exists:"B"}}, {$set: {status:"A"}});
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function findAll(client){
  let photos = [];
  result = await client.db("mongodatabase").collection("GalleryCollection").find().toArray();
  if(result){
      result.forEach(element => photos.push(element));
      return photos;
  }else{
      console.log("No photos found");
  }
}

const server = app.listen(HTTP_PORT, () => {
  console.log(`Listening on port ${HTTP_PORT}`);
});


