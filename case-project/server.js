var express = require('express');
const bodyParser = require("body-parser");
var app = express();
const { Client } = require('@elastic/elasticsearch')
const config = require('config');
const elasticConfig = config.get('elastic');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname));
//app.use(bodyParser.json());

const client = new Client({
  cloud: {
    id: elasticConfig.cloudID
  },
  auth: {
    username: elasticConfig.username,
    password: elasticConfig.password
  }
})


app.get('/', (req, res) => {
    res.render('index.html')
})

app.post("/add", async (req, res) => {
    const result = await client.index(
        {
          index: "cases",
          body: {
                name: req.body.name,
                case_number: req.body.case_number,
                severity: req.body.severity,
                topic: req.body.topic,
                desc: req.body.desc,
                status: "active"
                },
      })
      console.log(result)
      res.render("contact.html")
  })

app.post("/take/:id", async (req, res) => {
    console.log("updating case")
    const result = await client.updateByQuery({
      index: "cases",
      refresh: true,
      script: {
        lang: 'painless',
        source: 'ctx._source["status"] = "inactive"'
      },
        query: {
          match: {
            case_number: req.params.id
          }
        }
  
    });
    console.log(res)
    res.redirect('back');
  });

  
app.get("/cases", async (req, res) => {
    const result = await client.search({
      index: "cases",
      query: {
        match_all: {}
        }
    })
    res.render("product.html", {result:result.hits.hits.map(function(hit){ return hit._source })});
    //console.log()
  })

app.listen(5100,function(){
    console.log('server running on port 5100');
})
