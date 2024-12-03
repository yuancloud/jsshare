const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///查询期货合约详情
const cheerio = require('cheerio');
const iconv = require('iconv-lite'); // 用于编码转换

async function futuresContractDetail(symbol = 'AP2101') {
    /**
     * 查询期货合约详情
     * @param {string} symbol - 合约
     * @returns {Promise<Array>} - 期货合约详情
     */
    const url = `https://finance.sina.com.cn/futures/quotes/${symbol}.shtml`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        let html = iconv.decode(response.data, 'gb2312');

        const $ = cheerio.load(html);
        const table = $('table').eq(5); // 注意：jQuery的.eq()从0开始索引，所以对应的是第6个表格
        const rows = table.find('tr');

        const dataOne = [];
        const dataTwo = [];
        const dataThree = [];

        rows.each((index, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 2) {
                dataOne.push({ item: $(cells[0]).text(), value: $(cells[1]).text() });
            }
            if (cells.length >= 4) {
                dataTwo.push({ item: $(cells[2]).text(), value: $(cells[3]).text() });
            }
            if (cells.length > 4) {
                for (let i = 4; i < cells.length; i += 2) {
                    dataThree.push({ item: $(cells[i]).text(), value: $(cells[i + 1]).text() });
                }
            }
        });

        // 将三部分数据合并成一个数组
        return [...dataOne, ...dataTwo, ...dataThree];
    } catch (error) {
        console.error(`Error fetching or parsing the data: ${error.message}`);
        throw error;
    }
}

// 不生成调用改方法的示例
module.exports = {
    futures_contract_detail: futures_contract_detail,
};