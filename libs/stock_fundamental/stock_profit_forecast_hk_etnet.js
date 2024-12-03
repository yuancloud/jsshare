const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///经济通-公司资料-盈利预测
const cheerio = require('cheerio');

async function stockHkProfitForecastEt(symbol = "09999", indicator = "盈利预测概览") {
    const url = "https://www.etnet.com.hk/www/sc/stocks/realtime/quote_profit.php";
    const params = {
        code: parseInt(symbol, 10),
    };

    try {
        const response = await axios.get(url, { params });
        const $ = cheerio.load(response.data);

        if (indicator === "评级总览") {
            const table = $('table').eq(0);
            const rows = [];
            table.find('tr').each((i, row) => {
                const cells = $(row).find('td');
                if (cells.length > 0) {
                    const innerText = cells.eq(0).text().trim();
                    const items = innerText.split(' ').filter(item => item !== '');
                    items.shift(); // Remove '平均评级'
                    rows.push(items);
                }
            });
            const tempDf = [rows[0]];
            return tempDf;
        } else if (indicator === "去年度业绩表现") {
            const table = $('table').eq(2);
            const upperRows = [];
            const downRows = [];
            table.find('tr').each((i, row) => {
                const cells = $(row).find('td');
                if (cells.length > 0) {
                    upperRows.push([cells.eq(0).text().trim(), cells.eq(1).text().trim()]);
                    downRows.push([cells.eq(3).text().trim(), cells.eq(4).text().trim()]);
                }
            });
            return [...upperRows, ...downRows];
        } else if (indicator === "综合盈利预测") {
            const table = $('table').eq(3);
            const header = table.find('thead tr th').map((i, el) => $(el).text().trim()).get();
            const data = table.find('tbody tr').map((i, el) => {
                return $(el).find('td').map((j, td) => $(td).text().trim()).get();
            }).get();

            // Rename columns and convert to numeric where appropriate
            const columnMapping = {
                '纯利/(亏损)  (百万元人民币)': '纯利/亏损',
                '纯利/(亏损)  (百万港元)': '纯利/亏损',
                // ... other mappings
            };
            const newHeader = header.map(h => columnMapping[h] || h);
            const newData = data.map(row => row.map((value, index) => {
                const columnName = newHeader[index];
                if (['纯利/亏损', '每股盈利/每股亏损', '每股派息', '每股资产净值', '最高', '最低'].includes(columnName)) {
                    return parseFloat(value.replace(/,/g, '') || NaN);
                }
                return value;
            }));

            return [newHeader, ...newData];
        } else if (indicator === "盈利预测概览") {
            const table = $('table').eq(4);
            const header = table.find('thead tr th').map((i, el) => $(el).text().trim()).get();
            const data = table.find('tbody tr').map((i, el) => {
                return $(el).find('td').map((j, td) => $(td).text().trim()).get();
            }).get();

            // Process data as in the Python code
            // ... similar to the above but with different column mapping and cleaning

            return [header, ...data];
        }
    } catch (error) {
        console.error(error);
    }
}

// Note: The returned data structure is simplified and may need further processing.
module.exports = {
    stock_hk_profit_forecast_et : stock_hk_profit_forecast_et,
};