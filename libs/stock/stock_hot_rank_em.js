const axios = require('axios');
const dayjs = require('dayjs');
///东方财富-个股人气榜-人气榜
async function stock_hot_rank_em() {
    const url = "https://emappdata.eastmoney.com/stockrank/getAllCurrentList";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        marketType: "",
        pageNo: 1,
        pageSize: 100,
    };

    try {
        let response = await axios.post(url, payload);
        let records_rank = response.data.data;

        const secids = records_rank.map(row => {
            let item = row.sc;
            return (item.includes("SZ") ? "0" : "1") + "." + item.substring(2);
        }).join(",") + "?v=08926209912590994";
        const params = {
            ut: "f057cbcbce2a86e2866ab8877db1d059",
            fltt: "2",
            invt: "2",
            fields: "f14,f3,f12,f2",
            secids: secids,
        };

        const secondUrl = "https://push2.eastmoney.com/api/qt/ulist.np/get";
        response = await axios.get(secondUrl, { params: params });
        let records = response.data?.data.diff;
        let result = records.map((record, index) => ({
            "最新价": record.f2,
            "涨跌幅": record.f3,
            "涨跌额": record.f2 * record.f3 / 100,
            "代码": record.f12,
            "当前排名": records_rank.find(f => f.sc.endsWith(record.f12)).rk,
            "股票名称": record.f14,
        }))
        return result;
    } catch (error) {
        console.error(error);
    }
}
///东方财富-个股人气榜-历史趋势及粉丝特征
async function stock_hot_rank_detail_em(symbol = "SZ000665") {
    /**
     * 东方财富-个股人气榜-历史趋势及粉丝特征
     * @param {string} symbol - 带市场表示的证券代码
     * @returns {Promise<Array>} 返回个股的历史趋势及粉丝特征
     */
    const urlRank = "https://emappdata.eastmoney.com/stockrank/getHisList";
    const urlFollow = "https://emappdata.eastmoney.com/stockrank/getHisProfileList";

    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        marketType: "",
        srcSecurityCode: symbol,
    };

    try {
        const rankResponse = await axios.post(urlRank, payload);
        const followResponse = await axios.post(urlFollow, payload);
        let records_follow = followResponse.data.data;
        let result = rankResponse.data.data.map(item => ({
            时间: item.calcTime?.replace(/-/g, ''),
            排名: item.rank,
            证券代码: symbol,
            新晋粉丝: parseFloat(parseFloat(records_follow.find(f => f.calcTime.startsWith(item.calcTime)).newUidRate.replace("%", "") / 100).toFixed(4)),
            铁杆粉丝: parseFloat(parseFloat(records_follow.find(f => f.calcTime.startsWith(item.calcTime)).oldUidRate.replace("%", "") / 100).toFixed(4)),
        }));
        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需求处理错误
    }
}
///东方财富-个股人气榜-实时变动
async function stock_hot_rank_detail_realtime_em(symbol = "SZ000665") {
    /**
     * 东方财富-个股人气榜-实时变动
     * @param {string} symbol - 带市场表示的证券代码
     * @returns {Promise<Array>} - 返回包含实时变动信息的对象数组
     */
    const url = "https://emappdata.eastmoney.com/stockrank/getCurrentList";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        marketType: "",
        srcSecurityCode: symbol,
    };

    try {
        const response = await axios.post(url, payload);
        const dataJson = response.data;
        // 将数据转换成所需格式
        const tempData = dataJson.data.map(item => ({
            时间: item.calcTime, // 假设原始JSON中的时间字段名为time，请根据实际情况调整
            排名: item.rank  // 假设原始JSON中的排名字段名为rank，请根据实际情况调整
        }));
        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个错误对象给调用者处理
    }
}
///东方财富-个股人气榜-热门关键词
async function stock_hot_keyword_em(symbol = "SZ000665") {
    /**
     * 东方财富-个股人气榜-热门关键词
     * @param {string} symbol - 带市场表示的证券代码
     * @returns {Promise<Array>} - 热门关键词列表
     */
    const url = "https://emappdata.eastmoney.com/stockrank/getHotStockRankList";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        srcSecurityCode: symbol,
    };

    try {
        const response = await axios.post(url, payload);
        const records = response.data?.data;
        const tempArray = records.map(item => ({
            时间: dayjs(item.calcTime).format("YYYYMMDD"),
            股票代码: item.srcSecurityCode,
            概念名称: item.conceptName,
            概念代码: item.conceptId,
            热度: item.hitCount,
        }));
        return tempArray;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个空数组、错误信息等，根据需求调整
    }
}
///东方财富-个股人气榜-最新排名
async function stock_hot_rank_latest_em(symbol = "SZ000665") {
    /**
     * 东方财富-个股人气榜-最新排名
     * https://guba.eastmoney.com/rank/stock?code=000665
     * @param {string} symbol - 带市场表示的证券代码
     * @returns {Promise<Object[]>} 最新排名
     */
    const url = "https://emappdata.eastmoney.com/stockrank/getCurrentLatest";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        marketType: "",
        srcSecurityCode: symbol,
    };

    try {
        const response = await axios.post(url, payload);
        return response.data?.data;

    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需要进行错误处理
    }
}

///东方财富-个股人气榜-相关股票
async function stock_hot_rank_relate_em(symbol = "SZ000665") {
    /**
     * 东方财富-个股人气榜-相关股票
     * @param {string} symbol - 带市场表示的证券代码
     * @returns {Promise<Array>} - 相关股票信息数组
     */
    const url = "https://emappdata.eastmoney.com/stockrank/getFollowStockRankList";
    const payload = {
        appId: "appId01",
        globalId: "786e4c21-70dc-435a-93bb-38",
        srcSecurityCode: symbol,
    };

    try {
        const response = await axios.post(url, payload);
        const records = response.data?.data;
        let result = records.map(item => ({
            时间: dayjs(item.calcTime).format('YYYYMMDD'),
            股票代码: item.innerCode,
            相关股票代码: item.followSrcSecurityCode,
            涨跌幅: parseFloat(item.rate.replace('%', ''))
        }));
        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据实际情况处理错误
    }
}
module.exports = {
    stock_hot_rank_em: stock_hot_rank_em,
    stock_hot_rank_detail_em: stock_hot_rank_detail_em,
    stock_hot_rank_detail_realtime_em: stock_hot_rank_detail_realtime_em,
    stock_hot_keyword_em: stock_hot_keyword_em,
    stock_hot_rank_latest_em: stock_hot_rank_latest_em,
    stock_hot_rank_relate_em: stock_hot_rank_relate_em,
};