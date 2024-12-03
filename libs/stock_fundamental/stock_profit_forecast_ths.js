const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///同花顺-盈利预测
const cheerio = require('cheerio');

async function stockProfitForecastThs(symbol = "600519", indicator = "预测年报每股收益") {
    /**
     * 同花顺-盈利预测
     * @param {string} symbol - 股票代码
     * @param {string} indicator - 选择项：{"预测年报每股收益", "预测年报净利润", "业绩预测详表-机构", "业绩预测详表-详细指标预测"}
     * @returns {Promise<Array>} 盈利预测数据
     */
    const url = `https://basic.10jqka.com.cn/new/${symbol}/worth.html`;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const html = response.data.toString('gbk'); // 解码成GBK
        const $ = cheerio.load(html);

        let tempData;
        if (indicator === "预测年报每股收益") {
            tempData = parseTable($, 0);
            for (let row of tempData) {
                row['年度'] = String(row['年度']);
            }
        } else if (indicator === "预测年报净利润") {
            tempData = parseTable($, 1);
            for (let row of tempData) {
                row['年度'] = String(row['年度']);
            }
        } else if (indicator === "业绩预测详表-机构") {
            tempData = parseTable($, 2);
            const columnsList = [];
            for (let item of tempData[0]) {
                columnsList.push(item);
            }
            columnsList[2] = "预测年报每股收益" + columnsList[2];
            columnsList[3] = "预测年报每股收益" + columnsList[3];
            columnsList[4] = "预测年报每股收益" + columnsList[4];
            columnsList[5] = "预测年报净利润" + columnsList[5];
            columnsList[6] = "预测年报净利润" + columnsList[6];
            columnsList[7] = "预测年报净利润" + columnsList[7];
            tempData.shift(); // 移除原始列名行
            for (let row of tempData) {
                row['报告日期'] = dayjs(row['报告日期']).format('YYYY-MM-DD');
            }
        } else if (indicator === "业绩预测详表-详细指标预测") {
            tempData = parseTable($, 3);
            for (let i = 0; i < tempData[0].length; i++) {
                tempData[0][i] = tempData[0][i].replace("（", "-").replace("）", "");
            }
        }

        return tempData;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function parseTable($, index) {
    const table = $('table').eq(index);
    const headers = [];
    const rows = [];

    table.find('thead tr th, thead tr td').each(function() {
        headers.push($(this).text().trim());
    });

    table.find('tbody tr').each(function() {
        const row = {};
        $(this).find('td').each(function(i) {
            row[headers[i]] = $(this).text().trim();
        });
        rows.push(row);
    });

    return [headers, ...rows];
}
module.exports = {
    stock_profit_forecast_ths : stock_profit_forecast_ths,
};