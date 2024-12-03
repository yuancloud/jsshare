const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-期货期权-COMEX库存数据

async function futuresComexInventory(symbol = '黄金') {
    const symbolMap = {
        "黄金": "EMI00069026",
        "白银": "EMI00069027",
    };

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        sortColumns: "REPORT_DATE",
        sortTypes: "-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_FUTUOPT_GOLDSIL",
        columns: "ALL",
        quoteColumns: "",
        source: "WEB",
        client: "WEB",
        filter: `(INDICATOR_ID1="${symbolMap[symbol]}")(@STORAGE_TON<>"NULL")`,
    };

    try {
        let response = await axios.get(url, { params });
        let dataJson = response.data;
        let totalPages = dataJson.result.pages;
        let bigDf = [];

        for (let page = 1; page <= totalPages; page++) {
            params.pageNumber = page.toString();
            response = await axios.get(url, { params });
            dataJson = response.data;
            let tempDf = dataJson.result.data;
            bigDf = bigDf.concat(tempDf);
        }

        // 数据处理
        bigDf = _.map(bigDf, (row, index) => ({
            序号: index + 1,
            日期: row.REPORT_DATE,
            [`${"COMEX"}${symbol}库存量-吨`]: parseFloat(row.STORAGE_TON) || null,
            [`${"COMEX"}${symbol}库存量-盎司`]: parseFloat(row.STORAGE_OUNCE) || null,
        }));

        // 排序和重新编号
        bigDf = _.sortBy(bigDf, ['日期']);
        bigDf = _.map(bigDf, (row, index) => ({ ...row, 序号: index + 1 }));
        bigDf = _.map(bigDf, row => ({
            ...row,
            日期: dayjs(row.日期).format('YYYY-MM-DD')
        }));

        return bigDf;
    } catch (error) {
        console.error(`Error fetching COMEX inventory data: ${error.message}`);
        throw error;
    }
}
module.exports = {
    futures_comex_inventory: futures_comex_inventory,
};