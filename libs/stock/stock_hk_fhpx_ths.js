const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
const cheerio = require('cheerio');
///同花顺-港股-分红派息
async function stock_hk_fhpx_detail_ths(symbol = "0700") {
    /**
     * 同花顺-港股-分红派息
     * https://stockpage.10jqka.com.cn/HK0700/bonus/
     * @param {string} symbol - 港股代码
     * @returns {Array} 分红派息数据
     */
    const url = `https://basic.10jqka.com.cn/176/HK${symbol}/bonus.html`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        const temp_df = [];
        $('table>tbody').first().find('tr').each((index, element) => {
            if (index > 0) { // 跳过表头
                const tds = $(element).children();
                temp_df.push({
                    '公告日期': ($(tds[0]).text())?.replace(/-/g, ''),
                    '方案': $(tds[1]).text(),
                    '除净日': $(tds[2]).text() == '--' ? "" : $(tds[2]).text()?.replace(/-/g, ''),
                    '派息日': $(tds[3]).text() == '--' ? "" : $(tds[3]).text()?.replace(/-/g, ''),
                    '过户日期起止日-起始': $(tds[4]).text() == '--' ? "" : $(tds[4]).text()?.replace(/-/g, ''),
                    '过户日期起止日-截止': $(tds[5]).text() == '--' ? "" : $(tds[5]).text()?.replace(/-/g, ''),
                    '类型': $(tds[6]).text(),
                    '进度': $(tds[7]).text(),
                    '以股代息': $(tds[8]).text()?.replace(/\t/g, '')?.replace(/\n/g, ''),
                });
            }
        });
        const result = temp_df.filter(item => item['派息日'] && item['除净日']).sort((a, b) => a['公告日期'] - b['公告日期']);
        return result;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
module.exports = {
    stock_hk_fhpx_detail_ths: stock_hk_fhpx_detail_ths,
};