const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///去除单元格中的 ","
function _replace_comma(x) {
    /**
     * 去除单元格中的 ","
     * @param {string} x - 单元格元素
     * @return {string} 处理后的值或原值
     */
    if (typeof x === 'string' && x.includes(',')) {
        return x.replace(/,/g, '');
    } else {
        return x;
    }
}
///指数的总页数

async function getHkIndexPageCount() {
    /**
     * 指数的总页数
     * https://vip.stock.finance.sina.com.cn/mkt/#zs_hk
     * @return {number} 需要抓取的指数的总页数
     */
    try {
        const response = await axios.get(
            "https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getNameCount?node=zs_hk"
        );
        
        // 使用正则表达式查找数字
        const matches = response.data.match(/\d+/);
        if (matches) {
            let pageCount = parseInt(matches[0], 10) / 80;
            // 如果不是整数，则向上取整
            return _.isInteger(pageCount) ? pageCount : Math.ceil(pageCount);
        } else {
            throw new Error("无法找到匹配的数字");
        }
    } catch (error) {
        console.error("获取页面计数时出错:", error.message);
        throw error; // 或者返回一个默认值、错误信息等
    }
}
///新浪财经-行情中心-港股指数

async function stockHkIndexSpotSina() {
    /**
     * 新浪财经-行情中心-港股指数
     * 大量采集会被目标网站服务器封禁 IP, 如果被封禁 IP, 请 10 分钟后再试
     * https://vip.stock.finance.sina.com.cn/mkt/#zs_hk
     * @return {Array} 所有指数的实时行情数据
     */
    const url = (
        "https://hq.sinajs.cn/rn=mtf2t&list=hkCES100,hkCES120,hkCES280,hkCES300,hkCESA80,hkCESG10," +
        "hkCESHKM,hkCSCMC,hkCSHK100,hkCSHKDIV,hkCSHKLC,hkCSHKLRE,hkCSHKMCS,hkCSHKME,hkCSHKPE,hkCSHKSE," +
        "hkCSI300,hkCSRHK50,hkGEM,hkHKL,hkHSCCI,hkHSCEI,hkHSI,hkHSMBI,hkHSMOGI,hkHSMPI,hkHSTECH,hkSSE180," +
        "hkSSE180GV,hkSSE380,hkSSE50,hkSSECEQT,hkSSECOMP,hkSSEDIV,hkSSEITOP,hkSSEMCAP,hkSSEMEGA,hkVHSI"
    );
    const headers = {"Referer": "https://vip.stock.finance.sina.com.cn/"};
    
    try {
        const response = await axios.get(url, { headers });
        const dataText = response.data;
        const dataList = _.map(dataText.split("\n"), item => {
            const parts = item.split('"');
            return parts.length > 1 ? parts[1].split(",") : null;
        }).filter(Boolean); // 过滤掉null值

        const tempData = _.map(dataList, items => ({
            代码: items[0],
            名称: items[1],
            最新价: parseFloat(items[6]) || null,
            涨跌额: parseFloat(items[7]) || null,
            涨跌幅: parseFloat(items[8]) || null,
            昨收: parseFloat(items[4]) || null,
            今开: parseFloat(items[2]) || null,
            最高: parseFloat(items[5]) || null,
            最低: parseFloat(items[6]) || null,
        }));

        // 可以进一步处理tempData，例如排序、筛选等
        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个空数组或错误信息
    }
}
///新浪财经-港股指数-历史行情数据

async function stockHkIndexDailySina(symbol = "CES100") {
    /**
     * 新浪财经-港股指数-历史行情数据
     * https://stock.finance.sina.com.cn/hkstock/quotes/CES100.html
     * @param {string} symbol - CES100, 港股指数代码
     * @returns {Promise<Array>} 历史行情数据
     */
    const url = `https://finance.sina.com.cn/stock/hkstock/${symbol}/klc_kl.js`;
    const params = { d: '2023_5_01' };

    try {
        const response = await axios.get(url, { params });
        // 假设 hk_js_decode 已经定义并可用
        const dictList = hk_js_decode(response.data.split('=')[1].split(';')[0].replace(/"/g, ''));

        const tempData = _.map(dictList, item => ({
            date: dayjs(item.date, 'YYYY-MM-DD').toDate(),
            open: parseFloat(item.open) || null,
            close: parseFloat(item.close) || null,
            high: parseFloat(item.high) || null,
            low: parseFloat(item.low) || null,
            volume: parseInt(item.volume, 10) || null
        }));

        return tempData;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}

// 注意：这里没有提供 hk_js_decode 的具体实现，因为它需要根据实际情况来编写。
///东方财富网-行情中心-港股-指数实时行情

async function stock_hk_index_spot_em() {
    const url = "https://15.push2.eastmoney.com/api/qt/clist/get";
    const params = new URLSearchParams({
        pn: "1",
        pz: "20000",
        po: "1",
        np: "1",
        ut: "bd1d9ddb04089700cf9c27f6f7426281",
        fltt: "2",
        invt: "2",
        wbp2u: "|0|0|0|web",
        fid: "f3",
        fs: "m:124,m:125,m:305",
        fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152",
        _: "1683800547682"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.data.diff;

        // 添加序号
        tempData = _.map(tempData, (item, index) => ({ ...item, index: index + 1 }));

        // 重命名列
        const columnMapping = {
            index: '序号',
            f2: '最新价',
            f3: '涨跌幅',
            f4: '涨跌额',
            f5: '成交量',
            f6: '成交额',
            f12: '代码',
            f13: '内部编号',
            f14: '名称',
            f15: '最高',
            f16: '最低',
            f17: '今开',
            f18: '昨收'
        };

        tempData = _.map(tempData, item => _.mapKeys(item, (value, key) => columnMapping[key] || key));

        // 选择需要的列
        const selectedColumns = [
            '序号', '内部编号', '代码', '名称', '最新价', '涨跌额', '涨跌幅', '今开', '最高', '最低', '昨收', '成交量', '成交额'
        ];

        tempData = _.map(tempData, row => _.pick(row, selectedColumns));

        // 将指定列转换为数值
        const numericColumns = ['最新价', '涨跌额', '涨跌幅', '今开', '最高', '最低', '昨收', '成交量', '成交额'];
        tempData = _.map(tempData, row => {
            _.forEach(numericColumns, col => {
                row[col] = parseFloat(row[col]) || null;
            });
            return row;
        });

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///缓存 ak.stock_hk_index_spot_em() 接口中的代码与内部编号
function _symbol_code_dict() {
    /**
     * 缓存 ak.stock_hk_index_spot_em() 接口中的代码与内部编号
     * https://quote.eastmoney.com/center/gridlist.html#hk_index
     * @returns {Object} 代码与内部编号
     */
    const __stockHkIndexSpotEmDf = stock_hk_index_spot_em();
    const symbolCodeDict = {};

    // 假设__stockHkIndexSpotEmDf是一个数组对象，每个元素都有"代码"和"内部编号"属性
    for (const item of __stockHkIndexSpotEmDf) {
        symbolCodeDict[item.代码] = item.内部编号;
    }

    return symbolCodeDict;
}
///东方财富网-港股-股票指数数据
// 如果需要处理日期，可以引入dayjs
// 
function _symbol_code_dict() {
    // 假设这里返回一个对象，包含符号到代码的映射
    return {
        "HSTECF2L": "01",
        // 其他符号映射...
    };
}

async function stock_hk_index_daily_em(symbol = "HSTECF2L") {
    const symbolCodeDict = _symbol_code_dict();
    symbolCodeDict["HSAHP"] = "100";  // 更新字典

    const symbolStr = `${symbolCodeDict[symbol]}.${symbol}`;
    const url = "https://push2his.eastmoney.com/api/qt/stock/kline/get";
    const params = new URLSearchParams({
        secid: symbolStr,
        klt: "101",  // 日频率
        fqt: "1",
        lmt: "10000",
        end: "20500000",
        iscca: "1",
        fields1: "f1,f2,f3,f4,f5,f6,f7,f8",
        fields2: "f51,f52,f53,f54,f55,f6,f57,f58,f59,f60,f61,f62,f63,f64",
        ut: "f057cbcbce2a86e2866ab8877db1d059",
        forcect: "1"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        const tempArray = dataJson.data.klines.map(item => item.split(','));
        const columns = ["date", "open", "latest", "high", "low"];
        const tempDf = tempArray.map(row => ({
            date: row[0],
            open: parseFloat(row[1]),
            high: parseFloat(row[3]),
            low: parseFloat(row[4]),
            latest: parseFloat(row[2])
        }));

        // 过滤掉非数字值
        tempDf.forEach(row => {
            for (let key of Object.keys(row)) {
                if (isNaN(row[key])) {
                    row[key] = null;  // 或者你可以选择其他默认值
                }
            }
        });

        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;  // 或者你可以选择如何处理这个错误
    }
}
module.exports = {
    _replace_comma : _replace_comma,
    get_hk_index_page_count : get_hk_index_page_count,
    stock_hk_index_spot_sina : stock_hk_index_spot_sina,
    stock_hk_index_daily_sina : stock_hk_index_daily_sina,
    stock_hk_index_spot_em : stock_hk_index_spot_em,
    _symbol_code_dict : _symbol_code_dict,
    stock_hk_index_daily_em : stock_hk_index_daily_em,
};