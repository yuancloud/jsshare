const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///中国公路物流运价指数

async function index_price_cflp(symbol = "周指数") {
    const symbolMap = {
        "周指数": "2",
        "月指数": "3",
        "季度指数": "4",
        "年度指数": "5",
    };

    const url = "http://index.0256.cn/expcenter_trend.action";
    const params = new URLSearchParams({
        marketId: "1",
        attribute1: "5",
        exponentTypeId: symbolMap[symbol],
        cateId: "2",
        attribute2: "华北",
        city: "",
        startLine: "",
        endLine: "",
    });

    const headers = {
        Origin: "http://index.0256.cn",
        Referer: "http://index.0256.cn/expx.htm",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
    };

    try {
        const response = await axios.post(url, params.toString(), { headers });
        const dataJson = response.data;
        
        // 转换数据
        const tempData = [
            dataJson.chart1.xLebal,
            dataJson.chart1.yLebal,
            dataJson.chart2.yLebal,
            dataJson.chart3.yLebal,
        ];

        // 使用lodash来转置数组
        const tempDf = _.zip(...tempData).map(row => ({
            日期: dayjs(row[0], 'YYYY-MM-DD', true).toDate(),
            定基指数: parseFloat(row[1]) || null,
            环比指数: parseFloat(row[2]) || null,
            同比指数: parseFloat(row[3]) || null,
        }));

        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///中国公路物流运量指数

async function index_volume_cflp(symbol = "月指数") {
    const symbolMap = {
        "月指数": "3",
        "季度指数": "4",
        "年度指数": "5",
    };

    const url = "http://index.0256.cn/volume_query.action";
    const params = new URLSearchParams({
        type: "1",
        marketId: "1",
        expTypeId: symbolMap[symbol],
        startDate1: "",
        endDate1: "",
        city: "",
        startDate3: "",
        endDate3: "",
    });

    const headers = {
        Origin: "http://index.0256.cn",
        Referer: "http://index.0256.cn/expx.htm",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
    };

    try {
        const response = await axios.post(url, params.toString(), { headers });
        const dataJson = response.data;

        // 构建DataFrame
        const tempData = [
            dataJson.chart1.xLebal,
            dataJson.chart1.yLebal,
            dataJson.chart2.yLebal,
            dataJson.chart3.yLebal,
        ];

        const tempDf = [];
        for (let i = 0; i < tempData[0].length; i++) {
            tempDf.push([
                dayjs(tempData[0][i], 'YYYY-MM-DD').toDate(),
                parseFloat(tempData[1][i]) || null,
                parseFloat(tempData[2][i]) || null,
                parseFloat(tempData[3][i]) || null,
            ]);
        }

        return tempDf;
    } catch (error) {
        console.error("Error fetching the data:", error);
        throw error;
    }
}
module.exports = {
    index_price_cflp : index_price_cflp,
    index_volume_cflp : index_volume_cflp,
};