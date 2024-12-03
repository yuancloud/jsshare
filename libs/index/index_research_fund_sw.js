const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///申万宏源研究-申万指数-指数发布-基金指数-实时行情

async function indexRealtimeFundSw(symbol = "基础一级") {
    /**
     * 申万宏源研究-申万指数-指数发布-基金指数-实时行情
     * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex
     * @param {string} symbol - 选择{"基础一级", "基础二级", "基础三级", "特色指数"}
     * @returns {Array} 基金指数-实时行情
     */
    const url = "https://www.swsresearch.com/insWechatSw/fundIndex/pageList";
    const payload = {
        pageNo: 1,
        pageSize: 50,
        indexTypeName: symbol,
        sortField: "",
        rule: "",
        indexType: 1,
    };
    const headers = {}; // 根据实际情况设置headers
    try {
        const response = await axios.post(url, payload, { headers });
        const dataJson = response.data;
        let tempData = _.get(dataJson, 'data.list', []);

        // 重命名列
        tempData = tempData.map(item => ({
            "指数代码": item.swIndexCode,
            "指数名称": item.swIndexName,
            "昨收盘": parseFloat(item.lastCloseIndex) || null,
            "日涨跌幅": parseFloat(item.lastMarkup) || null,
            "年涨跌幅": parseFloat(item.yearMarkup) || null,
        }));

        // 选择需要的列
        tempData = tempData.map(item => _.pick(item, ["指数代码", "指数名称", "昨收盘", "日涨跌幅", "年涨跌幅"]));

        return tempData;
    } catch (error) {
        console.error("Error fetching fund index data:", error);
        throw error; // 或者返回一个默认值或错误信息
    }
}

// 注意：此处未提供方法调用示例。
///申万宏源研究-申万指数-指数发布-基金指数-历史行情

function index_hist_fund_sw(symbol = "807200", period = "day") {
    /**
     * 申万宏源研究-申万指数-指数发布-基金指数-历史行情
     * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex/fundDetail?code=807100
     * @param {string} symbol - 基金指数代码
     * @param {string} period - 周期
     * @return {Promise<Array>} - 历史行情
     */
    const periodMap = {
        "day": "DAY",
        "week": "WEEK",
        "month": "MONTH",
    };
    const url = "https://www.swsresearch.com/insWechatSw/fundIndex/getFundKChartData";
    const payload = { swIndexCode: symbol, type: periodMap[period] };
    const headers = {}; // 如果有需要添加headers，请在这里定义

    return axios.post(url, payload, { headers })
        .then(response => {
            const dataJson = response.data;
            const tempData = dataJson.data.map(item => ({
                日期: item.bargaindate,
                指数名称: item.swIndexName,
                指数代码: item.swindexcode,
                收盘指数: parseFloat(item.closeindex) || null,
                最高指数: parseFloat(item.maxindex) || null,
                最低指数: parseFloat(item.minindex) || null,
                开盘指数: parseFloat(item.openindex) || null,
                涨跌幅: parseFloat(item.markup) || null,
            }));

            // 只保留所需的列
            const filteredData = tempData.map(item => ({
                日期: dayjs(item.日期).toDate(),
                收盘指数: item.收盘指数,
                开盘指数: item.开盘指数,
                最高指数: item.最高指数,
                最低指数: item.最低指数,
                涨跌幅: item.涨跌幅,
            }));

            return filteredData;
        });
}

// 注意：此函数返回一个Promise，因此调用时需要处理异步结果。
module.exports = {
    index_realtime_fund_sw : index_realtime_fund_sw,
    index_hist_fund_sw : index_hist_fund_sw,
};