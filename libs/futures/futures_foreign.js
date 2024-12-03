const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///外盘期货-历史行情数据-日频率

async function futures_foreign_hist(symbol = "ZSD") {
    /**
     * 外盘期货-历史行情数据-日频率
     * https://finance.sina.com.cn/money/future/hf.html
     * @param {string} symbol - 期货符号，可以从futures_foreign_commodity_subscribe_exchange_symbol获取
     * @returns {Array} - 从2010年开始的历史数据
     */
    const today = `${dayjs().year()}_${dayjs().month() + 1}_${dayjs().date()}`; // 注意：dayjs的月份是从0开始的
    const url = `https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_S${today}=/GlobalFuturesService.getGlobalFuturesDailyKLine`;
    
    const params = new URLSearchParams({
        symbol: symbol,
        _: today,
        source: 'web',
    });
    
    try {
        const response = await axios.get(url, {params: params});
        const dataText = response.data;
        const jsonDataStartIndex = dataText.indexOf('[');
        const jsonDataEndIndex = dataText.lastIndexOf(']') + 1; // 获取到JSON部分的结束位置
        const jsonData = JSON.parse(dataText.substring(jsonDataStartIndex, jsonDataEndIndex));
        
        return jsonData;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error; // 或者根据需要处理错误
    }
}
///foreign futures contract detail data
const cheerio = require('cheerio');

async function futures_foreign_detail(symbol = "ZSD") {
    /**
     * 获取外盘期货合约详情数据
     * @param {string} symbol - 期货符号，你可以从hf_subscribe_exchange_symbol函数获取
     * @returns {Promise<Array>} - 合约详情
     */
    const url = `https://finance.sina.com.cn/futures/quotes/${symbol}.shtml`;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        // 解码响应体
        const dataText = response.data.toString('gbk');
        const $ = cheerio.load(dataText);
        
        // 假设我们需要的表格是页面中的第7个table
        const table = $('table').eq(6);
        const rows = table.find('tr');
        let data = [];
        
        rows.each((i, row) => {
            const cells = $(row).find('td');
            let rowData = [];
            cells.each((j, cell) => {
                rowData.push($(cell).text().trim());
            });
            if (rowData.length > 0) {
                data.push(rowData);
            }
        });

        return data;
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        throw error;
    }
}
module.exports = {
    futures_foreign_hist : futures_foreign_hist,
    futures_foreign_detail : futures_foreign_detail,
};