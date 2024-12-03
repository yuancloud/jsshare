const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///金十财经-上海期货交易所指定交割仓库库存周报

async function futures_stock_shfe_js(date = "20240419") {
    /**
     * 金十财经-上海期货交易所指定交割仓库库存周报
     * https://datacenter.jin10.com/reportType/dc_shfe_weekly_stock
     * @param {string} date - 交易日; 库存周报只在每周的最后一个交易日公布数据
     * @returns {Array<Object>} - 库存周报
     */

    const headers = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "x-app-id": "rU6QIu7JHe2gOUeR",
        "x-csrf-token": "x-csrf-token",
        "x-version": "1.0.0",
    };

    const url = "https://datacenter-api.jin10.com/reports/list";
    const params = {
        category: "stock",
        date: [date.slice(0, 4), date.slice(4, 6), date.slice(6)].join("-"),
        attr_id: "1",
        _: "1708761356458", // 这个参数看起来像是时间戳或某种唯一标识符，可能需要动态生成
    };

    try {
        const response = await axios.get(url, { headers, params });
        const dataJson = response.data;

        const columnsList = dataJson.data.keys.map(item => item.name);
        const tempData = dataJson.data.values.map(row => {
            const obj = {};
            row.forEach((value, index) => {
                let key = columnsList[index];
                if (index > 0) {
                    value = Number(value); // 尝试转换为数字
                    if (isNaN(value)) {
                        value = null; // 如果转换失败，则设置为null
                    }
                }
                obj[key] = value;
            });
            return obj;
        });

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    futures_stock_shfe_js: futures_stock_shfe_js,
};