const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-龙虎榜单-龙虎榜详情
async function stock_lhb_detail_em(start_date = "20230403", end_date = "20230417") {
    start_date = [start_date.slice(0, 4), start_date.slice(4, 6), start_date.slice(6)].join('-');
    end_date = [end_date.slice(0, 4), end_date.slice(4, 6), end_date.slice(6)].join('-');
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        sortColumns: "SECURITY_CODE,TRADE_DATE",
        sortTypes: "1,-1",
        pageSize: "5000",
        pageNumber: "1",
        reportName: "RPT_DAILYBILLBOARD_DETAILSNEW",
        columns: "SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,TRADE_DATE,EXPLAIN,CLOSE_PRICE,CHANGE_RATE," +
            "BILLBOARD_NET_AMT,BILLBOARD_BUY_AMT,BILLBOARD_SELL_AMT,BILLBOARD_DEAL_AMT,ACCUM_AMOUNT," +
            "DEAL_NET_RATIO,DEAL_AMOUNT_RATIO,TURNOVERRATE,FREE_MARKET_CAP,EXPLANATION,D1_CLOSE_ADJCHRATE," +
            "D2_CLOSE_ADJCHRATE,D5_CLOSE_ADJCHRATE,D10_CLOSE_ADJCHRATE,SECURITY_TYPE_CODE",
        source: "WEB",
        client: "WEB",
        filter: `(TRADE_DATE<='${end_date}')(TRADE_DATE>='${start_date}')`
    };

    let big_df = [];
    let { data: { result: { pages: total_page_num } } } = await axios.get(url, { params });

    for (let page = 1; page <= total_page_num; page++) {
        params.pageNumber = page.toString();
        let { data: { result: { data: temp_df } } } = await axios.get(url, { params });
        big_df = big_df.concat(temp_df.map(row => ({
            '上榜日': dayjs(row.TRADE_DATE).format('YYYY-MM-DD'),
            '股票代码': row.SECURITY_CODE,
            '股票简称': row.SECURITY_NAME_ABBR,
            '上榜原因': row.EXPLAIN,
            '收盘价': parseFloat(row.CLOSE_PRICE),
            '涨跌幅': parseFloat(row.CHANGE_RATE),
            '龙虎榜净买额': parseFloat(row.BILLBOARD_NET_AMT),
            '龙虎榜买入额': parseFloat(row.BILLBOARD_BUY_AMT),
            '龙虎榜卖出额': parseFloat(row.BILLBOARD_SELL_AMT),
            '龙虎榜成交额': parseFloat(row.BILLBOARD_DEAL_AMT),
            '市场总成交额': parseFloat(row.ACCUM_AMOUNT),
            '净买额占总成交比': parseFloat(row.DEAL_NET_RATIO),
            '成交额占总成交比': parseFloat(row.DEAL_AMOUNT_RATIO),
            '换手率': parseFloat(row.TURNOVERRATE),
            '流通市值': parseFloat(row.FREE_MARKET_CAP),
            '上榜后1日': parseFloat(row.D1_CLOSE_ADJCHRATE),
            '上榜后2日': parseFloat(row.D2_CLOSE_ADJCHRATE),
            '上榜后5日': parseFloat(row.D5_CLOSE_ADJCHRATE),
            '上榜后10日': parseFloat(row.D10_CLOSE_ADJCHRATE)
        }))
        );
    }
    return big_df;
}
///东方财富网-数据中心-龙虎榜单-个股上榜统计
async function stock_lhb_stock_statistic_em(symbol = "近一月") {
    const symbolMap = {
        "近一月": "01",
        "近三月": "02",
        "近六月": "03",
        "近一年": "04",
    };

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "BILLBOARD_TIMES,LATEST_TDATE,SECURITY_CODE",
        sortTypes: "-1,-1,1",
        pageSize: "5000",
        pageNumber: "1",
        reportName: "RPT_BILLBOARD_TRADEALL",
        columns: "ALL",
        source: "WEB",
        client: "WEB",
        filter: `(STATISTICS_CYCLE="${symbolMap[symbol]}")`,
    });

    try {
        const response = await axios.get(url, { params });
        const data = response.data;
        let tempData = data.result.data;

        // 重命名列
        tempData = tempData.map(item => ({
            "代码": item.SECURITY_CODE,
            "最近上榜日": item.LATEST_TDATE,
            "名称": item.SECURITY_NAME_ABBR,
            "近1个月涨跌幅": item.IPCT1M,
            "近3个月涨跌幅": item.IPCT3M,
            "近6个月涨跌幅": item.IPCT6M,
            "近1年涨跌幅": item.IPCT1Y,
            "涨跌幅": item.CHANGE_RATE,
            "收盘价": item.CLOSE_PRICE,
            "阶段": item.PERIOD,
            "龙虎榜总成交额": item.BILLBOARD_DEAL_AMT,
            "龙虎榜净买额": item.BILLBOARD_NET_BUY,
            "机构买入净额": item.ORG_NET_BUY,
            "上榜次数": item.BILLBOARD_TIMES,
            "龙虎榜买入额": item.BILLBOARD_BUY_AMT,
            "龙虎榜卖出额": item.BILLBOARD_SELL_AMT,
            "机构买入总额": item.ORG_BUY_AMT,
            "机构卖出总额": item.ORG_SELL_AMT,
            "买方机构次数": item.ORG_BUY_TIMES,
            "卖方机构次数": item.ORG_SELL_TIMES,
        }));
        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者你可以选择返回一个空数组或者其他错误处理方式
    }
}
///东方财富网-数据中心-龙虎榜单-机构买卖每日统计
async function stock_lhb_jgmmtj_em(start_date = "20240417", end_date = "20240430") {
    start_date = [start_date.slice(0, 4), start_date.slice(4, 6), start_date.slice(6)].join('-');
    end_date = [end_date.slice(0, 4), end_date.slice(4, 6), end_date.slice(6)].join('-');
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "NET_BUY_AMT,TRADE_DATE,SECURITY_CODE",
        sortTypes: "-1,-1,1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_ORGANIZATION_TRADE_DETAILS",
        columns: "ALL",
        source: "WEB",
        client: "WEB",
        filter: `(TRADE_DATE>='${start_date}')(TRADE_DATE<='${end_date}')`
    });

    let big_df = [];
    let total_page;

    try {
        const response = await axios.get(url, { params });
        const data_json = response.data;
        total_page = data_json.result.pages;

        for (let page = 1; page <= total_page; page++) {
            params.set("pageNumber", page.toString());
            const pageResponse = await axios.get(url, { params });
            const pageDataJson = pageResponse.data;
            const temp_df = pageDataJson.result.data;
            big_df = big_df.concat(temp_df.map(item => ({
                '代码': item.SECURITY_CODE,
                '名称': item.SECURITY_NAME_ABBR,
                '收盘价': parseFloat(item.CLOSE_PRICE),
                '涨跌幅': parseFloat(item.CHANGE_RATE),
                '买方机构数': parseInt(item.BUYER_COUNT),
                '卖方机构数': parseInt(item.SELLER_COUNT),
                '机构买入总额': parseFloat(item.BUY_AMT),
                '机构卖出总额': parseFloat(item.SELL_AMT),
                '机构买入净额': parseFloat(item.NET_BUY_AMT),
                '市场总成交额': parseFloat(item.TOTAL_AMOUNT),
                '机构净买额占总成交额比': parseFloat(item.NET_BUY_RATIO),
                '换手率': parseFloat(item.TURNOVER_RATE),
                '流通市值': parseFloat(item.FREE_MARKET_CAP),
                '上榜原因': item.EXPLANATION,
                '上榜日期': dayjs(item.TRADE_DATE).format('YYYY-MM-DD'),
                'D1涨跌幅': parseFloat(item.D1_CLOSE_ADJCHRATE), // D1日涨跌幅
                'D2涨跌幅': parseFloat(item.D2_CLOSE_ADJCHRATE), // D2日涨跌幅
                'D3涨跌幅': parseFloat(item.D3_CLOSE_ADJCHRATE), // D3日涨跌幅
                'D5涨跌幅': parseFloat(item.D5_CLOSE_ADJCHRATE), // D5日涨跌幅
                'D10涨跌幅': parseFloat(item.D10_CLOSE_ADJCHRATE), // D10日涨跌幅
            })));
        }
        return big_df;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
///东方财富网-数据中心-龙虎榜单-机构席位追踪
async function stock_lhb_jgstatistic_em(symbol = "近一年") {
    const symbolMap = {
        "近一月": "01",
        "近三月": "02",
        "近六月": "03",
        "近一年": "04",
    };

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "ONLIST_TIMES,SECURITY_CODE",
        sortTypes: "-1,1",
        pageSize: "5000",
        pageNumber: "1",
        reportName: "RPT_ORGANIZATION_SEATNEW",
        columns: "ALL",
        source: "WEB",
        client: "WEB",
        filter: `(STATISTICSCYCLE="${symbolMap[symbol]}")`,
    });

    let big_df = [];
    try {
        const initialResponse = await axios.get(url, { params: params });
        const totalPages = initialResponse.data.result.pages;

        for (let page = 1; page <= totalPages; page++) {
            params.set("pageNumber", page);
            const response = await axios.get(url, { params: params });
            const tempData = response.data.result.data;
            big_df = big_df.concat(tempData.map(item => ({
                代码: item.SECURITY_CODE,
                名称: item.SECURITY_NAME_ABBR,
                收盘价: parseFloat(item.CLOSE_PRICE),
                涨跌幅: parseFloat(item.CHANGE_RATE),
                龙虎榜成交金额: parseFloat(item.AMOUNT),
                上榜次数: parseInt(item.ONLIST_TIMES),
                机构买入额: parseFloat(item.BUY_AMT),
                机构买入次数: parseInt(item.BUY_TIMES),
                机构卖出额: parseFloat(item.SELL_AMT),
                机构卖出次数: parseInt(item.SELL_TIMES),
                机构净买额: parseFloat(item.NET_BUY_AMT),
                近1个月涨跌幅: parseFloat(item.M1_CLOSE_ADJCHRATE),
                近3个月涨跌幅: parseFloat(item.M3_CLOSE_ADJCHRATE),
                近6个月涨跌幅: parseFloat(item.M6_CLOSE_ADJCHRATE),
                近1年涨跌幅: parseFloat(item.Y1_CLOSE_ADJCHRATE),
                统计周期: item.STATISTICSCYCLE, // 对应 STATISTICSCYCLE
                所属板块: item.BOARD_NAME, // 对应 BOARD_NAME
                板块代码: item.BOARD_CODE, // 对应 BOARD_CODE
            })));
        }
        return big_df;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
    }
}
///东方财富网-数据中心-龙虎榜单-每日活跃营业部
async function stock_lhb_hyyyb_em(start_date = "20220324", end_date = "20220324") {
    start_date = [start_date.slice(0, 4), start_date.slice(4, 6), start_date.slice(6)].join('-');
    end_date = [end_date.slice(0, 4), end_date.slice(4, 6), end_date.slice(6)].join('-');

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "TOTAL_NETAMT,ONLIST_DATE,OPERATEDEPT_CODE",
        sortTypes: "-1,-1,1",
        pageSize: "5000",
        pageNumber: "1",
        reportName: "RPT_OPERATEDEPT_ACTIVE",
        columns: "ALL",
        source: "WEB",
        client: "WEB",
        filter: `(ONLIST_DATE>='${start_date}')(ONLIST_DATE<='${end_date}')`
    });

    try {
        let { data: { result: { pages: total_page } } } = await axios.get(url, { params });
        let big_df = [];

        for (let page = 1; page <= total_page; page++) {
            params.set("pageNumber", page.toString());
            let { data: { result: { data: temp_df } } } = await axios.get(url, { params });
            big_df = big_df.concat(temp_df.map(row => ({
                营业部名称: row.OPERATEDEPT_NAME, // 对应 OPERATEDEPT_NAME
                上榜日: dayjs(row.ONLIST_DATE).format('YYYY-MM-DD'), // 对应 ONLIST_DATE，格式化为 'YYYY-MM-DD'
                买入个股数: parseInt(row.BUYER_APPEAR_NUM), // 对应 BUYER_APPEAR_NUM
                卖出个股数: parseInt(row.SELLER_APPEAR_NUM), // 对应 SELLER_APPEAR_NUM
                买入总金额: parseFloat(row.TOTAL_BUYAMT), // 对应 TOTAL_BUYAMT
                卖出总金额: parseFloat(row.TOTAL_SELLAMT), // 对应 TOTAL_SELLAMT
                总买卖净额: parseFloat(row.TOTAL_NETAMT), // 对应 TOTAL_NETAMT
                买入股票代码: row.BUY_STOCK, // 对应 BUY_STOCK
                机构代码: row.OPERATEDEPT_CODE, // 对应 OPERATEDEPT_CODE
                买入股票名称: row.SECURITY_NAME_ABBR, // 对应 SECURITY_NAME_ABBR
                机构简称: row.ORG_NAME_ABBR // 对应 ORG_NAME_ABBR
            })));
        }
        return big_df;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
///东方财富网-数据中心-龙虎榜单-营业部排行
async function stock_lhb_yybph_em(symbol = "近一月") {
    const symbolMap = {
        "近一月": "01",
        "近三月": "02",
        "近六月": "03",
        "近一年": "04",
    };

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        sortColumns: "TOTAL_BUYER_SALESTIMES_1DAY,OPERATEDEPT_CODE",
        sortTypes: "-1,1",
        pageSize: "5000",
        pageNumber: "1",
        reportName: "RPT_RATEDEPT_RETURNT_RANKING",
        columns: "ALL",
        source: "WEB",
        client: "WEB",
        filter: `(STATISTICSCYCLE="${symbolMap[symbol]}")`,
    };

    let bigData = [];
    const response = await axios.get(url, { params });
    const totalPage = response.data.result.pages;

    for (let page = 1; page <= totalPage; page++) {
        params.pageNumber = page.toString();
        const res = await axios.get(url, { params });
        const tempData = res.data.result.data;
        bigData = bigData.concat(tempData.map((item, index) => ({
            序号: index + 1,
            营业部名称: item.OPERATEDEPT_NAME,
            '上榜后1天-买入次数': parseFloat(item.TOTAL_BUYER_SALESTIMES_1DAY),
            '上榜后1天-平均涨幅': parseFloat(item.AVERAGE_INCREASE_1DAY),
            '上榜后1天-上涨概率': parseFloat(item.RISE_PROBABILITY_1DAY),
            '上榜后2天-买入次数': parseFloat(item.TOTAL_BUYER_SALESTIMES_2DAY),
            '上榜后2天-平均涨幅': parseFloat(item.AVERAGE_INCREASE_2DAY),
            '上榜后2天-上涨概率': parseFloat(item.RISE_PROBABILITY_2DAY),
            '上榜后3天-买入次数': parseFloat(item.TOTAL_BUYER_SALESTIMES_3DAY),
            '上榜后3天-平均涨幅': parseFloat(item.AVERAGE_INCREASE_3DAY),
            '上榜后3天-上涨概率': parseFloat(item.RISE_PROBABILITY_3DAY),
            '上榜后5天-买入次数': parseFloat(item.TOTAL_BUYER_SALESTIMES_5DAY),
            '上榜后5天-平均涨幅': parseFloat(item.AVERAGE_INCREASE_5DAY),
            '上榜后5天-上涨概率': parseFloat(item.RISE_PROBABILITY_5DAY),
            '上榜后10天-买入次数': parseFloat(item.TOTAL_BUYER_SALESTIMES_10DAY),
            '上榜后10天-平均涨幅': parseFloat(item.AVERAGE_INCREASE_10DAY),
            '上榜后10天-上涨概率': parseFloat(item.RISE_PROBABILITY_10DAY),
        })));
    }

    return bigData;
}

// 注意：此函数是异步的，需要通过await调用或者作为Promise处理。
///东方财富网-数据中心-龙虎榜单-营业部统计
async function stock_lhb_traderstatistic_em(symbol = "近一月") {
    const symbolMap = {
        "近一月": "01",
        "近三月": "02",
        "近六月": "03",
        "近一年": "04",
    };

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        sortColumns: "AMOUNT,OPERATEDEPT_CODE",
        sortTypes: "-1,1",
        pageSize: "5000",
        pageNumber: "1",
        reportName: "RPT_OPERATEDEPT_LIST_STATISTICS",
        columns: "ALL",
        source: "WEB",
        client: "WEB",
        filter: `(STATISTICSCYCLE="${symbolMap[symbol]}")`
    };

    try {
        let response = await axios.get(url, { params });
        const totalPage = response.data.result.pages;
        let bigData = [];

        for (let page = 1; page <= totalPage; page++) {
            params.pageNumber = page.toString();
            response = await axios.get(url, { params });
            const tempData = response.data.result.data;
            bigData = bigData.concat(tempData.map((item, index) => ({
                序号: index + 1,
                营业部名称: item.OPERATEDEPT_NAME,
                龙虎榜成交金额: parseFloat(item.AMOUNT),
                上榜次数: parseInt(item.SALES_ONLIST_TIMES),
                买入额: parseFloat(item.ACT_BUY),
                买入次数: parseInt(item.TOTAL_BUYER_SALESTIMES),
                卖出额: parseFloat(item.ACT_SELL),
                卖出次数: parseInt(item.TOTAL_SELLER_SALESTIMES)
            })));
        }
        return bigData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

///东方财富网-数据中心-龙虎榜单-个股龙虎榜详情-日期
async function stock_lhb_stock_detail_date_em(symbol = "600077") {
    /**
     * 东方财富网-数据中心-龙虎榜单-个股龙虎榜详情-日期
     * https://data.eastmoney.com/stock/tradedetail.html
     * @param {string} symbol - 股票代码
     * @returns {Array<Object>} - 个股龙虎榜详情-日期
     */
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        reportName: "RPT_LHB_BOARDDATE",
        columns: "SECURITY_CODE,TRADE_DATE,TR_DATE",
        filter: `(SECURITY_CODE="${symbol}")`,
        pageNumber: "1",
        pageSize: "1000",
        sortTypes: "-1",
        sortColumns: "TRADE_DATE",
        source: "WEB",
        client: "WEB"
    });

    try {
        const response = await axios.get(url, { params });
        const data = response.data.result.data;

        // 处理数据
        let tempData = data.map((item, index) => ({
            序号: index + 1,
            股票代码: item.SECURITY_CODE,
            交易日: dayjs(item.TRADE_DATE).format('YYYY-MM-DD')
        }));

        return tempData;
    } catch (error) {
        console.error(`请求失败: ${error.message}`);
        throw error;
    }
}
///东方财富网-数据中心-龙虎榜单-个股龙虎榜详情
async function stock_lhb_stock_detail_em(symbol = "000788", date = "20220315", flag = "买入") {
    const flagMap = {
        "买入": "BUY",
        "卖出": "SELL"
    };
    const reportMap = {
        "买入": "RPT_BILLBOARD_DAILYDETAILSBUY",
        "卖出": "RPT_BILLBOARD_DAILYDETAILSSELL"
    };

    const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        reportName: reportMap[flag],
        columns: "ALL",
        filter: `(TRADE_DATE='${formattedDate}')(SECURITY_CODE="${symbol}")`,
        pageNumber: "1",
        pageSize: "500",
        sortTypes: "-1",
        sortColumns: flagMap[flag],
        source: "WEB",
        client: "WEB",
        _: "1647338693644"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.result.data;

        tempData = tempData.map(item => ({
            股票代码: item.SECURITY_CODE, // 对应 SECURITY_CODE
            交易日期: dayjs(item.TRADE_DATE).format('YYYY-MM-DD'), // 对应 TRADE_DATE，格式化为 'YYYY-MM-DD'
            SECU代码: item.SECUCODE, // 对应 SECUCODE
            机构代码: item.OPERATEDEPT_CODE, // 对应 OPERATEDEPT_CODE
            机构名称: item.OPERATEDEPT_NAME, // 对应 OPERATEDEPT_NAME
            上榜原因: item.EXPLANATION, // 对应 EXPLANATION
            涨跌幅: parseFloat(item.CHANGE_RATE), // 对应 CHANGE_RATE
            收盘价: parseFloat(item.CLOSE_PRICE), // 对应 CLOSE_PRICE
            累计成交金额: parseFloat(item.ACCUM_AMOUNT), // 对应 ACCUM_AMOUNT
            累计成交量: parseFloat(item.ACCUM_VOLUME), // 对应 ACCUM_VOLUME
            买入金额: parseFloat(item.BUY), // 对应 BUY
            卖出金额: parseFloat(item.SELL), // 对应 SELL
            净买金额: parseFloat(item.NET), // 对应 NET
            "3日上涨概率": parseFloat(item.RISE_PROBABILITY_3DAY), // 对应 RISE_PROBABILITY_3DAY
            "3日买入营业次数": parseInt(item.TOTAL_BUYER_SALESTIMES_3DAY), // 对应 TOTAL_BUYER_SALESTIMES_3DAY
            涨跌类型: item.CHANGE_TYPE, // 对应 CHANGE_TYPE
            买入比例: parseFloat(item.TOTAL_BUYRIO), // 对应 TOTAL_BUYRIO
            卖出比例: parseFloat(item.TOTAL_SELLRIO), // 对应 TOTAL_SELLRIO
            交易ID: item.TRADE_ID // 对应 TRADE_ID
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_lhb_detail_em: stock_lhb_detail_em,
    stock_lhb_stock_statistic_em: stock_lhb_stock_statistic_em,
    stock_lhb_jgmmtj_em: stock_lhb_jgmmtj_em,
    stock_lhb_jgstatistic_em: stock_lhb_jgstatistic_em,
    stock_lhb_hyyyb_em: stock_lhb_hyyyb_em,
    stock_lhb_yybph_em: stock_lhb_yybph_em,
    stock_lhb_traderstatistic_em: stock_lhb_traderstatistic_em,
    stock_lhb_stock_detail_date_em: stock_lhb_stock_detail_date_em,
    stock_lhb_stock_detail_em: stock_lhb_stock_detail_em,
};