const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富-个股人气榜-人气榜-港股市场

async function stock_hk_hot_rank_em() {
    const url = "https://emappdata.eastmoney.com/stockrank/getAllCurrHkUsList";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        marketType: "000003",
        pageNo: 1,
        pageSize: 100,
    };

    try {
        const response = await axios.post(url, payload);
        let tempRankData = response.data.data;
        tempRankData = tempRankData.map(item => ({
            ...item,
            mark: "116." + item.sc.slice(3),
        }));

        const params = {
            ut: "f057cbcbce2a86e2866ab8877db1d059",
            fltt: "2",
            invt: "2",
            fields: "f14,f3,f12,f2",
            secids: _.join(_.map(tempRankData, 'mark'), ',') + ",?v=08926209912590994",
        };
        const dataUrl = "https://push2.eastmoney.com/api/qt/ulist.np/get";
        const dataResponse = await axios.get(dataUrl, { params });
        let tempData = dataResponse.data.data.diff;
        let result = tempData.map((item, index) => ({
            最新价: item.f2,
            涨跌幅: item.f3,
            代码: item.f12,
            股票名称: item.f14,
            当前排名: tempRankData.find(f => f.mark.endsWith(item.f12)).rk,
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个空数组或错误信息
    }
}

///东方财富-个股人气榜-历史趋势
async function stock_hk_hot_rank_detail_em(symbol = "00700") {
    /**
     * 东方财富-个股人气榜-历史趋势
     * @param {string} symbol - 带市场表示的证券代码
     * @returns {Array} - 个股的历史趋势
     */
    const url_rank = "https://emappdata.eastmoney.com/stockrank/getHisHkUsList";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        marketType: "000003",
        srcSecurityCode: `HK|${symbol}`,
    };

    try {
        const response = await axios.post(url_rank, payload);
        const records = response.data?.data;
        let result = records.map(item => ({
            时间: item.calcTime,
            排名: item.rank,
            证券代码: symbol
        }));
        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需要处理错误
    }
}
///东方财富-个股人气榜-实时变动
async function stock_hk_hot_rank_detail_realtime_em(symbol = "00700") {
    /**
     * 东方财富-个股人气榜-实时变动
     * https://guba.eastmoney.com/rank/stock?code=HK_00700
     * @param {string} symbol - 带市场表示的证券代码
     * @returns {Promise<Array>} 返回一个包含排名信息的对象数组
     */
    const url = "https://emappdata.eastmoney.com/stockrank/getCurrentHkUsList";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        marketType: "000003",
        srcSecurityCode: `HK|${symbol}`,
    };

    try {
        const response = await axios.post(url, payload);
        const dataJson = response.data?.data;
        let tempArray = dataJson.map(item => ({
            时间: item.calcTime,
            排名: item.rank
        }));
        // 这里假设原始数据中的键名为"time"和"rank"，如果实际返回的数据结构不同，请根据实际情况调整。
        return tempArray;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error; // 或者可以在这里处理错误，例如返回一个空数组或特定错误信息
    }
}
///东方财富-个股人气榜-最新排名
async function stock_hk_hot_rank_latest_em(symbol = "00700") {
    /**
     * 东方财富-个股人气榜-最新排名
     * @param {string} symbol - 带市场表示的证券代码
     * @returns {Promise<Object[]>} 最新排名
     */
    const url = "https://emappdata.eastmoney.com/stockrank/getCurrentHkUsLatest";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        marketType: "000003",
        srcSecurityCode: `HK|${symbol}`,
    };

    try {
        const response = await axios.post(url, payload);
        const result = response.data?.data;
        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个错误响应
    }
}
module.exports = {
    stock_hk_hot_rank_em: stock_hk_hot_rank_em,
    stock_hk_hot_rank_detail_em: stock_hk_hot_rank_detail_em,
    stock_hk_hot_rank_detail_realtime_em: stock_hk_hot_rank_detail_realtime_em,
    stock_hk_hot_rank_latest_em: stock_hk_hot_rank_latest_em,
};