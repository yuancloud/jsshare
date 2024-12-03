const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-期货库存数据

async function futuresInventoryEm(symbol = '沪铝') {
    const baseUrl = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    
    // 第一个请求获取TRADE_CODE
    const firstParams = new URLSearchParams({
        reportName: "RPT_FUTU_POSITIONCODE",
        columns: "TRADE_MARKET_CODE,TRADE_CODE,TRADE_TYPE",
        filter: '(IS_MAINCODE="1")',
        pageNumber: "1",
        pageSize: "500",
        source: "WEB",
        client: "WEB",
        _: "1669352163467"
    });

    let response = await axios.get(`${baseUrl}?${firstParams}`);
    let dataJson = response.data;
    let tempData = dataJson.result.data;
    let symbolDict = {};
    for (let item of tempData) {
        symbolDict[item.TRADE_TYPE] = item.TRADE_CODE;
    }

    // 第二个请求获取库存数据
    const secondParams = new URLSearchParams({
        reportName: "RPT_FUTU_STOCKDATA",
        columns: "SECURITY_CODE,TRADE_DATE,ON_WARRANT_NUM,ADDCHANGE",
        filter: `(SECURITY_CODE="${symbolDict[symbol]}")(TRADE_DATE>='2020-10-28')`,
        pageNumber: "1",
        pageSize: "500",
        sortTypes: "-1",
        sortColumns: "TRADE_DATE",
        source: "WEB",
        client: "WEB",
        _: "1669352163467"
    });

    response = await axios.get(`${baseUrl}?${secondParams}`);
    dataJson = response.data;
    tempData = dataJson.result.data;

    // 处理数据
    let tempDf = tempData.map(item => ({
        日期: dayjs(item.TRADE_DATE).toDate(),
        库存: parseFloat(item.ON_WARRANT_NUM) || null,
        增减: parseFloat(item.ADDCHANGE) || null
    }));

    // 按日期排序
    tempDf.sort((a, b) => a.日期 - b.日期);

    return tempDf;
}

// 注意：在实际使用中，你需要确保已经安装了axios和dayjs库。
// 你可以通过npm install axios dayjs命令来安装这些依赖。
module.exports = {
    futures_inventory_em : futures_inventory_em,
};