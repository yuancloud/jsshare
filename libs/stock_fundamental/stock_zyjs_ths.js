const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///同花顺-主营介绍
const cheerio = require('cheerio');

async function stock_zyjs_ths(symbol = "000066") {
    /**
     * 同花顺-主营介绍
     * @param {string} symbol - 股票代码
     * @returns {Object} 主营介绍数据
     */
    const url = `https://basic.10jqka.com.cn/new/${symbol}/operate.html`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { headers, responseType: 'text' });
        const $ = cheerio.load(response.data, { decodeEntities: false });

        let contentList = $('ul.main_intro_list li').map((i, el) => $(el).text().trim()).get();
        let columnsList = [];
        let valueList = [];

        for (let item of contentList) {
            let [column, ...value] = item.split('：');
            columnsList.push(column);
            valueList.push(value.join('：').replace(/\t|\n| /g, '').trim());
        }

        // 创建DataFrame类似的结构
        let tempDf = {};
        columnsList.forEach((col, index) => {
            if (!tempDf[col]) {
                tempDf[col] = [];
            }
            tempDf[col].push(valueList[index]);
        });
        tempDf['股票代码'] = [symbol]; // 添加股票代码列

        // 将第一行转换为列名，并重新构建对象
        let result = {};
        Object.keys(tempDf).forEach(key => {
            result[key] = tempDf[key][0];
        });

        return result;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}
module.exports = {
    stock_zyjs_ths : stock_zyjs_ths,
};