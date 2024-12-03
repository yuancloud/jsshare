const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///数库-A股新闻情绪指数

async function indexNewsSentimentScope() {
    /**
     * 数库-A股新闻情绪指数
     * https://www.chinascope.com/reasearch.html
     * @returns {Array} A股新闻情绪指数
     */
    const url = "https://www.chinascope.com/inews/senti/index";
    const params = { period: "YEAR" };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        
        // 使用lodash的map方法转换数据
        const tempData = _.map(dataJson, (item) => ({
            日期: item.tradeDate,
            市场情绪指数: item.maIndex1,
            沪深300指数: item.marketClose,
        }));

        // 进一步处理日期和数值
        const result = tempData.map(item => ({
            日期: dayjs(item.日期).toDate(),
            市场情绪指数: Number.parseFloat(item.市场情绪指数),
            沪深300指数: Number.parseFloat(item.沪深300指数)
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需要处理错误
    }
}
module.exports = {
    index_news_sentiment_scope : index_news_sentiment_scope,
};