const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///国泰君安期货-交易日历数据表
const cheerio = require('cheerio');

async function futures_rule(date = "20231205") {
    /**
     * 国泰君安期货-交易日历数据表
     * https://www.gtjaqh.com/pc/calendar.html
     * @param {string} date - 需要指定为交易日, 且是近期的日期
     * @returns {Array<Object>} - 交易日历数据
     */
    const url = "https://www.gtjaqh.com/pc/calendar";
    const params = { date: date };
    const config = {
        params: params,
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) // 禁用SSL证书验证
    };

    try {
        const response = await axios.get(url, config);
        const $ = cheerio.load(response.data);
        const table = $('table').eq(0); // 假设我们需要的是第一个表格
        const rows = [];
        table.find('tr').each((index, element) => {
            if (index > 0) { // 跳过标题行
                const row = $(element).find('td').map((i, el) => $(el).text().trim()).get();
                rows.push(row);
            }
        });

        // 数据清理和转换
        const big_df = rows.map(row => ({
            '商品名称': row[0],
            '合约代码': row[1],
            '交易保证金比例': parseFloat(row[2].replace('%', '') || 0),
            '涨跌停板幅度': parseFloat(row[3].replace('%', '') || 0),
            '合约乘数': parseInt(row[4] || 0, 10),
            '最小变动价位': parseFloat(row[5] || 0),
            '限价单每笔最大下单手数': parseInt(row[6] || 0, 10)
        }));

        return big_df;
    } catch (error) {
        console.error(error);
        throw error; // 或者返回一个错误信息
    }
}
module.exports = {
    futures_rule: futures_rule,
};