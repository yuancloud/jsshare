const axios = require('axios');
const _ = require('lodash');
///融资融券-标的证券名单及保证金比例查询
async function stock_margin_ratio_pa(date = "20231013") {
    /**
     * 融资融券-标的证券名单及保证金比例查询
     * @param {string} date - 交易日期
     * @returns {Object[]} 返回包含标的证券名单及保证金比例的数据
     */
    const url = "https://stock.pingan.com/fss/servlet/fsscoreapp/stockSource/mrgRatio";
    const payload = {
        currentPage: 1,
        pageSize: 50000,
        type: "bdzq",
        setdate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`,
        stockMes: "",
        market: "00",
        appName: "AYLCH5",
        tokenId: "",
        appChannel: "LRSP",
        requestId: "194055910e2075c03e25fabf6ffc5a7f",
        channel: "pa18",
    };

    try {
        const response = await axios.post(url, payload);
        const dataJson = response.data?.data.list || [];
        tempArray = dataJson.map(item => ({
            '证券代码': item.secuCode,
            '证券简称': item.secuName,
            '融资比例': parseFloat(item.fiMarginRatio),
            '融券比例': parseFloat(item.slMarginRatio)
        }));

        return tempArray;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
///上海证券交易所-融资融券数据-融资融券汇总
async function stock_margin_sse(start_date = "20010106", end_date = "20230922") {
    /**
     * 获取上海证券交易所-融资融券数据-融资融券汇总
     * @param {string} start_date - 交易开始日期
     * @param {string} end_date - 交易结束日期
     * @returns {Promise<Array>} - 融资融券汇总
     */
    const url = "https://query.sse.com.cn/marketdata/tradedata/queryMargin.do";
    const params = new URLSearchParams({
        isPagination: "true",
        beginDate: start_date,
        endDate: end_date,
        tabType: "",
        stockCode: "",
        "pageHelp.pageSize": "5000",
        "pageHelp.pageNo": "1",
        "pageHelp.beginPage": "1",
        "pageHelp.cacheSize": "1",
        "pageHelp.endPage": "5",
        _: "1612773448860"
    });
    const headers = {
        Referer: "https://www.sse.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { params, headers });
        const dataJson = response.data?.result;
        let tempData = dataJson.map((item) => ({
            "信用交易日期": item.opDate,
            "融券卖出量": item.rqmcl,
            "融券余量": item.rqyl,
            "融券余量金额": item.rqylje,
            "融资买入额": item.rzmre,
            "融资融券余额": item.rzrqjyzl,
            "融资余额": item.rzye,
        }));

        let result = tempData.filter((row) => row['融资余额'] !== null);
        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

///上海证券交易所-融资融券数据-融资融券明细
async function stock_margin_detail_sse(date = "20230922") {
    const url = "https://query.sse.com.cn/marketdata/tradedata/queryMargin.do";
    const params = new URLSearchParams({
        isPagination: "true",
        tabType: "mxtype",
        detailsDate: date,
        stockCode: "",
        beginDate: "",
        endDate: "",
        "pageHelp.pageSize": "5000",
        "pageHelp.pageCount": "50",
        "pageHelp.pageNo": "1",
        "pageHelp.beginPage": "1",
        "pageHelp.cacheSize": "1",
        "pageHelp.endPage": "21",
        _: "1612773448860"
    });
    const headers = {
        Referer: "https://www.sse.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { params, headers });
        const dataJson = response.data?.result;
        // 筛选并转换数值
        const result = dataJson.map(item => ({
            "信用交易日期": item.opDate,
            "融券偿还量": item.rqchl,
            "融券卖出量": item.rqmcl,
            "融券余量": item.rqyl,
            "融资偿还额": item.rzche,
            "融资买入额": item.rzmre,
            "融资余额": item.rzye,
            "标的证券简称": item.securityAbbr,
            "标的证券代码": item.stockCode,
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_margin_ratio_pa: stock_margin_ratio_pa,
    stock_margin_sse: stock_margin_sse,
    stock_margin_detail_sse: stock_margin_detail_sse,
};