const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///Drewry 集装箱指数

async function drewryWciIndex(symbol = 'composite') {
    const symbolMap = {
        "composite": 0,
        "shanghai-rotterdam": 1,
        "rotterdam-shanghai": 2,
        "shanghai-los angeles": 3,
        "los angeles-shanghai": 4,
        "shanghai-genoa": 5,
        "new york-rotterdam": 6,
        "rotterdam-new york": 7,
    };

    try {
        const response = await axios.get("https://infogram.com/world-container-index-1h17493095xl4zj");
        const scripts = document.createElement('html').innerHTML = response.data;
        let scriptContent = Array.from(scripts.querySelectorAll('script')).slice(-4, -3).map(script => script.textContent)[0];
        scriptContent = scriptContent.replace("window.infographicData=", "").slice(0, -1);
        const dataJson = JSON.parse(scriptContent);

        const dataJsonNeed = dataJson.elements.content.content.entities["7a55585f-3fb3-44e6-9b54-beea1cd20b4d"].data[symbolMap[symbol]];
        const dateList = _.map(dataJsonNeed.slice(1), item => item[0].value);
        let valueList;
        try {
            valueList = _.map(dataJsonNeed.slice(1), item => item[1].value);
        } catch (typeError) {
            valueList = _.map(dataJsonNeed.slice(1, -1), item => item[1].value);
        }

        const tempDf = _.zip(dateList, valueList).map(row => ({
            date: dayjs(row[0], 'DD-MMM-YY').toDate(),
            wci: Number.parseFloat(row[1])
        }));

        // 如果需要DataFrame结构，可以考虑使用额外的库如danfojs等。
        // 此处返回一个简单的对象数组，模拟pandas DataFrame的行为。
        return tempDf;
    } catch (error) {
        console.error(`Error fetching or processing Drewry WCI Index: ${error.message}`);
        throw error;
    }
}
module.exports = {
    drewry_wci_index : drewry_wci_index,
};