const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const prom = require('prom-client');
const packageInfo = require('./package.json');

const collectDefaultMetrics = prom.collectDefaultMetrics;
PORT = process.env.PORT || 8080
// collectDefaultMetrics({  }); // ********************************** Uncomment this line for some default metrics. That aren't distracting
prom.register.setDefaultLabels({'application': packageInfo['name']})
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const apiRequests = new prom.Counter({
  name: 'api_requests_total',
  help: 'Just a counter for api_requests',
  labelNames: ['endpoint','code']
})

const dataSourceConnection = new prom.Gauge({
  name: 'datasource_connections',
  help: 'Number of connections to a datasource. What\'s the dataSource you wonder? Take your pick.'
})

app.get('/metrics', async (req, res) => {

  res.setHeader('Content-Type', prom.register.contentType);
  res.send(await prom.register.metrics());
});


app.listen(PORT, () => {
  console.log("Testing app listening on port " + PORT)
  console.log("Please see http://localhost:" + PORT +"/metrics")
})

setInterval(function () {
  const ran = Math.random()
  if (ran <= .2) {
    apiRequests.labels("/login","401").inc() // No need to create a
  } else {
    apiRequests.labels("/login","200").inc()
  }

  dataSourceConnection.set(getRandomInt(5,10))
}, 300);

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
