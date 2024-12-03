const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///义乌小商品指数
const cheerio = require('cheerio');

async function index_yw(symbol = "月景气指数") {
    const nameNumDict = {
        "周价格指数": 1,
        "月价格指数": 3,
        "月景气指数": 5,
    };

    try {
        const response = await axios.get('https://www.ywindex.com/Home/Product/index/', { httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        const $ = cheerio.load(response.data);
        const tableElement = $('.tablex').get(nameNumDict[symbol]);
        const tableText = $(tableElement).text();

        const [tableName, ...tableContent] = tableText.split('\n\n\n\n\n');
        const rows = tableContent[1].split('\n\n').map(row => row.split('\n'));

        let tableColumns;
        if (symbol === "月景气指数") {
            tableColumns = ["期数", "景气指数", "规模指数", "效益指数", "市场信心指数"];
            rows.forEach(row => {
                row[0] = dayjs(row[0], 'YYYY-MM-DD', true).toDate();
                for (let i = 1; i < 5; i++) {
                    row[i] = parseFloat(row[i]) || null;
                }
            });
        } else {
            tableColumns = tableName.split('\n');
            rows.forEach(row => {
                row[0] = dayjs(row[0], 'YYYY-MM-DD', true).toDate();
                for (let i = 1; i < 6; i++) {
                    row[i] = parseFloat(row[i]) || null;
                }
            });
        }

        // 排序并返回结果
        return rows.sort((a, b) => a[0] - b[0]).map(row => Object.fromEntries(tableColumns.map((key, index) => [key, row[index]])));
    } catch (error) {
        console.error(`Error fetching or parsing data: ${error.message}`);
        throw error;
    }
}
module.exports = {
    index_yw : index_yw,
};