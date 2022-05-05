const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.get('/', async (req, res) => {

  var q = req.query.q;

  const QY_SLCT_ITEM = 'div.rllt__details';
  const QY_SLCT_NAME = 'div.SPZz6b>h2>span';
  const QY_SLCT_ADRESS = 'div.zloOqf.PZPZlf';
  const QY_SLCT_PHONE = 'span.LrzXr.zdqRlf.kno-fv';
  const QY_SLCT_NEXT = '#pnnext > span:nth-child(2)';

  function CleanElements() {
    document.querySelector('div#lu_pinned_rhs').innerHTML = '';
    for (let index = 0; index < 7; index++) {
      document.querySelectorAll('.rllt__details>div:nth-child('+index+')').forEach(element => {
        element.textContent = ''
      });
    }
  }

  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  await page.on('request', (req) => {
    if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {req.abort()} else {req.continue()}
  });

  await page.goto('https://www.google.com/search?rlst=f&q='+q, {waitUntil: 'networkidle2'});

  await page.addScriptTag({ content: `${CleanElements}`});
  await page.evaluate(()=>{CleanElements()})

  var elements = {}
  var data = []
  var item = 0

  while(true) {
    elements = elements = {} ? await page.$$(QY_SLCT_ITEM) : elements;
    try {await elements[item].click()} catch (e) {break}
    await page.waitForTimeout(1050);

    try {var name = await page.$eval(QY_SLCT_NAME, (el) => el.textContent)} catch (e) {var name = ''}
    try {var address = await page.$eval(QY_SLCT_ADRESS, (el) => el.textContent)} catch (e) {var addres = ''}
    try {var phone = await page.$eval(QY_SLCT_PHONE, (el) => el.textContent)} catch (e) {var addres = ''}

    await data.push({
      'name':name,
      'addres':address,
      'phone':phone.replace(/[^\d]/g, '')
    });

    [name, address, phone] = ['','',''];

    if (item < 20) {
      item++
    }

    if (item == 20) {
      try {await page.click(QY_SLCT_NEXT)} catch (e) {break};
      await page.waitForTimeout(2000);
      await page.evaluate(()=>{CleanElements()})
      item = 0;
    }

  }

  res.send(data);
  await browser.close();
});

const port = 3000;
app.listen(port, () => {
  console.log(`
    Servidor iniciado em: http://localhost:${port}
  `)
});