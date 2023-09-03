const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _ = require("lodash");
 
const app = express();
 
main().catch(err => console.log(err))
 
async function main(){
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
//mongoose.connect("mongodb+srv://mongoze:<12345678!>@cluster0.sylq9uo.mongodb.net/?retryWrites=true&w=majority")
mongoose.connect("mongodb+srv://mongozed:123456789abc@cluster0.sylq9uo.mongodb.net/todolistDB", {useNewUrlParser: true});
//mongodb+srv://<username>:<password>@cluster0.sylq9uo.mongodb.net/?retryWrites=true&w=majority

const itemsSchema = ({
  name: String
})
 
const Item = mongoose.model('Item',itemsSchema)
 
const item1 = new Item({
  name: "Welcome to your todolist!"
})
 
const item2 = new Item({
  name: "Hit the + button to add a new item"
})
 
const item3 = new Item({
  name: "<--Hit this to delete an item."
})
 
const defaultItems = [item1,item2,item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List =mongoose.model("List", listSchema);
 
app.get("/", async function(req, res) {
 
  var foundItems = await Item.find()
 
  if(foundItems.length === 0){
  Item.insertMany(defaultItems)
  .then(function () {
    console.log("Successfully saved default items to DB")
  })
  .catch(function (err) {
    console.log(err)
  })
  res.redirect("/")
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
 
 
});

app.get("/:customListName", async function(req, res){
  const customListName = _.capitalize(req.params.customListName)
  const foundList = await List.findOne({name: customListName})
  if (!foundList) {
    const list = new List({name: customListName, items: defaultItems})
    list.save()
    res.redirect("/"+customListName)
  }else{
    //foundlist = await List.findOne({name: customListName})
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
  }
})

app.post("/", async function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item(
    {name: itemName}
  )

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {listfound = await List.findOne({name: listName})
    listfound.items.push(item)
    listfound.save();
    res.redirect("/"+listName);
  }
});

app.post("/delete", async function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    await Item.findByIdAndRemove(checkedItemId)
    res.redirect("/")
  }else{
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    res.redirect("/"+ listName)
  }

})


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});
 
app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
 
}
