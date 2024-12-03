const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-股市日历-公司动态

async function stock_gsrl_gsdt_em(date = "20230808") {
    /**
     * 东方财富网-数据中心-股市日历-公司动态
     * https://data.eastmoney.com/gsrl/gsdt.html
     * @param {string} date - 交易日
     * @returns {Array} 公司动态
     */
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "SECURITY_CODE",
        sortTypes: "1",
        pageSize: "5000",
        pageNumber: "1",
        columns: "SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,EVENT_TYPE,EVENT_CONTENT,TRADE_DATE",
        source: "WEB",
        client: "WEB",
        reportName: "RPT_ORGOP_ALL",
        filter: `(TRADE_DATE='${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}')`
    });

    try {
        const response = await axios.get(url, { params });
        const records = response.data.result.data;
        let results = records.map((item, index) => ({
            序号: index + 1,
            代码: item.SECURITY_CODE,
            简称: item.SECURITY_NAME_ABBR,
            事件类型: item.EVENT_TYPE,
            具体事项: item.EVENT_CONTENT,
            交易日: dayjs(item.TRADE_DATE).format('YYYY-MM-DD')
        }));

        return results;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_gsrl_gsdt_em: stock_gsrl_gsdt_em,
};