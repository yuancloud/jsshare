const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///申万宏源研究-指数发布-指数详情-指数历史数据

async function index_hist_sw(symbol = "801030", period = "day") {
    /**
     * 申万宏源研究-指数发布-指数详情-指数历史数据
     * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex/releasedetail?code=801001&name=%E7%94%B3%E4%B8%8750
     * @param {string} symbol - 指数代码
     * @param {string} period - 时间周期，可选值为{"day", "week", "month"}
     * @returns {Promise<Array>} - 指数历史数据
     */
    const periodMap = {
        "day": "DAY",
        "week": "WEEK",
        "month": "MONTH",
    };

    const url = "https://www.swsresearch.com/institute-sw/api/index_publish/trend/";
    const params = new URLSearchParams({
        swindexcode: symbol,
        period: periodMap[period],
    });
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    };

    try {
        const response = await axios.get(url, { params, headers, httpsAgent: new (require('https').Agent({ rejectUnauthorized: false }))() });
        const dataJson = response.data;
        let tempData = dataJson.data.map(item => ({
            代码: item.swindexcode,
            日期: dayjs(item.bargaindate).format('YYYY-MM-DD'),
            收盘: parseFloat(item.closeindex),
            开盘: parseFloat(item.openindex),
            最高: parseFloat(item.maxindex),
            最低: parseFloat(item.minindex),
            成交量: parseFloat(item.bargainamount),
            成交额: parseFloat(item.bargainsum),
        }));

        // 只保留需要的字段
        tempData = tempData.map(({ 代码, 日期, 收盘, 开盘, 最高, 最低, 成交量, 成交额 }) => ({
            代码, 日期, 收盘, 开盘, 最高, 最低, 成交量, 成交额
        }));

        return tempData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
///申万宏源研究-指数发布-指数详情-指数分时数据

async function index_min_sw(symbol = "801001") {
    /**
     * 申万宏源研究-指数发布-指数详情-指数分时数据
     * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex/releasedetail?code=801001&name=%E7%94%B3%E4%B8%8750
     * @param {string} symbol - 指数代码
     * @return {Array<Object>} - 指数分时数据
     */
    const url = "https://www.swsresearch.com/institute-sw/api/index_publish/details/timelines/";
    const params = {
        swindexcode: symbol,
    };
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { params, headers, httpsAgent: new (require('https').Agent({ rejectUnauthorized: false }))() });
        const dataJson = response.data;
        let tempDf = _.map(dataJson.data, item => ({
            代码: item.l1,
            名称: item.l2,
            价格: item.l8,
            日期: dayjs(item.trading_date).format('YYYY-MM-DD'),
            时间: item.trading_time
        }));

        // 确保价格是数值类型
        tempDf = _.map(tempDf, item => ({
            ...item,
            价格: _.toNumber(item.价格)
        }));

        return tempDf;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
///申万宏源研究-指数发布-指数详情-成分股

async function indexComponentSw(symbol = "801001") {
    /**
     * 申万宏源研究-指数发布-指数详情-成分股
     * @param {string} symbol - 指数代码
     * @return {Array<Object>} 成分股列表
     */
    const url = "https://www.swsresearch.com/institute-sw/api/index_publish/details/component_stocks/";
    const params = new URLSearchParams({
        swindexcode: symbol,
        page: "1",
        page_size: "10000"
    });
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { params, headers, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        const dataJson = response.data;
        let tempDf = dataJson.data.results.map((item, index) => ({
            序号: index + 1,
            证券代码: item.stockcode,
            证券名称: item.stockname,
            最新权重: parseFloat(item.newweight),
            计入日期: dayjs(item.beginningdate).toDate()
        }));

        // 确保最新权重是数值类型
        tempDf.forEach(item => {
            if (isNaN(item.最新权重)) {
                item.最新权重 = null;
            }
        });

        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///申万宏源研究-申万指数-股票指数

async function __index_realtime_sw(symbol = "大类风格指数") {
    /**
     * 申万宏源研究-申万指数-股票指数
     * https://www.swsresearch.com/institute_sw/allIndex/releasedIndex
     * @param {string} symbol - choice of {"大类风格指数", "金创指数"}
     * @returns {Promise<Array>} 指数系列实时行情数据
     */
    const url = "https://www.swsresearch.com/insWechatSw/dflgOrJcIndex/pageList";
    const payload = {
        pageNo: 1,
        pageSize: 10,
        indexTypeName: symbol,
        sortField: "",
        rule: "",
        indexType: 1,
    };
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    };

    try {
        const response = await axios.post(url, payload, { headers, httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });
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

        // 只选择需要的列
        tempData = tempData.map(item => _.pick(item, ["指数代码", "指数名称", "昨收盘", "日涨跌幅", "年涨跌幅"]));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///申万宏源研究-指数系列
// 假设 __index_realtime_sw 是一个已经定义好的函数
// const __index_realtimesw = require('./__index_realtime_sw'); // 根据实际情况调整路径

async function indexRealtimeSw(symbol = "二级行业") {
    /**
     * 申万宏源研究-指数系列
     * @param {string} symbol - {"市场表征", "一级行业", "二级行业", "风格指数", "大类风格指数", "金创指数"}
     * @returns {Object[]} 指数系列实时行情数据
     */
    if (["大类风格指数", "金创指数"].includes(symbol)) {
        return await __index_realtime_sw(symbol); // 假设这个函数存在
    }

    const url = "https://www.swsresearch.com/institute-sw/api/index_publish/current/";
    const params = new URLSearchParams({
        page: "1",
        page_size: "50",
        indextype: symbol
    });
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    };
    
    try {
        let response = await axios.get(url, { params, headers, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        const dataJson = response.data;
        const totalNum = dataJson.data.count;
        const totalPages = Math.ceil(totalNum / 50);
        let bigDf = [];

        for (let page = 1; page <= totalPages; page++) {
            params.set("page", page.toString());
            response = await axios.get(url, { params, headers, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
            const tempDf = response.data.data.results;
            bigDf = bigDf.concat(tempDf);
        }

        bigDf = bigDf.map(item => ({
            "指数代码": item.index_code,
            "指数名称": item.index_name,
            "昨收盘": parseFloat(item.yesterday_close) || null,
            "今开盘": parseFloat(item.today_open) || null,
            "最新价": parseFloat(item.latest_price) || null,
            "成交额": parseFloat(item.turnover) || null,
            "成交量": parseInt(item.volume) || null,
            "最高价": parseFloat(item.highest_price) || null,
            "最低价": parseFloat(item.lowest_price) || null
        }));

        return _.sortBy(bigDf, ["指数代码"]);
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}

// 注意：在实际应用中，你需要根据API返回的实际字段名调整上述代码中的映射。
///申万宏源研究-指数分析

async function index_analysis_daily_sw(symbol = "市场表征", start_date = "20221103", end_date = "20221103") {
    const url = "https://www.swsresearch.com/institute-sw/api/index_analysis/index_analysis_report/";
    const params = {
        page: "1",
        page_size: "50",
        index_type: symbol,
        start_date: [start_date.slice(0, 4), start_date.slice(4, 6), start_date.slice(6)].join('-'),
        end_date: [end_date.slice(0, 4), end_date.slice(4, 6), end_date.slice(6)].join('-'),
        type: "DAY",
        swindexcode: "all"
    };
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    };

    let big_df = [];
    try {
        const response = await axios.get(url, { params, headers, httpsAgent: new (require('https').Agent({ rejectUnauthorized: false }))() });
        const data_json = response.data;
        const total_num = data_json.data.count;
        const total_page = Math.ceil(total_num / 50);

        for (let page = 1; page <= total_page; page++) {
            params.page = page.toString();
            const pageResponse = await axios.get(url, { params, headers, httpsAgent: new (require('https').Agent({ rejectUnauthorized: false }))() });
            const pageDataJson = pageResponse.data;
            const temp_df = pageDataJson.data.results;

            // 将当前页的数据添加到big_df中
            big_df = big_df.concat(temp_df);
        }

        // 重命名列
        big_df = big_df.map(row => ({
            "指数代码": row.swindexcode,
            "指数名称": row.swindexname,
            "发布日期": row.bargaindate,
            "收盘指数": row.closeindex,
            "成交量": row.bargainamount,
            "涨跌幅": row.markup,
            "换手率": row.turnoverrate,
            "市盈率": row.pe,
            "市净率": row.pb,
            "均价": row.meanprice,
            "成交额占比": row.bargainsumrate,
            "流通市值": row.negotiablessharesum1,
            "平均流通市值": row.negotiablessharesum2,
            "股息率": row.dp
        }));

        // 处理日期和数值
        big_df = big_df.map(row => ({
            ...row,
            "发布日期": dayjs(row["发布日期"], "YYYY-MM-DD").toDate(),
            "收盘指数": _.toNumber(row["收盘指数"]),
            "成交量": _.toNumber(row["成交量"]),
            "涨跌幅": _.toNumber(row["涨跌幅"]),
            "换手率": _.toNumber(row["换手率"]),
            "市盈率": _.toNumber(row["市盈率"]),
            "市净率": _.toNumber(row["市净率"]),
            "均价": _.toNumber(row["均价"]),
            "成交额占比": _.toNumber(row["成交额占比"]),
            "流通市值": _.toNumber(row["流通市值"]),
            "平均流通市值": _.toNumber(row["平均流通市值"]),
            "股息率": _.toNumber(row["股息率"])
        }));

        // 按照发布日期排序
        big_df.sort((a, b) => a["发布日期"] - b["发布日期"]);
    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }

    return big_df;
}
///申万宏源研究-周/月报表-日期序列

async function index_analysis_week_month_sw(symbol = "month") {
    /**
     * 申万宏源研究-周/月报表-日期序列
     * https://www.swsresearch.com/institute_sw/allIndex/analysisIndex
     * @param {string} symbol - choice of {"week", "month"}
     * @returns {Array<Object>} 日期序列
     */
    const url = "https://www.swsresearch.com/institute-sw/api/index_analysis/week_month_datetime/";
    const params = { type: symbol.toUpperCase() };
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { params, headers, httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        const dataJson = response.data;
        let tempData = dataJson.data.map(item => ({
            date: dayjs(item.bargaindate).toDate().toISOString().split('T')[0]
        }));

        // 按日期排序
        tempData.sort((a, b) => new Date(a.date) - new Date(b.date));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///申万宏源研究-指数分析-周报告

async function index_analysis_weekly_sw(symbol = "市场表征", date = "20221104") {
    const url = "https://www.swsresearch.com/institute-sw/api/index_analysis/index_analysis_reports/";
    const params = {
        page: "1",
        page_size: "50",
        index_type: symbol,
        bargaindate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`,
        type: "WEEK",
        swindexcode: "all"
    };
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    };

    let big_df = [];
    try {
        const response = await axios.get(url, { params, headers, httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });
        const total_num = response.data.data.count;
        const total_page = Math.ceil(total_num / 50);

        for (let page = 1; page <= total_page; page++) {
            params.page = String(page);
            const pageResponse = await axios.get(url, { params, headers, httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });
            const temp_df = pageResponse.data.data.results;
            big_df = big_df.concat(temp_df);
        }

        // Renaming columns
        big_df = _.map(big_df, item => ({
            '指数代码': item.swindexcode,
            '指数名称': item.swindexname,
            '发布日期': item.bargaindate,
            '收盘指数': parseFloat(item.closeindex),
            '成交量': parseFloat(item.bargainamount),
            '涨跌幅': parseFloat(item.markup),
            '换手率': parseFloat(item.turnoverrate),
            '市盈率': parseFloat(item.pe),
            '市净率': parseFloat(item.pb),
            '均价': parseFloat(item.meanprice),
            '成交额占比': parseFloat(item.bargainsumrate),
            '流通市值': parseFloat(item.negotiablessharesum1),
            '平均流通市值': parseFloat(item.negotiablessharesum2),
            '股息率': parseFloat(item.dp)
        }));

        // Converting and formatting dates
        big_df = _.map(big_df, item => ({
            ...item,
            '发布日期': dayjs(item['发布日期']).toDate()
        }));

        // Sorting by '发布日期'
        big_df = _.orderBy(big_df, ['发布日期'], ['asc']);
    } catch (error) {
        console.error("Error fetching data:", error);
    }

    return big_df;
}
///申万宏源研究-指数分析-月报告

async function indexAnalysisMonthlySw(symbol = '市场表征', date = '20221031') {
    /**
     * 申万宏源研究-指数分析-月报告
     * https://www.swsresearch.com/institute_sw/allIndex/analysisIndex
     * @param {string} symbol - {"市场表征", "一级行业", "二级行业", "风格指数"}
     * @param {string} date - 查询日期; 通过调用 ak.index_analysis_week_month_sw() 接口获取
     * @returns {Promise<Array>} - 指数分析
     */
    const url = 'https://www.swsresearch.com/institute-sw/api/index_analysis/index_analysis_reports/';
    const params = {
        page: '1',
        page_size: '50',
        index_type: symbol,
        bargaindate: [date.slice(0, 4), date.slice(4, 6), date.slice(6)].join('-'),
        type: 'MONTH',
        swindexcode: 'all'
    };
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { params, headers, httpsAgent: new (require('https').Agent({ rejectUnauthorized: false }))() });
        const dataJson = response.data;
        const totalNum = dataJson.data.count;
        const totalPages = Math.ceil(totalNum / 50);
        let bigDf = [];

        for (let page = 1; page <= totalPages; page++) {
            params.page = page.toString();
            const responsePage = await axios.get(url, { params, headers, httpsAgent: new (require('https').Agent({ rejectUnauthorized: false }))() });
            const tempDf = responsePage.data.data.results;
            bigDf = bigDf.concat(tempDf);
        }

        bigDf = _.map(bigDf, row => ({
            '指数代码': row.swindexcode,
            '指数名称': row.swindexname,
            '发布日期': row.bargaindate,
            '收盘指数': parseFloat(row.closeindex),
            '成交量': parseFloat(row.bargainamount),
            '涨跌幅': parseFloat(row.markup),
            '换手率': parseFloat(row.turnoverrate),
            '市盈率': parseFloat(row.pe),
            '市净率': parseFloat(row.pb),
            '均价': parseFloat(row.meanprice),
            '成交额占比': parseFloat(row.bargainsumrate),
            '流通市值': parseFloat(row.negotiablessharesum1),
            '平均流通市值': parseFloat(row.negotiablessharesum2),
            '股息率': parseFloat(row.dp)
        }));

        // 将发布日期转换为 Date 对象
        bigDf = _.orderBy(bigDf, ['发布日期'], ['asc']);
        bigDf.forEach(row => {
            row['发布日期'] = dayjs(row['发布日期']).toDate();
        });

        return bigDf;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
module.exports = {
    index_hist_sw : index_hist_sw,
    index_min_sw : index_min_sw,
    index_component_sw : index_component_sw,
    __index_realtime_sw : __index_realtime_sw,
    index_realtime_sw : index_realtime_sw,
    index_analysis_daily_sw : index_analysis_daily_sw,
    index_analysis_week_month_sw : index_analysis_week_month_sw,
    index_analysis_weekly_sw : index_analysis_weekly_sw,
    index_analysis_monthly_sw : index_analysis_monthly_sw,
};