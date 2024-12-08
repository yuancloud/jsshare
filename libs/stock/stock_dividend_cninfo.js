const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');

///巨潮资讯-个股-历史分红
async function stock_dividend_cninfo(symbol = "600009") {
    const url = "http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1139";
    const params = { scode: symbol };

    const headers = {
        "Accept": "*/*",
        "Accept-Enckey": util.getResCode1(),
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": "0",
        "Host": "webapi.cninfo.com.cn",
        "Origin": "http://webapi.cninfo.com.cn",
        "Pragma": "no-cache",
        "Proxy-Connection": "keep-alive",
        "Referer": "http://webapi.cninfo.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    };

    try {
        const response = await axios.post(url, null, { params, headers });
        const records = response.data.records;
        const result = records.map(record => ({
            实施方案公告日期: record.F006D?.replace(/-/g, ''),
            送股比例: record.F010N,
            转增比例: record.F011N,
            派息比例: record.F012N,
            股权登记日: record.F018D?.replace(/-/g, ''),
            除权日: record.F020D,
            派息日: record.F023D,
            股份到账日: record.F025D?.replace(/-/g, ''),
            实施方案分红说明: record.F007V,
            分红类型: record.F044V,
            报告时间: record.F001V
        }));
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
module.exports = {
    stock_dividend_cninfo: stock_dividend_cninfo,
};