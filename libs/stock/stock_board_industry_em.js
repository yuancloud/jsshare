const axios = require('axios');
///东方财富网-沪深板块-行业板块-名称
async function stock_board_industry_name_em() {
    const url = "https://17.push2.eastmoney.com/api/qt/clist/get";
    const params = {
        pn: "1",
        pz: "2000",
        po: "1",
        np: "1",
        ut: "bd1d9ddb04089700cf9c27f6f7426281",
        fltt: "2",
        invt: "2",
        fid: "f3",
        fs: "m:90 t:2 f:!50",
        fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f124,f107,f104,f105,f140,f141,f207,f208,f209,f222",
        _: "1626075887768"
    };

    try {
        const response = await axios.get(url, { params });
        const data = response.data;
        const tempData = data.data.diff;

        let result = tempData.map((row) => ({
            最新价: row.f2,
            涨跌幅: row.f3,
            涨跌额: row.f4,
            换手率: row.f8,
            板块代码: row.f12,
            板块名称: row.f14,
            总市值: row.f20,
            上涨家数: row.f104,
            下跌家数: row.f105,
            领涨股票: row.f128,
            "领涨股票-涨跌幅": row.f136
        }));
        return result
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
///东方财富网-沪深板块-行业板块-实时行情
async function stock_board_industry_spot_em(symbol = "小金属") {
    const fieldMap = {
        "f43": "最新",
        "f44": "最高",
        "f45": "最低",
        "f46": "开盘",
        "f47": "成交量",
        "f48": "成交额",
        "f170": "涨跌幅",
        "f171": "振幅",
        "f168": "换手率",
        "f169": "涨跌额",
    };
    const industryListing = await stock_board_industry_name_em();  // 假设这个函数已定义
    emCode = industryListing.find(item => item.板块名称 === symbol).板块代码;

    const params = new URLSearchParams({
        fields: Object.keys(fieldMap).join(","),
        mpi: "1000",
        invt: "2",
        fltt: "1",
        secid: `90.${emCode}`,
        ut: "fa5fd1943c7b386f172d6893dbfba10b"
    });

    try {
        const response = await axios.get("https://91.push2.eastmoney.com/api/qt/stock/get", { params });
        const dataDict = response.data;
        let row = dataDict.data
        let result = {
            最新: row.f43 * 0.01,
            最高: row.f44 * 0.01,
            最低: row.f45 * 0.01,
            开盘: row.f46 * 0.01,
            成交量: row.f47,
            成交额: row.f48,
            涨跌幅: row.f170 * 0.01,
            振幅: row.f171 * 0.01,
            换手率: row.f168 * 0.01,
        }
        return result

    } catch (error) {
        console.error(error);
        throw error;
    }
}
///东方财富网-沪深板块-行业板块-历史行情

async function stock_board_industry_hist_em(
    symbol = "小金属",
    start_date = "20240101",
    end_date = "20241231",
    period = "日k",
    adjust = ""
) {
    const period_map = {
        "日k": "101",
        "周k": "102",
        "月k": "103",
    };

    // 假设stock_board_industry_name_em是一个已经定义好的函数，返回一个包含行业板块信息的对象。
    const stock_board_concept_em_map = await stock_board_industry_name_em();
    const stock_board_code = stock_board_concept_em_map.find(item => item.板块名称 === symbol).板块代码;
    const adjust_map = { "": "0", "qfq": "1", "hfq": "2" };

    const url = "http://7.push2his.eastmoney.com/api/qt/stock/kline/get";
    const params = new URLSearchParams({
        secid: `90.${stock_board_code}`,
        ut: "fa5fd1943c7b386f172d6893dbfba10b",
        fields1: "f1,f2,f3,f4,f5,f6",
        fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
        klt: period_map[period],
        fqt: adjust_map[adjust],
        beg: start_date,
        end: end_date,
        smplmt: "10000",
        lmt: "1000000",
        _: "1626079488673"
    });

    try {
        const response = await axios.get(url, { params });
        const data_json = response.data;

        const temp_df = data_json.data.klines.map(kline => kline.split(","));
        const result = temp_df.map(row => ({
            "日期": row[0]?.replace(/-/g, ''),
            "开盘": parseFloat(row[1]),
            "收盘": parseFloat(row[2]),
            "最高": parseFloat(row[3]),
            "最低": parseFloat(row[4]),
            "成交量": parseFloat(row[5]),
            "成交额": parseFloat(row[6]),
            "振幅": parseFloat(row[7]),
            "涨跌幅": parseFloat(row[8]),
            "涨跌额": parseFloat(row[9]),
            "换手率": parseFloat(row[10])
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///东方财富网-沪深板块-行业板块-分时历史行情

// 假设 stock_board_industry_name_em 是一个返回板块名称映射的函数
// async function stock_board_industry_name_em() { ... }

async function stock_board_industry_hist_min_em(symbol = "小金属", period = "5") {
    /**
     * 东方财富网-沪深板块-行业板块-分时历史行情
     * https://quote.eastmoney.com/bk/90.BK1027.html
     * @param {string} symbol - 板块名称
     * @param {string} period - 时间周期, 可选值 {"1", "5", "15", "30", "60"}
     * @return {Object[]} 分时历史行情
     */
    const stockBoardConceptEmMap = await stock_board_industry_name_em();
    const stockBoardCode = _.find(stockBoardConceptEmMap, { '板块名称': symbol })['板块代码'];

    let url, params;
    if (period === "1") {
        url = "https://push2his.eastmoney.com/api/qt/stock/trends2/get";
        params = {
            fields1: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13",
            fields2: "f51,f52,f53,f54,f55,f56,f57,f58",
            ut: "fa5fd1943c7b386f172d6893dbfba10b",
            iscr: "0",
            ndays: "1",
            secid: `90.${stockBoardCode}`,
            _: "1687852931312"
        };
    } else {
        url = "http://7.push2his.eastmoney.com/api/qt/stock/kline/get";
        params = {
            secid: `90.${stockBoardCode}`,
            ut: "fa5fd1943c7b386f172d6893dbfba10b",
            fields1: "f1,f2,f3,f4,f5,f6",
            fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
            klt: period,
            fqt: "1",
            beg: "0",
            end: "20500101",
            smplmt: "10000",
            lmt: "1000000",
            _: "1626079488673"
        };
    }

    const response = await axios.get(url, { params });
    const dataJson = response.data;

    let tempData, columns;
    if (period === "1") {
        tempData = dataJson.data.trends.map(item => item.split(','));
        columns = ["日期时间", "开盘", "收盘", "最高", "最低", "成交量", "成交额", "最新价"];
    } else {
        tempData = dataJson.data.klines.map(item => item.split(','));
        columns = ["日期时间", "开盘", "收盘", "最高", "最低", "涨跌幅", "涨跌额", "成交量", "成交额", "振幅", "换手率"];
    }

    const tempDf = tempData.map(row => _.zipObject(columns, row));
    // 转换数值类型
    const numericColumns = ['开盘', '收盘', '最高', '最低', '成交量', '成交额', '最新价', '涨跌幅', '涨跌额', '振幅', '换手率'];
    tempDf.forEach(row => {
        numericColumns.forEach(column => {
            if (row[column]) {
                row[column] = parseFloat(row[column]);
            }
        });
    });

    return tempDf;
}

///东方财富网-沪深板块-行业板块-板块成份
async function stock_board_industry_cons_em(sector = '所有') {

    const stockBoardConceptEmMap = await stock_board_industry_name_em(); // 假设这个函数已经被定义

    if (sector == "所有") {
        let result = []
        for (let index = 0; index < stockBoardConceptEmMap.length; index++) {
            const stockBoardCode = stockBoardConceptEmMap[index];
            result = result.concat(await _stock_board_industry_cons_em(stockBoardCode))
        }
        return result;
    } else {
        const stockBoardCode = _.find(stockBoardConceptEmMap, { '板块名称': sector });
        return await _stock_board_industry_cons_em(stockBoardCode)
    }

}

async function _stock_board_industry_cons_em(stockBoard) {

    const url = "http://29.push2.eastmoney.com/api/qt/clist/get";
    const params = {
        pn: "1",
        pz: "2000",
        po: "1",
        np: "1",
        ut: "bd1d9ddb04089700cf9c27f6f7426281",
        fltt: "2",
        invt: "2",
        fid: "f3",
        fs: `b:${stockBoard["板块代码"]} f:!50`,
        fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f45",
        _: "1626081702127"
    };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.data.diff.map((item, index) => ({
            序号: index + 1,
            行业: stockBoard["板块名称"],
            最新价: item.f2,
            涨跌幅: item.f3,
            涨跌额: item.f4,
            成交量: item.f5,
            成交额: item.f6,
            振幅: item.f7,
            换手率: item.f8,
            市盈率动态: item.f9,
            代码: item.f12,
            名称: item.f14,
            最高: item.f15,
            最低: item.f16,
            今开: item.f17,
            昨收: item.f18,
            市净率: item.f23,
        }));

        return tempData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
module.exports = {
    stock_board_industry_name_em: stock_board_industry_name_em,
    stock_board_industry_spot_em: stock_board_industry_spot_em,
    stock_board_industry_hist_em: stock_board_industry_hist_em,
    stock_board_industry_hist_min_em: stock_board_industry_hist_min_em,
    stock_board_industry_cons_em: stock_board_industry_cons_em,
};