const axios = require('axios');
const _ = require('lodash');
///东方财富网-行情中心-沪深京指数
async function stock_zh_index_spot_em(symbol = "上证系列指数") {
    const symbolMap = {
        "上证系列指数": "m:1 s:2",
        "深证系列指数": "m:0 t:5",
        "指数成份": "m:1 s:3,m:0 t:5",
        "中证系列指数": "m:2",
    };

    const params = new URLSearchParams({
        pn: "1",
        pz: "5000",
        po: "1",
        np: "1",
        ut: "bd1d9ddb04089700cf9c27f6f7426281",
        fltt: "2",
        invt: "2",
        wbp2u: "|0|0|0|web",
        fid: "f3",
        fs: symbolMap[symbol],
        fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152",
        _: "1704327268532"
    });

    try {
        const response = await axios.get("https://48.push2.eastmoney.com/api/qt/clist/get", { params });
        const dataJson = response.data?.data.diff;
        let tempDf = dataJson.map(item => ({
            "代码": item.f12,
            "名称": item.f14,
            "最新价": parseFloat(item.f2),
            "涨跌幅": parseFloat(item.f3),
            "涨跌额": parseFloat(item.f4),
            "成交量": parseFloat(item.f5),
            "成交额": parseFloat(item.f6),
            "振幅": parseFloat(item.f7),
            "最高": parseFloat(item.f15),
            "最低": parseFloat(item.f16),
            "今开": parseFloat(item.f17),
            "昨收": parseFloat(item.f18),
            "量比": parseFloat(item.f10)
        }));
        tempDf.forEach(item => {//{"sz": "0", "sh": "1", "csi": "2"}
            if (symbol == "上证系列指数" || (symbol == "指数成份" && item['代码'].startsWith('0'))) item["市场"] = "1"
            else if (symbol == "深证系列指数" || (symbol == "指数成份" && !item['代码'].startsWith('0'))) item["市场"] = "0"
            else if (symbol == "中证系列指数") item["市场"] = "2"
        });
        return tempDf;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}

///东方财富网-股票指数数据
async function stock_zh_index_daily_em(
    symbol = "csi931151",
    start_date = "20240101",
    end_date = "20500101"
) {
    const market_map = { "sz": "0", "sh": "1", "csi": "2" };
    const url = "https://push2his.eastmoney.com/api/qt/stock/kline/get";
    let secid;

    if (symbol.includes("sz")) {
        secid = `${market_map["sz"]}.${symbol.replace("sz", "")}`;
    } else if (symbol.includes("sh")) {
        secid = `${market_map["sh"]}.${symbol.replace("sh", "")}`;
    } else if (symbol.includes("csi")) {
        secid = `${market_map["csi"]}.${symbol.replace("csi", "")}`;
    } else {
        return [];
    }

    const params = new URLSearchParams({
        cb: "jQuery1124033485574041163946_1596700547000",
        secid,
        ut: "fa5fd1943c7b386f172d6893dbfba10b",
        fields1: "f1,f2,f3,f4,f5",
        fields2: "f51,f52,f53,f54,f55,f56,f57,f58",
        klt: "101",  // 日频率
        fqt: "0",
        beg: start_date,
        end: end_date,
        _: "1596700547039"
    });

    try {
        const response = await axios.get(url, { params });
        const dataText = response.data;
        const jsonDataStartIndex = dataText.indexOf('{');
        const jsonDataEndIndex = dataText.lastIndexOf('}') + 1; // 获取到JSON部分的结束位置
        const data_json = JSON.parse(dataText.substring(jsonDataStartIndex, jsonDataEndIndex));


        const temp_df = data_json.data.klines.map(item => item.split(','));
        const result = temp_df.map(obj => ({
            日期: obj[0],
            开盘: parseFloat(obj[1]),
            收盘: parseFloat(obj[2]),
            最高: parseFloat(obj[3]),
            最低: parseFloat(obj[4]),
            成交量: parseFloat(obj[5]),
            成交额: parseFloat(obj[6])
        }));

        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}
module.exports = {
    stock_zh_index_spot_em: stock_zh_index_spot_em,
    stock_zh_index_daily_em: stock_zh_index_daily_em,
};