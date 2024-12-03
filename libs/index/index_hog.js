const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///行情宝-生猪市场价格指数

async function indexHogSpotPrice() {
    /**
     * 行情宝-生猪市场价格指数
     * https://hqb.nxin.com/pigindex/index.shtml
     * @returns {Array} 生猪市场价格指数
     */
    const url = "https://hqb.nxin.com/pigindex/getPigIndexChart.shtml";
    const params = { regionId: "0" };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;

        // 假设dataJson["data"]是一个数组，每个元素都是一个对象
        let tempData = dataJson.data.map(item => ({
            日期: dayjs(item.date).add(8, 'hour').format('YYYY-MM-DD'),
            指数: _.toNumber(item.index),
            '4个月均线': _.toNumber(item['4_month_avg']),
            '6个月均线': _.toNumber(item['6_month_avg']),
            '12个月均线': _.toNumber(item['12_month_avg']),
            预售均价: _.toNumber(item.pre_sale_price),
            成交均价: _.toNumber(item.transaction_price),
            成交均重: _.toNumber(item.transaction_weight)
        }));

        // 对于那些可能无法转换为数字的情况，我们确保它们是null而不是NaN
        tempData = tempData.map(row => _.mapValues(row, value => (isNaN(value) ? null : value)));

        return tempData;
    } catch (error) {
        console.error("Error fetching or processing the data:", error);
        throw error; // 或者返回一个空数组或其他默认值
    }
}

// 注意：这个函数返回的是一个Promise，因为它包含了异步操作。
module.exports = {
    index_hog_spot_price : index_hog_spot_price,
};