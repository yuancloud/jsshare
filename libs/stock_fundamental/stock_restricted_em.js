const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-特色数据-限售股解禁

async function stockRestrictedReleaseSummaryEm(symbol = "全部股票", startDate = "20221101", endDate = "20221209") {
    const symbolMap = {
        "全部股票": "000300",
        "沪市A股": "000001",
        "科创板": "000688",
        "深市A股": "399001",
        "创业板": "399001",
        "京市A股": "999999",
    };

    const start_date_str = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6)}`;
    const end_date_str = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6)}`;

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "FREE_DATE",
        sortTypes: "1",
        pageSize: "500",
        pageNumber: "1",
        columns: "ALL",
        quoteColumns: "f2~03~INDEX_CODE,f3~03~INDEX_CODE,f124~03~INDEX_CODE",
        quoteType: "0",
        source: "WEB",
        client: "WEB",
        filter: `(INDEX_CODE="${symbolMap[symbol]}")(FREE_DATE>=${start_date_str})(FREE_DATE<=${end_date_str})`,
        reportName: "RPT_LIFTDAY_STA",
    });

    try {
        const response = await axios.get(url, { params });
        const data = response.data.result.data;
        let tempData = data.map((item, index) => ({
            "序号": index + 1,
            "解禁时间": item.FREE_DATE,
            "当日解禁股票家数": item.RELEASE_COUNT,
            "实际解禁数量": item.ACTUAL_RELEASE_AMOUNT,
            "实际解禁市值": item.ACTUAL_RELEASE_MARKET_VALUE,
            "沪深300指数": item.INDEX_CLOSE,
            "沪深300指数涨跌幅": item.INDEX_CHANGE_PERCENT,
            "解禁数量": item.RELEASE_AMOUNT,
        }));

        // 数据转换
        tempData = tempData.map(item => ({
            ...item,
            "解禁时间": dayjs(item["解禁时间"]).toDate(),
            "当日解禁股票家数": Number(item["当日解禁股票家数"]) || 0,
            "解禁数量": (Number(item["解禁数量"]) * 10000) || 0,
            "实际解禁数量": (Number(item["实际解禁数量"]) * 10000) || 0,
            "实际解禁市值": (Number(item["实际解禁市值"]) * 10000) || 0,
            "沪深300指数": Number(item["沪深300指数"]) || 0,
            "沪深300指数涨跌幅": Number(item["沪深300指数涨跌幅"]) || 0,
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///东方财富网-数据中心-限售股解禁-解禁详情一览

async function stockRestrictedReleaseDetailEm(start_date = "20221202", end_date = "20241202") {
    const formatDate = (dateStr) => `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6)}`;
    start_date = formatDate(start_date);
    end_date = formatDate(end_date);

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "FREE_DATE,CURRENT_FREE_SHARES",
        sortTypes: "1,1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_LIFT_STAGE",
        columns: "SECURITY_CODE,SECURITY_NAME_ABBR,FREE_DATE,CURRENT_FREE_SHARES,ABLE_FREE_SHARES,LIFT_MARKET_CAP,FREE_RATIO,NEW,B20_ADJCHRATE,A20_ADJCHRATE,FREE_SHARES_TYPE,TOTAL_RATIO,NON_FREE_SHARES,BATCH_HOLDER_NUM",
        source: "WEB",
        client: "WEB",
        filter: `(FREE_DATE>='${start_date}')(FREE_DATE<='${end_date}')`
    });

    let big_df = [];
    let page = 1;
    while (true) {
        params.set("pageNumber", page.toString());
        const response = await axios.get(url, { params: params.toString() });
        const data_json = response.data;
        if (!data_json.result || !data_json.result.data) break;
        const temp_df = data_json.result.data;
        big_df = big_df.concat(temp_df);
        if (page >= data_json.result.pages) break;
        page++;
    }

    big_df = big_df.map((row, index) => ({
        序号: index + 1,
        股票代码: row.SECURITY_CODE,
        股票简称: row.SECURITY_NAME_ABBR,
        解禁时间: dayjs(row.FREE_DATE).format('YYYY-MM-DD'),
        限售股类型: row.FREE_SHARES_TYPE,
        解禁数量: parseFloat(row.ABLE_FREE_SHARES) * 10000,
        实际解禁数量: parseFloat(row.CURRENT_FREE_SHARES) * 10000,
        实际解禁市值: parseFloat(row.LIFT_MARKET_CAP) * 10000,
        占解禁前流通市值比例: parseFloat(row.FREE_RATIO),
        解禁前一交易日收盘价: parseFloat(row.NEW),
        解禁前20日涨跌幅: parseFloat(row.B20_ADJCHRATE),
        解禁后20日涨跌幅: parseFloat(row.A20_ADJCHRATE)
    }));

    return big_df;
}
///东方财富网-数据中心-个股限售解禁-解禁批次

async function stockRestrictedReleaseQueueEm(symbol = "600000") {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "FREE_DATE",
        sortTypes: "-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_LIFT_STAGE",
        filter: `(SECURITY_CODE="${symbol}")`,
        columns: "SECURITY_CODE,SECURITY_NAME_ABBR,FREE_DATE,CURRENT_FREE_SHARES,ABLE_FREE_SHARES,LIFT_MARKET_CAP,FREE_RATIO,NEW,B20_ADJCHRATE,A20_ADJCHRATE,FREE_SHARES_TYPE,TOTAL_RATIO,NON_FREE_SHARES,BATCH_HOLDER_NUM",
        source: "WEB",
        client: "WEB"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        if (!dataJson.result) {
            return [];
        }
        let tempData = dataJson.result.data.map((item, index) => ({
            序号: index + 1,
            解禁时间: dayjs(item.FREE_DATE).toDate(),
            解禁股东数: Number(item.BATCH_HOLDER_NUM),
            解禁数量: (Number(item.ABLE_FREE_SHARES) || 0) * 10000,
            实际解禁数量: (Number(item.CURRENT_FREE_SHARES) || 0) * 10000,
            未解禁数量: (Number(item.NON_FREE_SHARES) || 0) * 10000,
            实际解禁数量市值: (Number(item.LIFT_MARKET_CAP) || 0) * 10000,
            占总市值比例: Number(item.TOTAL_RATIO) || 0,
            占流通市值比例: Number(item.FREE_RATIO) || 0,
            解禁前一交易日收盘价: Number(item.NEW) || 0,
            限售股类型: item.FREE_SHARES_TYPE,
            解禁前20日涨跌幅: Number(item.B20_ADJCHRATE) || 0,
            解禁后20日涨跌幅: Number(item.A20_ADJCHRATE) || 0,
        }));

        // 只保留需要的列
        tempData = tempData.map(item => ({
            序号: item.序号,
            解禁时间: item.解禁时间,
            解禁股东数: item.解禁股东数,
            解禁数量: item.解禁数量,
            实际解禁数量: item.实际解禁数量,
            未解禁数量: item.未解禁数量,
            实际解禁数量市值: item.实际解禁数量市值,
            占总市值比例: item.占总市值比例,
            占流通市值比例: item.占流通市值比例,
            解禁前一交易日收盘价: item.解禁前一交易日收盘价,
            限售股类型: item.限售股类型,
            解禁前20日涨跌幅: item.解禁前20日涨跌幅,
            解禁后20日涨跌幅: item.解禁后20日涨跌幅,
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}
///东方财富网-数据中心-个股限售解禁-解禁股东

async function stockRestrictedReleaseStockholderEm(symbol = '600000', date = '20200904') {
    /**
     * 东方财富网-数据中心-个股限售解禁-解禁股东
     * https://data.eastmoney.com/dxf/q/600000.html
     * @param {string} symbol - 股票代码
     * @param {string} date - 日期; 通过 ak.stock_restricted_release_queue_em(symbol="600000") 获取
     * @return {Promise<Object[]>} 个股限售解禁信息
     */
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const dateStr = [date.slice(0, 4), date.slice(4, 6), date.slice(6)].join('-');
    const params = new URLSearchParams({
        sortColumns: "ADD_LISTING_SHARES",
        sortTypes: "-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_LIFT_GD",
        filter: `(SECURITY_CODE="${symbol}")(FREE_DATE='${dateStr}')`,
        columns: "LIMITED_HOLDER_NAME,ADD_LISTING_SHARES,ACTUAL_LISTED_SHARES,ADD_LISTING_CAP,LOCK_MONTH,RESIDUAL_LIMITED_SHARES,FREE_SHARES_TYPE,PLAN_FEATURE",
        source: "WEB",
        client: "WEB"
    });

    try {
        const response = await axios.get(url, { params });
        const data = response.data.result.data;
        
        // 对数据进行处理
        const tempData = data.map((item, index) => ({
            序号: index + 1,
            股东名称: item.LIMITED_HOLDER_NAME,
            解禁数量: parseFloat(item.ADD_LISTING_SHARES) || null,
            实际解禁数量: parseFloat(item.ACTUAL_LISTED_SHARES) || null,
            解禁市值: parseFloat(item.ADD_LISTING_CAP) || null,
            锁定期: parseFloat(item.LOCK_MONTH) || null,
            剩余未解禁数量: parseFloat(item.RESIDUAL_LIMITED_SHARES) || null,
            限售股类型: item.FREE_SHARES_TYPE,
            进度: item.PLAN_FEATURE
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_restricted_release_summary_em : stock_restricted_release_summary_em,
    stock_restricted_release_detail_em : stock_restricted_release_detail_em,
    stock_restricted_release_queue_em : stock_restricted_release_queue_em,
    stock_restricted_release_stockholder_em : stock_restricted_release_stockholder_em,
};