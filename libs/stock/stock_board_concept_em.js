const axios = require('axios');
const util = require('../util/util.js');
const _ = require('lodash');

///东方财富网-行情中心-沪深京板块-概念板块-名称
async function stock_board_concept_name_em() {
    const url = "https://79.push2.eastmoney.com/api/qt/clist/get";
    const params = new URLSearchParams({
        "pn": "1",
        "pz": "2000",
        "po": "1",
        "np": "1",
        "ut": "bd1d9ddb04089700cf9c27f6f7426281",
        "fltt": "2",
        "invt": "2",
        "fid": "f3",
        "fs": "m:90 t:3 f:!50",
        "fields": "f2,f3,f4,f8,f12,f14,f15,f16,f17,f18,f20,f21,f24,f25,f22,f33,f11,f62,f128,f124,f107,f104,f105,f136",
        "_": "1626075887768"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        const tempData = dataJson.data.diff;

        // Transform the data
        const tempDf = tempData.map((item, index) => ({
            最新价: (item.f2),
            涨跌幅: (item.f3),
            涨跌额: (item.f4),
            换手率: (item.f8),
            板块代码: (item.f12),
            板块名称: (item.f14),
            总市值: (item.f20),
            上涨家数: (item.f17),
            下跌家数: (item.f18),
            领涨股票: (item.f22),
            '领涨股票-涨跌幅': (item.f25)
        }));
        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需要进行错误处理
    }
}
///东方财富网-沪深板块-概念板块-历史行情
async function stock_board_concept_hist_em(
    symbol = "数字货币",
    period = "daily",
    start_date = "20240101",
    end_date = "20241128",
    adjust = ""
) {
    const periodMap = {
        "daily": "101",
        "weekly": "102",
        "monthly": "103"
    };
    const adjustMap = { "": "0", "qfq": "1", "hfq": "2" };

    const stockBoardConceptEmMap = await stock_board_concept_name_em();
    const stockBoardCode = stockBoardConceptEmMap.find(item => item.板块名称 === symbol).板块代码;

    const url = "https://91.push2his.eastmoney.com/api/qt/stock/kline/get";
    const params = new URLSearchParams({
        secid: `90.${stockBoardCode}`,
        ut: "fa5fd1943c7b386f172d6893dbfba10b",
        fields1: "f1,f2,f3,f4,f5,f6",
        fields2: "f51,f52,f53,f54,f55,f6,f57,f58,f59,f60,f61",
        klt: periodMap[period],
        fqt: adjustMap[adjust],
        beg: start_date,
        end: end_date,
        smplmt: "10000",
        lmt: "1000000",
        _: "1626079488673"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        const tempData = dataJson.data.klines.map(item => item.split(','));
        const tempDf = tempData.map(row => ({
            日期: util.parseDate(row[0]).fstr(),
            开盘: parseFloat(row[1]),
            收盘: parseFloat(row[2]),
            最高: parseFloat(row[3]),
            最低: parseFloat(row[4]),
            //成交量: parseFloat(row[4]),
            成交额: parseFloat(row[5]),
            振幅: parseFloat(row[6]),
            涨跌幅: parseFloat(row[7]),
            涨跌额: parseFloat(row[8]),
            换手率: parseFloat(row[9])
        }));

        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
/**
 * 东方财富网-沪深板块-概念板块-分时历史行情
 * @param {string} symbol 板块名称
 * @param {string} period 周期选择 {"1", "5", "15", "30", "60"}
 * @returns {Array<Object>} 分时历史行情
 */
async function stock_board_concept_hist_min_em(symbol = "长寿药", period = "1") {

    const stockBoardConceptEmMap = await stock_board_concept_name_em();
    const stockBoardCode = stockBoardConceptEmMap.find(item => item.板块名称 === symbol).板块代码;

    if (period === "1") {
        const url = "https://push2his.eastmoney.com/api/qt/stock/trends2/get";
        const params = new URLSearchParams({
            fields1: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13",
            fields2: "f51,f52,f53,f54,f55,f56,f57,f58",
            ut: "fa5fd1943c7b386f172d6893dbfba10b",
            iscr: "0",
            ndays: "1",
            secid: `90.${stockBoardCode}`,
            _: "1687852931312"
        });
        const response = await axios.get(`${url}?${params}`);
        const dataJson = response.data;
        let tempData = dataJson.data.trends.map(item => item.split(','));
        tempData = tempData.map(row => ({
            日期时间: row[0],
            开盘: parseFloat(row[1]),
            收盘: parseFloat(row[2]),
            最高: parseFloat(row[3]),
            最低: parseFloat(row[4]),
            成交量: parseFloat(row[5]),
            成交额: parseFloat(row[6]),
            最新价: parseFloat(row[7])
        }));
        return tempData;
    } else {
        const url = "https://91.push2his.eastmoney.com/api/qt/stock/kline/get";
        const params = new URLSearchParams({
            secid: `90.${stockBoardCode}`,
            ut: "fa5fd1943c7b386f172d6893dbfba10b",
            fields1: "f1,f2,f3,f4,f5,f6",
            fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
            klt: period,
            fqt: "1",
            end: "20500101",
            lmt: "1000000",
            _: "1647760607065"
        });
        const response = await axios.get(`${url}?${params}`);
        const dataJson = response.data;
        let tempData = dataJson.data.klines.map(item => item.split(','));
        tempData = tempData.map(row => ({
            日期时间: row[0],
            开盘: parseFloat(row[1]),
            收盘: parseFloat(row[2]),
            最高: parseFloat(row[3]),
            最低: parseFloat(row[4]),
            涨跌幅: parseFloat(row[5]),
            涨跌额: parseFloat(row[6]),
            成交量: parseFloat(row[7]),
            成交额: parseFloat(row[8]),
            振幅: parseFloat(row[9]),
            换手率: parseFloat(row[10])
        }));
        return tempData;
    }
}

// 注意：此处省略了stock_board_concept_name_em的具体实现。
///东方财富-沪深板块-概念板块-板块成份

async function stock_board_concept_cons_em(symbol = "长寿药") {
    const stockBoardConceptEmMap = await stock_board_concept_name_em();
    const stockBoardCode = stockBoardConceptEmMap.find(item => item.板块名称 === symbol).板块代码;

    const url = "https://29.push2.eastmoney.com/api/qt/clist/get";
    const params = new URLSearchParams({
        pn: "1",
        pz: "5000",
        po: "1",
        np: "1",
        ut: "bd1d9ddb04089700cf9c27f6f7426281",
        fltt: "2",
        invt: "2",
        fid: "f3",
        fs: `b:${stockBoardCode} f:!50`,
        fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23," +
            "f24,f25,f22,f11,f62,f128,f136,f115,f152,f45",
        _: "1626081702127"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempDf = dataJson.data.diff.map((item, index) => ({
            最新价: parseFloat(item.f2),
            涨跌幅: parseFloat(item.f3),
            涨跌额: parseFloat(item.f4),
            成交量: parseFloat(item.f5),
            成交额: parseFloat(item.f6),
            振幅: parseFloat(item.f7),
            换手率: parseFloat(item.f8),
            市盈率动态: parseFloat(item.f9),
            代码: item.f12,
            名称: item.f14,
            最高: parseFloat(item.f15),
            最低: parseFloat(item.f16),
            今开: parseFloat(item.f17),
            昨收: parseFloat(item.f18),
            市净率: parseFloat(item.f23)
        }));
        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 注意：这个函数假设存在一个名为 stockBoardConceptNameEm 的函数，它返回包含板块信息的对象数组。
module.exports = {
    stock_board_concept_name_em: stock_board_concept_name_em,
    stock_board_concept_hist_em: stock_board_concept_hist_em,
    stock_board_concept_hist_min_em: stock_board_concept_hist_min_em,
    stock_board_concept_cons_em: stock_board_concept_cons_em,
};