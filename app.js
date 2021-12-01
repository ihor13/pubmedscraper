const puppeteer = require ('puppeteer');
const express = require("express");
const path = require('path');
var timeout = require('connect-timeout')
const bodyParser = require("body-parser");
const app = express();

app.listen(process.env.PORT || 3000, () => {
  //console.log("Application started and Listening on port 3000");
});

// server css as static
app.use(express.static(__dirname));

// get our app to use body parser 
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/', root);
// app.use('*', (req, res) => {
//   res.redirect('/');
// });

app.set('views', __dirname);
app.set('view engine', 'html');






app.get('/data.json', function (req, res) {
  var readStream = fs.createReadStream('./data.json');
  readStream.pipe(res);
})

app.get("/", timeout('5s'), (req, res) => {
res.sendFile(path.join(__dirname, '/index.html'));
});



app.post("/", (req, res) => {
  var subName = req.body.yourname;
  let n;
  puppeteer
  .launch ()
  .then (async browser => {
  
    //opening a new page and navigating to Reddit
    const page = await browser.newPage ();
    page.setDefaultNavigationTimeout(0);
    let siteUrl = 'https://pubmed.ncbi.nlm.nih.gov/';
    const author = subName;
    let a_array = author.split(" ");
    if(a_array.length == 1){
     await page.goto ('https://pubmed.ncbi.nlm.nih.gov/?term=icahn+'+a_array[0]+'&size=200');
    }
    if(a_array.length == 2){
     await page.goto ('https://pubmed.ncbi.nlm.nih.gov/?term=icahn+'+a_array[0]+'+'+a_array[1]+'&size=200');
    }
    if(a_array.length == 3){
     await page.goto ('https://pubmed.ncbi.nlm.nih.gov/?term=icahn+'+a_array[0]+'+'+a_array[1]+'+'+a_array[2]+'&size=200');
    }
    await page.waitForSelector ('body');
   // Gather assets page urls for all the blockchains
     const assetUrls = await page.$$eval(
       'a.docsum-title',
       assetLinks => assetLinks.map(link => link.href)
     );

     // const results = [];
     // console.log(assetUrls);
     //     //Visit each assets page one by one
     // for (let assetsUrl of assetUrls) {
     //   await page.goto(assetsUrl);
     //   await page.waitForSelector ('body');
     //     const Name = await page.$eval('h1.heading-title', h1 => h1.innerText.trim());
     //     const author = await page.$$eval('div.inline-authors span.authors-list-item ', img => img.map(el => el.innerText));
     //     const edu = await page.$$eval('a.affiliation-link', img => img.map(x =>x.title));
     //     // TODO: Gather all the needed info like description etc here.
         
     //     results.push([{
     //       name: Name,
     //       children:{name: author},
     //       children:{name: edu}
     //     }]);
     //   }

       //console.log(results);


     // var x = document.querySelectorAll("a");
     // var myarray = []
     // for (var i=0; i<x.length; i++){
     // var nametext = x[i].textContent;
     // var cleantext = nametext.replace(/\s+/g, ' ').trim();
     // var cleanlink = x[i].title;
     // myarray.push([cleantext,cleanlink]);
     // };
     // function make_table() {
     //     var table = '<table><thead><th>Name</th><th>Links</th></thead><tbody>';
     //    for (var i=0; i<myarray.length; i++) {
     //             table += '<tr><td>'+ myarray[i][0] + '</td><td>'+myarray[i][1]+'</td></tr>';
     //     };
      
     //     var w = window.open("");
     // w.document.write(table); 
     // }
     // make_table()

     //let grabPosts = [];
     n = assetUrls.length;
     let result = [];
       for (let assetsUrl of assetUrls) {
         await page.goto(assetsUrl);
         await page.waitForSelector ('body');
         let grabPosts = await page.evaluate ((author) => {
           let allPosts = document.body.querySelectorAll ('div.inline-authors span.authors-list-item ');
           //storing the post items in an array then selecting for retrieving content
           scrapeItems = [];
           // let arr = [];
           
           allPosts.forEach (item => {
             let name = item.querySelector ('.full-name').innerText;
             let arr = item.querySelectorAll('.affiliation-link');
           
             // arr.forEach(item2 => {
             //   aff.push({
             //   name: arr
             // });})
             let aff = [];
             if(name.trim() != author.trim()){
               for(let i = 0; i < arr.length; i++){
                 aff.push({
                   name: arr[i].getAttribute("title")
                 });
               }
             scrapeItems.push ({
               name: name,
               children: aff
               //children: [{name: arr}]
             });
           }
           });
           let auth = document.body.querySelector ('.heading-title').innerText;
           let items = {
             name: auth,
             children: scrapeItems
           }; 
           return items;
         },author)
         // console.log(grabPosts);
         result = result.concat(grabPosts);
         //console.log(result);
         
         
       }
       let results ={
         name: author,
         children:result
       }
       // if(res1){
       //   console.log(res1);
       // }
       //console.log(results);
       const fs = require('fs');
       fs.writeFile('data.json', JSON.stringify(results), err => err ? console.log(err): null);
       fs.writeFile('saveddata.json', JSON.stringify(results), err => err ? console.log(err): null);
       res.sendFile(path.join(__dirname, '/index.html'));
       

     // Results are ready
     // console.log(grabPosts);

   await browser.close();
   //setTimeout(() => {res.send("<h1>  Loading data... </h1>");}, 1000);
     //setTimeout(() => {res.redirect("/");}, 10000);

    //  setTimeout(() => {res.sendFile(path.join(__dirname, '/index.html'));
    //  const fs = require('fs');
    //  fs.truncate('data.json', 0, err => err ? console.log(err): null)}, 10000);
    fs.truncate('data.json', 0, err => err ? console.log(err): null)
   //res.redirect('https://pubmed.netlify.app//index.html');
})
//handling any errors
.catch (function (err) {
 console.error (err);
});

//setTimeout(() => {res.sendFile(path.join(__dirname, '/index.html'));}, 1000);

// setTimeout(() => {res.redirect('/');}, 70000);

// setTimeout(() => {res.redirect('/');}, 5000);




});













