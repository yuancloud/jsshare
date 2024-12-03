const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///去除单元格中的 ","
function _replace_comma(x) {
    /**
     * 去除单元格中的 ","
     * @param {string} x - 单元格元素
     * @returns {string} 处理后的值或原值
     */
    if (typeof x === 'string' && x.includes(',')) {
        return x.replace(/,/g, "");
    } else {
        return x;
    }
}
///指数的总页数

async function get_zh_index_page_count() {
    /**
     * 指数的总页数
     * https://vip.stock.finance.sina.com.cn/mkt/#hs_s
     * @return {number} 需要抓取的指数的总页数
     */
    try {
        const response = await axios.get(zh_sina_index_stock_count_url);
        const matches = response.data.match(/\d+/g); // 使用正则表达式查找所有数字
        if (matches && matches.length > 0) {
            let pageCount = parseInt(matches[0], 10) / 80;
            return Math.ceil(pageCount); // 如果不是整数，则向上取整
        } else {
            throw new Error("无法从响应中找到匹配的页数信息");
        }
    } catch (error) {
        console.error(`请求或处理失败: ${error.message}`);
        throw error; // 可以选择抛出错误或者返回一个默认值
    }
}
///新浪财经-行情中心首页-A股-分类-所有指数
const demjson = require('demjson'); // 假设有一个类似Python的demjson库用于解析不规范的JSON

async function stockZhIndexSpotSina() {
    let bigDf = [];
    const pageCount = getZhIndexPageCount(); // 这个函数需要根据实际情况实现
    const zhSinaStockPayloadCopy = _.cloneDeep(zhSinaIndexStockPayload); // zhSinaIndexStockPayload 需要预先定义
    for (let page = 1; page <= pageCount; page++) {
        zhSinaStockPayloadCopy.page = page;
        try {
            const res = await axios.get(zhSinaIndexStockUrl, { params: zhSinaStockPayloadCopy });
            const dataJson = demjson.decode(res.data);
            bigDf = bigDf.concat(dataJson);
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
        }
    }

    // 处理数据
    bigDf = bigDf.map(_replaceComma); // _replaceComma 函数需要实现
    ['trade', 'pricechange', 'changepercent', 'buy', 'sell', 'settlement', 'open', 'high', 'low'].forEach(column => {
        bigDf = bigDf.map(row => ({
            ...row,
            [column]: Number.parseFloat(row[column]) || NaN
        }));
    });

    // 重命名列
    bigDf = bigDf.map(row => ({
        "代码": row[codeColumn], // codeColumn 需要替换为实际的列名
        "名称": row[nameColumn], // nameColumn 需要替换为实际的列名
        "最新价": row[latestPriceColumn], // latestPriceColumn 需要替换为实际的列名
        "涨跌额": row[priceChangeColumn], // priceChangeColumn 需要替换为实际的列名
        "涨跌幅": row[changePercentColumn], // changePercentColumn 需要替换为实际的列名
        "昨收": row[closingPriceColumn], // closingPriceColumn 需要替换为实际的列名
        "今开": row[openingPriceColumn], // openingPriceColumn 需要替换为实际的列名
        "最高": row[highestPriceColumn], // highestPriceColumn 需要替换为实际的列名
        "最低": row[lowestPriceColumn], // lowestPriceColumn 需要替换为实际的列名
        "成交量": row[volumeColumn], // volumeColumn 需要替换为实际的列名
        "成交额": row[turnoverColumn]  // turnoverColumn 需要替换为实际的列名
    }));

    // 转换特定列到数字
    ['最新价', '涨跌额', '涨跌幅', '昨收', '今开', '最高', '最低', '成交量', '成交额'].forEach(column => {
        bigDf = bigDf.map(row => ({
            ...row,
            [column]: Number.parseFloat(row[column]) || NaN
        }));
    });

    return bigDf;
}

// 注意：你需要确保 `getZhIndexPageCount`, `zhSinaIndexStockPayload`, `zhSinaIndexStockUrl`, `_replaceComma` 等函数或变量已经定义。
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
        const dataJson = response.data;
        let tempDf = _.map(dataJson.data.diff, (item, index) => ({ ...item, index: index + 1 }));

        tempDf = _.map(tempDf, item => ({
            "序号": item.index,
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

        // 对于可能的非数字值，使用parseFloat转换时会自动处理为NaN
        return tempDf;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
///新浪财经-指数-历史行情数据, 大量抓取容易封 IP
const vm = require('vm');

async function stock_zh_index_daily(symbol = 'sh000922') {
    /**
     * 新浪财经-指数-历史行情数据, 大量抓取容易封 IP
     * @param {string} symbol - 指数代码
     * @returns {Promise<Object[]>} - 历史行情数据
     */
    
    const params = { d: "2020_2_4" };
    const zh_sina_index_stock_hist_url = `https://hq.sinajs.cn/list=${symbol}`;
    try {
        const response = await axios.get(zh_sina_index_stock_hist_url, { params });
        // 解析并执行JavaScript解密代码
        const jsCode = `(function() {
            ${hk_js_decode}
            return d;
        })();`;
        
        const context = vm.createContext({ d: response.data.split('=')[1].split(';')[0].replace(/"/g, '') });
        const dictList = vm.runInContext(jsCode, context);
        
        // 转换数据类型
        const tempData = dictList.map(item => ({
            date: dayjs(item.date).toDate(),
            open: parseFloat(item.open) || null,
            close: parseFloat(item.close) || null,
            high: parseFloat(item.high) || null,
            low: parseFloat(item.low) || null,
            volume: parseInt(item.volume, 10) || null
        }));
        
        return tempData;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        throw error;
    }
}

// 注意：hk_js_decode 是一个包含了解密逻辑的字符串，这里假设它已经被定义。
// 你需要提供这个具体的JavaScript解密函数代码。
///腾讯证券-获取所有股票数据的第一天, 注意这个数据是腾讯证券的历史数据第一天

async function getTxStartYear(symbol = "sh000919") {
    /**
     * 腾讯证券-获取所有股票数据的第一天, 注意这个数据是腾讯证券的历史数据第一天
     * @param {string} symbol - 带市场标识的股票代码
     * @returns {Promise<string>} 开始日期
     */
    const url1 = "https://web.ifzq.gtimg.cn/other/klineweb/klineWeb/weekTrends";
    const params1 = new URLSearchParams({
        code: symbol,
        type: 'qfq',
        _var: 'trend_qfq',
        r: '0.3506048543943414'
    });

    try {
        const response1 = await axios.get(url1, { params: params1 });
        const dataText1 = response1.data;
        let jsonData1 = JSON.parse(dataText1.substring(dataText1.indexOf("={") + 2));
        if (!jsonData1.data) {
            const url2 = "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get";
            const params2 = new URLSearchParams({
                _var: 'kline_dayqfq',
                param: `${symbol},day,,,320,qfq`,
                r: '0.751892490072597'
            });

            const response2 = await axios.get(url2, { params: params2 });
            const dataText2 = response2.data;
            const jsonData2 = JSON.parse(dataText2.substring(dataText2.indexOf("={") + 2));
            const startDate = jsonData2.data[symbol].day[0][0];
            return startDate;
        }
        const startDate = jsonData1.data[0][0];
        return startDate;
    } catch (error) {
        console.error(`Error fetching or parsing data: ${error}`);
        throw error; // 或者你可以选择返回一个默认值或错误信息
    }
}
///腾讯证券-日频-股票或者指数历史数据

async function getTxStartYear(symbol) {
    // 假设这是一个异步函数，用于获取起始年份
    // 这里应该实现具体的逻辑来返回开始年份
    return '2015'; // 示例返回值
}

function stockZhIndexDailyTx(symbol = "sz980017") {
    const url = "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get";
    let tempDf = [];
    
    (async () => {
        const startYear = await getTxStartYear(symbol);
        const rangeStart = parseInt(startYear, 10);
        const rangeEnd = dayjs().year() + 1;
        
        for (let year = rangeStart; year < rangeEnd; year++) {
            const params = new URLSearchParams({
                _var: "kline_dayqfq",
                param: `${symbol},day,${year}-01-01,${year + 1}-12-31,640,qfq`,
                r: "0.8205512681390605"
            });
            
            try {
                const response = await axios.get(url, { params: params.toString() });
                let innerTempDf = [];
                const data = JSON.parse(response.data.substring(response.data.indexOf("={") + 2));
                
                if (data.data[symbol].day) {
                    innerTempDf = data.data[symbol].day;
                } else if (data.data[symbol].qfqday) {
                    innerTempDf = data.data[symbol].qfqday;
                }
                
                tempDf = tempDf.concat(innerTempDf);
            } catch (error) {
                console.error(`Error fetching data for year ${year}:`, error);
            }
        }

        tempDf = tempDf.map(row => ({
            date: dayjs(row[0]).toDate(),
            open: parseFloat(row[1]),
            close: parseFloat(row[2]),
            high: parseFloat(row[3]),
            low: parseFloat(row[4]),
            amount: parseFloat(row[5])
        }));

        // 去重
        tempDf = Array.from(new Map(tempDf.map(item => [item.date, item])).values());

        // 如果需要返回一个 Promise，可以在这里 resolve(tempDf)
    })();
}

// 注意：由于上面的函数内部使用了 async/await，所以它不会立即返回结果。
// 你需要在调用后等待所有异步操作完成，或者修改函数以返回一个 Promise。
///东方财富网-股票指数数据

async function stock_zh_index_daily_em(
  symbol = "csi931151",
  start_date = "19900101",
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
    const data_text = response.data;
    const data_json = JSON.parse(data_text.substring(data_text.indexOf("{"), -2));

    if (!data_json.data || !data_json.data.klines) {
      return [];
    }

    const temp_df = _.map(data_json.data.klines, item => item.split(','));
    const columns = ["date", "open", "close", "high", "low", "volume", "amount", "_"];
    const result = _.map(temp_df, row => _.zipObject(columns, row));
    const finalResult = _.map(result, obj => ({
      date: obj.date,
      open: parseFloat(obj.open),
      close: parseFloat(obj.close),
      high: parseFloat(obj.high),
      low: parseFloat(obj.low),
      volume: parseFloat(obj.volume),
      amount: parseFloat(obj.amount)
    }));

    return finalResult;
  } catch (error) {
    console.error(error);
    return [];
  }
}
module.exports = {
    _replace_comma : _replace_comma,
    get_zh_index_page_count : get_zh_index_page_count,
    stock_zh_index_spot_sina : stock_zh_index_spot_sina,
    stock_zh_index_spot_em : stock_zh_index_spot_em,
    stock_zh_index_daily : stock_zh_index_daily,
    get_tx_start_year : get_tx_start_year,
    stock_zh_index_daily_tx : stock_zh_index_daily_tx,
    stock_zh_index_daily_em : stock_zh_index_daily_em,
};