const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');

///巨潮资讯-数据中心-专题统计-公司治理-对外担保
async function stock_cg_guarantee_cninfo(symbol = "全部", start_date = "20180630", end_date = "20210927") {
    const symbolMap = {
        "全部": "",
        "深市主板": "012002",
        "沪市": "012001",
        "创业板": "012015",
        "科创板": "012029",
    };

    const url = "https://webapi.cninfo.com.cn/api/sysapi/p_sysapi1054";

    const headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": "0",
        "Host": "webapi.cninfo.com.cn",
        "Accept-Enckey": util.getResCode1(),
        "Origin": "https://webapi.cninfo.com.cn",
        "Pragma": "no-cache",
        "Proxy-Connection": "keep-alive",
        "Referer": "https://webapi.cninfo.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    };

    const params = {
        sdate: `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6)}`,
        edate: `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6)}`,
        market: symbolMap[symbol]
    };

    try {
        const response = await axios.post(url, null, { headers, params });
        const dataJson = response.data;
        const result = dataJson.records.map(record => ({
            '公告统计区间': record['AINTERVAL'],
            '担保金融占净资产比例': record['F003N'],
            '担保金额': record['F002N'],
            '担保笔数': record['F001N'],
            '证券简称': record['SECNAME'],
            '证券代码': record['SECCODE'],
            '归属于母公司所有者权益': record['F005N']
        }));

        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
module.exports = {
    stock_cg_guarantee_cninfo: stock_cg_guarantee_cninfo,
};