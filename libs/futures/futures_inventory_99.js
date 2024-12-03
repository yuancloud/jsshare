const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///99 期货网-大宗商品库存数据
const { readFileSync } = require('fs');
const { JSDOM } = require('jsdom');

function futuresInventory99(exchange = "大连商品交易所", symbol = "豆一") {
    const dataCode = {
        "1": ["1", "2", "3", "12", "32", "36", "37", "40", "42", "47", "56", "63", "69", "70", "79", "85"],
        // ... 其他数据省略
        "11": ["91"]
    };
    const dataName = {
        "1": ["铜", "铝", "橡胶", "燃料油", "锌", "黄金", "螺纹钢", "线材", "铅", "白银", "石油沥青", "热轧卷板", "锡", "镍", "纸浆", "不锈钢"],
        // ... 其他数据省略
        "11": ["OSE橡胶"]
    };
    const tempOutExchangeName = {
        "1": "上海期货交易所",
        "2": "郑州商品交易所",
        "3": "大连商品交易所",
        "4": "LME",
        "5": "NYMEX",
        "6": "CBOT",
        "7": "NYBOT",
        "8": "TOCOM",
        "10": "上海国际能源交易中心",
        "11": "OSE"
    };
    const exchangeMap = Object.fromEntries(Object.entries(tempOutExchangeName).map(([k, v]) => [v, k]));
    const exchangeId = exchangeMap[exchange];
    const tempSymbolCodeMap = Object.fromEntries(dataName[exchangeId].map((name, index) => [name, dataCode[exchangeId][index]]));
    const symbolId = tempSymbolCodeMap[symbol];

    let n = 10;
    while (n !== 0) {
        try {
            n -= 1;
            const url = "http://service.99qh.com/Storage/Storage.aspx";
            const params = new URLSearchParams({ page: '99qh' });
            axios.post(url, params, { headers: sampleHeaders })
                .then(response => {
                    const cookie = response.headers['set-cookie'];
                    const dom = new JSDOM(response.data);
                    const viewState = dom.window.document.querySelector("[id='__VIEWSTATE']").value;
                    const eventValidation = dom.window.document.querySelector("[id='__EVENTVALIDATION']").value;

                    const payload1 = new URLSearchParams({
                        "__EVENTTARGET": "ddlExchName",
                        "__EVENTARGUMENT": "",
                        "__LASTFOCUS": "",
                        "__VIEWSTATE": viewState,
                        "__VIEWSTATEGENERATOR": "6EAC22FA",
                        "__EVENTVALIDATION": eventValidation,
                        "ddlExchName": exchangeId,
                        "ddlGoodsName": 1
                    });

                    return axios.post(url, payload1, { headers: qhHeaders, params, withCredentials: true });
                }).then(response => {
                    const dom = new JSDOM(response.data);
                    const viewState = dom.window.document.querySelector("[id='__VIEWSTATE']").value;
                    const eventValidation = dom.window.document.querySelector("[id='__EVENTVALIDATION']").value;

                    const payload2 = new URLSearchParams({
                        "__EVENTTARGET": "ddlGoodsName",
                        "__EVENTARGUMENT": "",
                        "__LASTFOCUS": "",
                        "__VIEWSTATE": viewState,
                        "__VIEWSTATEGENERATOR": "6EAC22FA",
                        "__EVENTVALIDATION": eventValidation,
                        "ddlExchName": exchangeId,
                        "ddlGoodsName": symbolId
                    });

                    return axios.post(url, payload2, { headers: qhHeaders, params, withCredentials: true });
                }).then(response => {
                    const tables = parseHtmlTables(response.data);
                    const data = tables.pop().transpose();
                    data.columns = data.shift();
                    data.forEach(row => {
                        row['日期'] = dayjs(row['日期']).toDate();
                        row['库存'] = parseFloat(row['库存']);
                        row['增减'] = parseFloat(row['增减']);
                    });
                    data.sort((a, b) => a['日期'] - b['日期']);
                    return data; // 返回最终的数据
                }).catch(error => console.error(error));
        } catch (error) {
            continue;
        }
    }
}

// 假设有一个函数可以解析 HTML 表格并返回一个数组
function parseHtmlTables(html) {
    // 这里需要实现解析HTML表格的逻辑
}

// 示例头信息
const sampleHeaders = {};
const qhHeaders = {};

// 注意：你需要根据实际情况定义 sampleHeaders 和 qhHeaders 的内容。
module.exports = {
    futures_inventory_99: futures_inventory_99,
};