const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///浙江省排污权交易指数

async function index_eri(symbol = "月度") {
    const symbolMap = {
        "月度": "MONTH",
        "季度": "QUARTER",
    };

    const url = "https://zs.zjpwq.net/pwq-index-webapi/indexData";
    const params = {
        cycle: symbolMap[symbol],
        regionId: "1",
        structId: "1",
        pageSize: "5000",
        indexId: "1",
        orderBy: "stage.publishTime",
    };
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { params, headers });
        const dataJson = response.data;
        const indexValue = dataJson.data.map(item => item.indexValue);
        const indexTime = dataJson.data.map(item => item.stage.publishTime);

        let bigDf = indexTime.map((time, i) => ({
            日期: time,
            交易指数: indexValue[i]
        }));

        const statisticsUrl = "https://zs.zjpwq.net/pwq-index-webapi/dataStatistics";
        const statisticsResponse = await axios.get(statisticsUrl, { params, headers });
        const statisticsJson = statisticsResponse.data;

        bigDf = bigDf.map((item, i) => ({
            ...item,
            成交量: parseFloat(statisticsJson.data[i].totalQuantity),
            成交额: parseFloat(statisticsJson.data[i].totalCost)
        }));

        // 处理日期格式
        bigDf = bigDf.map(item => ({
            ...item,
            日期: dayjs(item.日期).toDate(),
            交易指数: parseFloat(item.交易指数) || 0,
            成交量: parseFloat(item.成交量) || 0,
            成交额: parseFloat(item.成交额) || 0
        }));

        return bigDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    index_eri : index_eri,
};