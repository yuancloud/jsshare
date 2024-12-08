const axios = require('axios');
const util = require('../util/util.js');

///巨潮资讯-数据中心-专题统计-公司治理-股权质押
async function stock_cg_equity_mortgage_cninfo(date = "20210930") {
    const url = "https://webapi.cninfo.com.cn/api/sysapi/p_sysapi1094";
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
        tdate: [date.slice(0, 4), date.slice(4, 6), date.slice(6)].join('-')
    };

    try {
        const response = await axios.post(url, null, { headers, params });
        const dataJson = response.data;
        const tempDf = dataJson.records.map(record => ({
            '质押解除数量': record.F012N ?? -1,
            '股票简称': record.SECNAME,
            '公告日期': record.DECLAREDATE?.replace(/-/g, ''),
            '质押事项': record.F008V,
            '质权人': record.F003V,
            '出质人': record.F001V,
            '股票代码': record.SECCODE,
            '占总股本比例': record.F007N,
            '累计质押占总股本比例': record.F018N,
            '质押数量': record.F006N
        }));

        return tempDf;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
module.exports = {
    stock_cg_equity_mortgage_cninfo: stock_cg_equity_mortgage_cninfo,
};