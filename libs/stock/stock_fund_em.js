const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-资金流向-个股
async function stock_individual_fund_flow(symbol = "600094") {
    const url = "https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
    };
    const params = {
        lmt: "0",
        klt: "101",
        secid: `${util.get_market_number(symbol)}.${symbol}`,
        fields1: "f1,f2,f3,f7",
        fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65",
        ut: "b2884a393a59ad64002292a3e90d46a5",
        _: Date.now(),
    };

    try {
        const response = await axios.get(url, { params, headers });
        const records = response.data.data.klines;
        let result = records.map(row => {
            let items = row.split(',')
            return {
                日期: items[0]?.replace(/-/g, ''),
                主力净流入: parseFloat(items[1]),
                小单净流入: parseFloat(items[2]),
                中单净流入: parseFloat(items[3]),
                大单净流入: parseFloat(items[4]),
                超大单净流入: parseFloat(items[5]),
                "主力净流入-净占比": parseFloat(items[6]),
                "小单净流入-净占比": parseFloat(items[7]),
                "中单净流入-净占比": parseFloat(items[8]),
                "大单净流入-净占比": parseFloat(items[9]),
                "超大单净流入-净占比": parseFloat(items[10]),
                收盘价: parseFloat(items[11]),
                涨跌幅: parseFloat(items[12]),
            }
        })
        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///东方财富网-数据中心-资金流向-排名

async function stock_individual_fund_flow_rank(indicator = "10日") {
    const indicatorMap = {
        "今日": ["f62", "f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124"],
        "3日": ["f267", "f12,f14,f2,f127,f267,f268,f269,f270,f271,f272,f273,f274,f275,f276,f257,f258,f124"],
        "5日": ["f164", "f12,f14,f2,f109,f164,f165,f166,f167,f168,f169,f170,f171,f172,f173,f257,f258,f124"],
        "10日": ["f174", "f12,f14,f2,f160,f174,f175,f176,f177,f178,f179,f180,f181,f182,f183,f260,f261,f124"]
    };

    const url = "https://push2.eastmoney.com/api/qt/clist/get";
    const params = {
        fid: indicatorMap[indicator][0],
        po: "1",
        pz: "10000",
        pn: "1",
        np: "1",
        fltt: "2",
        invt: "2",
        ut: "b2884a393a59ad64002292a3e90d46a5",
        fs: "m:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2,m:1+t:2+f:!2,m:1+t:23+f:!2,m:0+t:7+f:!2,m:1+t:3+f:!2",
        fields: indicatorMap[indicator][1]
    };

    try {
        const response = await axios.get(url, { params });
        const data = response.data;
        const tempData = data.data.diff;
        let resultData = [];
        switch (indicator) {
            case "今日":
                resultData = tempData.map(row => ({
                    "最新价": row.f2,              // Accessing f2 field from row
                    "今日涨跌幅": row.f3,          // Accessing f3 field from row
                    "代码": row.f12,               // Accessing f12 field from row
                    "名称": row.f14,               // Accessing f14 field from row
                    "今日主力净流入-净额": row.f62,
                    "今日主力净流入-净占比": row.f184,  // Accessing f62 field from row
                    "今日超大单净流入-净额": row.f66, // Accessing f66 field from row
                    "今日超大单净流入-净占比": row.f69, // Accessing f69 field from row
                    "今日大单净流入-净额": row.f72, // Accessing f72 field from row
                    "今日大单净流入-净占比": row.f75, // Accessing f75 field from row
                    "今日中单净流入-净额": row.f78, // Accessing f78 field from row
                    "今日中单净流入-净占比": row.f81, // Accessing f81 field from row
                    "今日小单净流入-净额": row.f84, // Accessing f84 field from row
                    "今日小单净流入-净占比": row.f87, // Accessing f87 field from row
                }))
                break;
            case "3日":
                resultData = tempData.map(row =>
                ({
                    "最新价": row.f2,                // f2
                    "代码": row.f12,                 // f12
                    "名称": row.f14,                 // f14
                    "3日涨跌幅": row.f124,           // f124
                    "3日主力净流入-净额": row.f127,  // f127
                    "3日主力净流入-净占比": row.f257, // f257
                    "3日超大单净流入-净额": row.f258, // f258
                    "3日超大单净流入-净占比": row.f259, // f259
                    "3日大单净流入-净额": row.f267,  // f267
                    "3日大单净流入-净占比": row.f268, // f268
                    "3日中单净流入-净额": row.f269,  // f269
                    "3日中单净流入-净占比": row.f270, // f270
                    "3日小单净流入-净额": row.f271,  // f271
                    "3日小单净流入-净占比": row.f272  // f272
                }))
                break;
            case "5日":
                resultData = tempData.map
                    (row => ({
                        "最新价": row.f2,
                        "代码": row.f12,
                        "名称": row.f14,
                        "5日涨跌幅": row.f109,
                        "5日主力净流入-净额": row.f124,
                        "5日主力净流入-净占比": row.f164,
                        "5日超大单净流入-净额": row.f165,
                        "5日超大单净流入-净占比": row.f166,
                        "5日大单净流入-净额": row.f167,
                        "5日大单净流入-净占比": row.f168,
                        "5日中单净流入-净额": row.f169,
                        "5日中单净流入-净占比": row.f170,
                        "5日小单净流入-净额": row.f171,
                        "5日小单净流入-净占比": row.f172
                    }))
                break;
            case "10日":
                resultData = tempData.map(row => ({
                    "最新价": row.f2,                 // f2
                    "代码": row.f12,                  // f12
                    "名称": row.f14,                  // f14
                    "10日涨跌幅": row.f124,           // f124
                    "10日主力净流入-净额": row.f160,  // f160
                    "10日主力净流入-净占比": row.f174, // f174
                    "10日超大单净流入-净额": row.f175, // f175
                    "10日超大单净流入-净占比": row.f176, // f176
                    "10日大单净流入-净额": row.f177,  // f177
                    "10日大单净流入-净占比": row.f178, // f178
                    "10日中单净流入-净额": row.f179, // f179
                    "10日中单净流入-净占比": row.f180, // f180
                    "10日小单净流入-净额": row.f181, // f181
                    "10日小单净流入-净占比": row.f182  // f182
                }))
            default:
                // 默认情况下处理
                break;
        }

        // 返回最终结果
        return resultData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 注意：这里没有提供调用示例。
///东方财富网-数据中心-资金流向-大盘

async function stock_market_fund_flow() {
    const url = "https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
    };
    const params = new URLSearchParams({
        lmt: "0",
        klt: "101",
        secid: "1.000001",
        secid2: "0.399001",
        fields1: "f1,f2,f3,f7",
        fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65",
        ut: "b2884a393a59ad64002292a3e90d46a5",
        cb: "jQuery183003743205523325188_1589197499471",
        _: Math.floor(Date.now()),
    });

    try {
        const response = await axios.get(url, { params, headers });
        const regex = /\{.*\}/;
        const jsonString = response.data.match(regex);
        if (!jsonString) {
            console.error('No JSON object found');
            return
        }
        const jsonData = JSON.parse(jsonString[0]);
        const records = jsonData.data.klines;
        const result = records.map(row => {
            let items = row.split(',')
            return {
                "日期": items[0]?.replace(/-/g, ''),
                "主力净流入-净额": items[1],
                "小单净流入-净额": items[2],
                "中单净流入-净额": items[3],
                "大单净流入-净额": items[4],
                "超大单净流入-净额": items[5],
                "主力净流入-净占比": items[6],
                "小单净流入-净占比": items[7],
                "中单净流入-净占比": items[8],
                "大单净流入-净占比": items[9],
                "超大单净流入-净占比": items[10],
                "上证-收盘价": items[11],
                "上证-涨跌幅": items[12],
                "深证-收盘价": items[13],
                "深证-涨跌幅": items[14],
            }
        })

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///东方财富网-数据中心-资金流向-板块资金流-排名

async function stock_sector_fund_flow_rank(indicator = "10日", sectorType = "行业资金流") {
    const sectorTypeMap = { "行业资金流": "2", "概念资金流": "3", "地域资金流": "1" };
    const indicatorMap = {
        "今日": ["f62", "1", "f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124"],
        "5日": ["f164", "5", "f12,f14,f2,f109,f164,f165,f166,f167,f168,f169,f170,f171,f172,f173,f257,f258,f124"],
        "10日": ["f174", "10", "f12,f14,f2,f160,f174,f175,f176,f177,f178,f179,f180,f181,f182,f183,f260,f261,f124"]
    };

    const url = "https://push2.eastmoney.com/api/qt/clist/get";
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
    };

    const params = new URLSearchParams({
        pn: "1",
        pz: "5000",
        po: "1",
        np: "1",
        ut: "b2884a393a59ad64002292a3e90d46a5",
        fltt: "2",
        invt: "2",
        fid0: indicatorMap[indicator][0],
        fs: `m:90 t:${sectorTypeMap[sectorType]}`,
        stat: indicatorMap[indicator][1],
        fields: indicatorMap[indicator][2],
        rt: "52975239",
        cb: "jQuery18308357908311220152_1589256588824",
        _: dayjs().valueOf()
    });

    try {
        let result = []
        const response = await axios.get(url, { params, headers });
        const regex = /\{.*\}/;
        const jsonString = response.data.match(regex);
        if (!jsonString) {
            console.error('No JSON object found');
            return
        }
        const jsonData = JSON.parse(jsonString[0]);
        const records = jsonData.data.diff;
        if (indicator === "今日") {
            result = records.map(row => ({
                "今日涨跌幅": row.f3,
                "名称": row.f14,
                "今日主力净流入-净额": row.f62,
                "今日超大单净流入-净额": row.f66,
                "今日超大单净流入-净占比": row.f69,
                "今日大单净流入-净额": row.f72,
                "今日大单净流入-净占比": row.f75,
                "今日中单净流入-净额": row.f78,
                "今日中单净流入-净占比": row.f81,
                "今日小单净流入-净额": row.f84,
                "今日小单净流入-净占比": row.f87,
                "今日主力净流入-净占比": row.f184,
                "今日主力净流入最大股": row.f204,
                "今日主力净流入最大股代码": row.f205,
                "是否净流入": row.f206,
            }))

        } else if (indicator === "5日") {
            result = records.map(row => ({
                "名称": row.f14,
                "5日涨跌幅": row.f109,
                "5日主力净流入-净额": row.f164,
                "5日主力净流入-净占比": row.f165,
                "5日超大单净流入-净额": row.f166,
                "5日超大单净流入-净占比": row.f167,
                "5日大单净流入-净额": row.f168,
                "5日大单净流入-净占比": row.f169,
                "5日中单净流入-净额": row.f170,
                "5日中单净流入-净占比": row.f171,
                "5日小单净流入-净额": row.f172,
                "5日小单净流入-净占比": row.f173,
                "5日主力净流入最大股": row.f257
            }))

        } else if (indicator === "10日") {
            result = records.map(row => ({
                "名称": row.f14,
                "10日涨跌幅": row.f160,
                "10日主力净流入-净额": row.f174,
                "10日主力净流入-净占比": row.f175,
                "10日超大单净流入-净额": row.f176,
                "10日超大单净流入-净占比": row.f177,
                "10日大单净流入-净额": row.f178,
                "10日大单净流入-净占比": row.f179,
                "10日中单净流入-净额": row.f180,
                "10日中单净流入-净占比": row.f181,
                "10日小单净流入-净额": row.f182,
                "10日小单净流入-净占比": row.f183,
                "10日主力净流入最大股": row.f260,
            }))
        }

        // 返回处理后的数据
        return result;

    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///东方财富网-数据中心-资金流向-行业板块-行业板块与代码字典
async function _get_stock_sector_fund_flow_summary_code() {
    /**
     * 东方财富网-数据中心-资金流向-行业板块
     * https://data.eastmoney.com/bkzj/gn.html
     * @return {Object} 行业板块与代码字典
     */
    const url = "https://push2.eastmoney.com/api/qt/clist/get";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
    };
    const params = new URLSearchParams({
        pn: "1",
        pz: "5000",
        po: "1",
        np: "1",
        ut: "b2884a393a59ad64002292a3e90d46a5",
        fltt: "2",
        invt: "2",
        fid0: "f62",
        fs: "m:90 t:2",
        stat: "1",
        fields: "f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124",
        rt: "52975239",
        _: dayjs().valueOf(), // 获取当前时间的时间戳（毫秒）
    });

    try {
        const response = await axios.get(url, { params, headers });
        const records = response.data.data.diff;
        return records;
    } catch (error) {
        console.error("Error fetching stock sector fund flow summary:", error);
        throw error;
    }
}
///东方财富网-数据中心-资金流向-行业资金流-xx行业个股资金流

async function stock_sector_fund_flow_summary(symbol = '电源设备', indicator = '5日') {
    const codeNameMap = await _get_stock_sector_fund_flow_summary_code(); // 假设这个函数已经实现

    const url = "https://push2.eastmoney.com/api/qt/clist/get";
    let params;

    if (indicator === "今日") {
        params = {
            fid: "f62",
            po: "1",
            pz: "50",
            pn: "1",
            np: "1",
            fltt: "2",
            invt: "2",
            fs: `b:${codeNameMap.find(f => f.f14 === symbol).f12}`,
            fields: "f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124,f1,f13"
        };
    } else if (indicator === "5日") {
        params = {
            fid: "f164",
            po: "1",
            pz: "50",
            pn: "1",
            np: "1",
            fltt: "2",
            invt: "2",
            fs: `b:${codeNameMap.find(f => f.f14 === symbol).f12}`,
            fields: "f12,f14,f2,f109,f164,f165,f166,f167,f168,f169,f170,f171,f172,f173,f257,f258,f124,f1,f13"
        };
    } else if (indicator === "10日") {
        params = {
            fid: "f174",
            po: "1",
            pz: "50",
            pn: "1",
            np: "1",
            fltt: "2",
            invt: "2",
            fs: `b:${codeNameMap.find(f => f.f14 === symbol).f12}`,
            fields: "f12,f14,f2,f160,f174,f175,f176,f177,f178,f179,f180,f181,f182,f183,f260,f261,f124,f1,f13"
        };
    }

    try {
        const response = await axios.get(url, { params });
        const data = response.data;
        const records = data.data.diff || [];

        switch (indicator) {
            case "今日":
                return records.map(row => ({
                    "代码": row.f12,
                    "名称": row.f14,
                    "最新价": row.f2,
                    "今天涨跌幅": row.f3,
                    "今日主力净流入-净额": row.f62,
                    "今日主力净流入-净占比": row.f184,
                    "今日超大单净流入-净额": row.f66,
                    "今日超大单净流入-净占比": row.f69,
                    "今日大单净流入-净额": row.f72,
                    "今日大单净流入-净占比": row.f75,
                    "今日中单净流入-净额": row.f78,
                    "今日中单净流入-净占比": row.f81,
                    "今日小单净流入-净额": row.f84,
                    "今日小单净流入-净占比": row.f87
                }))
            case "5日":
                return records.map(row => ({
                    "代码": row.f12,
                    "名称": row.f14,
                    "最新价": row.f2,
                    "5日涨跌幅": row.f109,
                    "5日主力净流入-净额": row.f164,
                    "5日主力净流入-净占比": row.f165,
                    "5日超大单净流入-净额": row.f166,
                    "5日超大单净流入-净占比": row.f167,
                    "5日大单净流入-净额": row.f168,
                    "5日大单净流入-净占比": row.f169,
                    "5日中单净流入-净额": row.f170,
                    "5日中单净流入-净占比": row.f171,
                    "5日小单净流入-净额": row.f172,
                    "5日小单净流入-净占比": row.f173
                }))
            case "10日":
                return records.map(row => ({
                    "代码": row.f12,
                    "名称": row.f14,
                    "最新价": row.f2,
                    "10日涨跌幅": row.f160,
                    "10日主力净流入-净额": row.f174,
                    "10日主力净流入-净占比": row.f175,
                    "10日超大单净流入-净额": row.f176,
                    "10日超大单净流入-净占比": row.f177,
                    "10日大单净流入-净额": row.f178,
                    "10日大单净流入-净占比": row.f179,
                    "10日中单净流入-净额": row.f180,
                    "10日中单净流入-净占比": row.f181,
                    "10日小单净流入-净额": row.f182,
                    "10日小单净流入-净占比": row.f183
                }))


        }
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 注意：_get_stock_sector_fund_flow_summary_code 函数需要根据实际情况实现。
///东方财富网-数据中心-资金流向-行业资金流-行业历史资金流

// 假设 _get_stock_sector_fund_flow_summary_code 是一个已经定义好的函数
// const _get_stock_sector_fund_flow_summary_code = () => { /* ... */ };

async function stock_sector_fund_flow_hist(symbol = '电源设备') {
    const codeNameMap = await _get_stock_sector_fund_flow_summary_code();
    const url = "https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get";
    const params = new URLSearchParams({
        lmt: "0",
        klt: "101",
        fields1: "f1,f2,f3,f7",
        fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65",
        secid: `90.${codeNameMap.find(f => f.f14 === symbol).f12}`,
        _: "1678954135116"
    });

    try {
        const response = await axios.get(url, { params });
        const records = response.data?.data?.klines;

        const result = records.map(row => {
            let items = row.split(",");
            return {
                日期: items[0]?.replace(/-/g, ''),
                '主力净流入-净额': parseFloat(items[1]),
                '小单净流入-净额': parseFloat(items[2]),
                '中单净流入-净额': parseFloat(items[3]),
                '大单净流入-净额': parseFloat(items[4]),
                '超大单净流入-净额': parseFloat(items[5]),
                '主力净流入-净占比': parseFloat(items[6]),
                '小单净流入-净占比': parseFloat(items[7]),
                '中单净流入-净占比': parseFloat(items[8]),
                '大单净流入-净占比': parseFloat(items[9]),
                '超大单净流入-净占比': parseFloat(items[10])
            }
        });
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
///东方财富网-数据中心-资金流向-概念资金流
async function _get_stock_concept_fund_flow_summary_code() {
    /**
     * 东方财富网-数据中心-资金流向-概念资金流
     * https://data.eastmoney.com/bkzj/gn.html
     * @returns {Object} 概念与代码字典
     */
    const url = "https://push2.eastmoney.com/api/qt/clist/get";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
    };
    const params = {
        pn: "1",
        pz: "5000",
        po: "1",
        np: "1",
        fields: "f12,f13,f14,f62",
        fid: "f62",
        fs: "m:90+t:3",
        ut: "b2884a393a59ad64002292a3e90d46a5",
        _: Math.floor(Date.now()), // Using Date.now() for current timestamp in milliseconds
        // If you want to use dayjs, you can replace the above line with:
        // _: dayjs().valueOf(),
    };

    try {
        const response = await axios.get(url, { headers, params });
        const records = response.data?.data?.diff;
        return records;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // or handle the error as needed
    }
}
///东方财富网-数据中心-资金流向-概念资金流-概念历史资金流
async function stock_concept_fund_flow_hist(symbol = "锂电池") {
    const codeNameMap = await _get_stock_concept_fund_flow_summary_code(); // 假设这是一个异步函数，用于获取概念代码映射

    const url = "https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get";
    const params = new URLSearchParams({
        lmt: "0",
        klt: "101",
        fields1: "f1,f2,f3,f7",
        fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65",
        secid: `90.${codeNameMap.find(f => f.f14 === symbol).f12}`,
        _: "1678954135116"
    });

    try {
        const response = await axios.get(url, { params });
        const records = response.data?.data.klines;
        const result = records.map(row => {
            let items = row.split(",");
            return {
                日期: items[0]?.replace(/-/g, ''),
                '主力净流入-净额': parseFloat(items[1]),
                '小单净流入-净额': parseFloat(items[2]),
                '中单净流入-净额': parseFloat(items[3]),
                '大单净流入-净额': parseFloat(items[4]),
                '超大单净流入-净额': parseFloat(items[5]),
                '主力净流入-净占比': parseFloat(items[6]),
                '小单净流入-净占比': parseFloat(items[7]),
                '中单净流入-净占比': parseFloat(items[8]),
                '大单净流入-净占比': parseFloat(items[9]),
                '超大单净流入-净占比': parseFloat(items[10])
            }
        });
        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 注意：getStockConceptFundFlowSummaryCode 函数需要单独实现。
///东方财富网-数据中心-资金流向-主力净流入排名

async function stock_main_fund_flow(symbol = "全部股票") {
    /**
     * 东方财富网-数据中心-资金流向-主力净流入排名
     * https://data.eastmoney.com/zjlx/list.html
     * @param {string} symbol - 全部股票; choice of {"全部股票", "沪深A股", "沪市A股", "科创板", "深市A股", "创业板", "沪市B股", "深市B股"}
     * @returns {Promise<Array>} 主力净流入排名
     */
    const symbolMap = {
        "全部股票": "m:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2,m:1+t:2+f:!2,m:1+t:23+f:!2,m:0+t:7+f:!2,m:1+t:3+f:!2",
        "沪深A股": "m:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2,m:1+t:2+f:!2,m:1+t:23+f:!2",
        "沪市A股": "m:1+t:2+f:!2,m:1+t:23+f:!2",
        "科创板": "m:1+t:23+f:!2",
        "深市A股": "m:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2",
        "创业板": "m:0+t:80+f:!2",
        "沪市B股": "m:1+t:3+f:!2",
        "深市B股": "m:0+t:7+f:!2",
    };

    const url = "https://push2.eastmoney.com/api/qt/clist/get";
    const params = new URLSearchParams({
        fid: "f184",
        po: "1",
        pz: "50000",
        pn: "1",
        np: "1",
        fltt: "2",
        invt: "2",
        fields: "f2,f3,f12,f13,f14,f62,f184,f225,f165,f263,f109,f175,f264,f160,f100,f124,f265,f1",
        ut: "b2884a393a59ad64002292a3e90d46a5",
        fs: symbolMap[symbol],
    });

    try {
        const response = await axios.get(url, { params, timeout: 15000 });
        const records = response.data?.data?.diff;
        const tempDf = records.map((item) => ({
            代码: item.f12,
            名称: item.f14,
            最新价: parseFloat(item.f2),
            "今日排行榜-主力净占比": parseFloat(item.f184),
            "今日排行榜-今日排名": parseInt(item.f225, 10),
            "今日排行榜-今日涨跌": parseFloat(item.f3),
            "5日排行榜-主力净占比": parseFloat(item.f165),
            "5日排行榜-5日排名": parseInt(item.f263, 10),
            "5日排行榜-5日涨跌": parseFloat(item.f109),
            "10日排行榜-主力净占比": parseFloat(item.f175),
            "10日排行榜-10日排名": parseInt(item.f264, 10),
            "10日排行榜-10日涨跌": parseFloat(item.f160),
            所属板块: item.f100,
        }));

        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_individual_fund_flow: stock_individual_fund_flow,
    stock_individual_fund_flow_rank: stock_individual_fund_flow_rank,
    stock_market_fund_flow: stock_market_fund_flow,
    stock_sector_fund_flow_rank: stock_sector_fund_flow_rank,
    stock_sector_fund_flow_summary: stock_sector_fund_flow_summary,
    stock_sector_fund_flow_hist: stock_sector_fund_flow_hist,
    stock_concept_fund_flow_hist: stock_concept_fund_flow_hist,
    stock_main_fund_flow: stock_main_fund_flow,
};