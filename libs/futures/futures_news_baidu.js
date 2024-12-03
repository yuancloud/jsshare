const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///百度股市通-期货-新闻

async function futures_news_baidu(symbol = "AL") {
    /**
     * 百度股市通-期货-新闻
     * https://gushitong.baidu.com/futures/ab-CJ888
     * @param {string} symbol 期货品种代码；大写
     * @returns {Array<Object>} 新闻列表
     */
    const url = "https://finance.pae.baidu.com/vapi/getfuturesnews";
    const params = {
        code: `${symbol}888`,
        pn: "0",
        rn: "2000",
        finClientType: "pc"
    };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempArr = dataJson.Result.map(item => ({
            "标题": item.title,
            "发布时间": dayjs.unix(item.publish_time).format('YYYY-MM-DD'),
            "新闻链接": item.third_url
        }));

        // 对数据按照发布时间排序
        tempArr.sort((a, b) => dayjs(a["发布时间"]).valueOf() - dayjs(b["发布时间"]).valueOf());

        return tempArr;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个空数组或错误信息，取决于你的需求
    }
}

// 不生成调用该方法的示例
module.exports = {
    futures_news_baidu : futures_news_baidu,
};