const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///益盟-F10-管理层讨论与分析
const cheerio = require('cheerio');

async function stock_mda_ym(symbol = "000001") {
    /**
     * 益盟-F10-管理层讨论与分析
     * https://f10.emoney.cn/f10/zbyz/1000001
     * @param {string} symbol - 股票代码
     * @returns {Array<Object>} - 管理层讨论与分析数据
     */
    const url = `http://f10.emoney.cn/f10/zygc/${symbol}`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const yearList = $('.swlab_t li').map((i, el) => $(el).text().trim()).get();
        const talkList = $('.cnt').map((i, el) => $(el).text().trim().replace(/\u00a0/g, ' ')).get();

        // 创建一个二维数组，然后转换为对象数组
        const bigDf = yearList.map((year, index) => ({
            "报告期": year,
            "内容": talkList[index]
        }));

        return bigDf;
    } catch (error) {
        console.error(`Error fetching or parsing data: ${error.message}`);
        throw error;  // 或者根据需要处理错误
    }
}

// 注意：此函数返回的是一个Promise，因此在调用时应该使用await或者.then()来处理异步结果。
module.exports = {
    stock_mda_ym : stock_mda_ym,
};