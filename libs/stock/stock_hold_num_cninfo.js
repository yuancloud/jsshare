const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');

///巨潮资讯-数据中心-专题统计-股东股本-股东人数及持股集中度
async function stock_hold_num_cninfo(date = "20210630") {
    // 巨潮资讯-数据中心-专题统计-股东股本-股东人数及持股集中度
    const url = "https://webapi.cninfo.com.cn/api/sysapi/p_sysapi1034";
    const mcode = util.getResCode1();

    const headers = {
        "Accept": "*/*",
        "Accept-Enckey": mcode,
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": "0",
        "Host": "webapi.cninfo.com.cn",
        "Origin": "https://webapi.cninfo.com.cn",
        "Pragma": "no-cache",
        "Proxy-Connection": "keep-alive",
        "Referer": "https://webapi.cninfo.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    };

    const params = {
        rdate: date
    };

    try {
        const response = await axios.post(url, null, { headers, params });
        const records = response.data.records;
        const result = records.map(record => ({
            "本期人均持股数量": record.F004N,
            "股东人数增幅": record.F003N,
            "上期股东人数": record.F002N,
            "本期股东人数": record.F001N,
            "证券简称": record.SECNAME,
            "证券代码": record.SECCODE,
            "人均持股数量增幅": record.F006N,
            "变动日期": record.ENDDATE,
            "上期人均持股数量": record.F005N,
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

module.exports = {
    stock_hold_num_cninfo: stock_hold_num_cninfo,
};