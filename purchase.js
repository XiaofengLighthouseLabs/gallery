
// Xiaofeng Zhang
// Assignment3-gallery.js
const express = require("express");
const router = express.Router();

let data = { author: "Xiaofeng Zhang"};

function checkLogin(req, res, next) {
    if (!req.MySession.user) {
      res.redirect("/");
    } else {
      next();
    }
  }


router.post("/", checkLogin, (req, res) =>{
    var selection = req.body;
    selection = Object.keys(selection)[0];
   
    const {MongoClient} = require ('mongodb');
    async function main(){
        const url = "mongodb+srv://xzhang346:Alex%40sk2@cluster0.f3tlg.mongodb.net/mongodatabase?retryWrites=true&w=majority";
        const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        try{
            await client.connect();
            await findOne(client, selection.concat(".jpg"));    
                           
        } catch(e){
            console.error(e);
        } finally{
            await client.close();
        }
        res.render("photoPurchase",{
            selection:selection,
            data:data
        });                               
    }
    main().catch(console.error);             
  });

  router.get("/", checkLogin, (req, res) =>{
       
        res.render("photoPurchase",{
            selection:data.fileName.slice(0, -4),
            data:data
        });                               
            
  });
 
router.post("/backFromPurchase", checkLogin, (req, res) => {
    var buttonName = req.body;
    buttonName = buttonName[Object.keys(buttonName)[0]]; 
    if(buttonName.substring(0,6) === "CANCEL"){
        var selection = buttonName.substring(6);
        let sharedData = { author: "Xiaofeng Zhang", title: [], status:[]};
        const {MongoClient} = require ('mongodb');
        async function main(){
            const url = "mongodb+srv://xzhang346:Alex%40sk2@cluster0.f3tlg.mongodb.net/mongodatabase?retryWrites=true&w=majority";
            const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
            try{
                await client.connect();
                let lists = await findAll(client);
                for(list of lists){
                  sharedData.status.push(list.status);
                }
                let r = sharedData.status.reduce(function(arr, item, index){
                    if(item === "A"){
                        arr.push(index);
                    }
                    return arr
                }, []);   
                for(i of r){
                    sharedData.title.push(lists[i].fileName.slice(0, -4));
                }                        
            } catch(e){
                console.error(e);
            } finally{
                await client.close();
            } 
            var click = true;
            res.render("index",{
                data:sharedData,
                selection:selection,
                click:click,
                username: req.MySession.user.username
            })  
          }
          main().catch(console.error);
      
    }else{
        var selection = buttonName.substring(3);
        
        let sharedData = { author: "Xiaofeng Zhang", title: [],  description:[], price:[], status:[]};
        const {MongoClient} = require ('mongodb');
        async function main(){
            const url = "mongodb+srv://xzhang346:Alex%40sk2@cluster0.f3tlg.mongodb.net/mongodatabase?retryWrites=true&w=majority";
            const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
            try{
                await client.connect();
                await updateOne(client, selection.concat(".jpg"), {status:"B"});

                let lists = await findAll(client);
                for(list of lists){
                sharedData.status.push(list.status);
                }
                let r = sharedData.status.reduce(function(arr, item, index){
                    if(item === "A"){
                        arr.push(index);
                    }
                    return arr
                }, []);   
                for(i of r){
                    sharedData.title.push(lists[i].fileName.slice(0, -4));
                }                        
                            
            } catch(e){
                console.error(e);
            } finally{
                await client.close();
            }
            var click = false;
            res.render("index",{
                click:click,
                data:sharedData,
                selection:"Gallery",
                username: req.MySession.user.username
            })  
            
        }
        main().catch(console.error);  
    }
})

router.get("/backFromPurchase", checkLogin, (req, res) => {
    let sharedData = { author: "Xiaofeng Zhang", title: [],  description:[], price:[], status:[]};
    const {MongoClient} = require ('mongodb');
    async function main(){
        const url = "mongodb+srv://xzhang346:Alex%40sk2@cluster0.f3tlg.mongodb.net/mongodatabase?retryWrites=true&w=majority";
        const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        try{
            await client.connect();
            let lists = await findAll(client);
            for(list of lists){
            sharedData.status.push(list.status);
            }
            let r = sharedData.status.reduce(function(arr, item, index){
                if(item === "A"){
                    arr.push(index);
                }
                return arr
            }, []);   
            for(i of r){
                sharedData.title.push(lists[i].fileName.slice(0, -4));
            }                        
                        
        } catch(e){
            console.error(e);
        } finally{
            await client.close();
        } 
        
        if(sharedData.title.includes(data.fileName.slice(0, -4))){
            var click = true;
            var selection = data.fileName.slice(0, -4);
        }else{
            var click = false;
            var selection = "Gallery";
        }

        res.render("index",{
            click:click,
            data:sharedData,
            selection:selection,
            username: req.MySession.user.username
        })  
    }
    
    main().catch(console.error); 
 
})

  async function findOne(client, name){
    result = await client.db("mongodatabase").collection("GalleryCollection")
    .findOne({ fileName: name });
    if(result){
        data.fileName = result.fileName;
        data.description = result.description;
        data.price = result.price;
        data.status = result.status;
        
    }else{
        console.log(`No listings found with the name '${name}'`);
    }
  }

  async function updateOne(client, selection, updatedListing){
      result = await client.db("mongodatabase").collection("GalleryCollection").updateOne({fileName:selection}, {$set:updatedListing});
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

module.exports = router;
