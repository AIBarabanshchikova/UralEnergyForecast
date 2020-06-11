const express = require('express');
const fallback = require('express-history-api-fallback')
const fs = require('fs');
const { uploadDataToDB, selectT_GROUP, selectT_GROUPWithId, selectT_GROUP_DATA, selectT_TIME_SERIE, selectT_Forecast, runProcedureParamTest, runProcedurePredict } = require('./dbConnection');
const app = express();


app.use(express.text());

const root = __dirname + '/../build';

app.use(express.static(root));
app.use(fallback('index.html', { root: root }))

app.post('/uploadFile', async function (req, res) {
    fs.writeFile('C://DiplomData/test.csv', req.body, function(err, data) {
        if (err) throw err;
        console.log('Saved!');
    });
    uploadDataToDB();
    const dataFromDB = await selectT_GROUP();
    res.json({ data: dataFromDB });
});

app.get('/loadGroupData', async function (req, res) {
    const dataFromDB = await selectT_GROUP_DATA(req.query.id);
    res.json({ data: dataFromDB });
});

app.get('/group/:id', async function(req, res) {
    const dataFromDB = await selectT_GROUPWithId(req.params.id);
    res.json({ data: dataFromDB });
});

app.get('/trainModel', async function (req, res) {
    const result = await runProcedureParamTest(req.query.id);
    if (result) {
        const dataFromDB = await selectT_TIME_SERIE(req.query.id);
        res.json({ data: dataFromDB });
    }
});

app.get('/loadForecast', async function (req, res) {
    const dataFromDB = await selectT_Forecast(req.query.id);
    res.json({ data: dataFromDB });
});

app.get('/forecast', async function (req, res) {
    const result = await runProcedurePredict(req.query.id, req.query.yearInit, req.query.monthInit, req.query.monthsToForecast);
    if (result) {
        const dataFromDB = await selectT_Forecast(req.query.id);
        res.json({ data: dataFromDB });
    }
});

app.listen(3003, function () {
    console.log('Программный комплекс для прогнозирования объёмов потребления электроэнергии ООО "Уралэнергосбыт" запущен по адресу http://localhost:3003');
});
