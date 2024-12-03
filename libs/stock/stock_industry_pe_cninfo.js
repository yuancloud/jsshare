const axios = require('axios');
const util = require('../util/util.js');
///巨潮资讯-数据中心-行业分析-行业市盈率
async function stock_industry_pe_ratio_cninfo(symbol = "证监会行业分类", date = "20240910") {
    const sortCodeMap = { "证监会行业分类": "008001", "国证行业分类": "008200" };
    const url = "http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1087";
    const params = {
        tdate: [date.slice(0, 4), date.slice(4, 6), date.slice(6)].join('-'),
        sortcode: sortCodeMap[symbol]
    };

    const headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": "0",
        "Host": "webapi.cninfo.com.cn",
        "Accept-Enckey": util.getResCode1(),
        "Origin": "http://webapi.cninfo.com.cn",
        "Pragma": "no-cache",
        "Proxy-Connection": "keep-alive",
        "Referer": "http://webapi.cninfo.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    };

    try {
        const response = await axios.post(url, null, { params, headers });
        const records = response.data?.records || [];

        const result = records.map(record => ({
            "行业层级": record.F004N,
            "静态市盈率-算术平均": record.F013N,
            "静态市盈率-中位数": record.F012N,
            "静态市盈率-加权平均": record.F011N,
            "净利润-静态": record.F010N,
            "行业名称": record.F006V,
            "行业编码": record.F005V,
            "行业分类": record.F003V,
            "总市值-静态": record.F009N,
            "纳入计算公司数量": record.F008N,
            "变动日期": record.VARYDATE,
            "公司数量": record.F007N,
        }));

        return result
    } catch (error) {
        console.error(error);
        throw error;
    }
}
module.exports = {
    stock_industry_pe_ratio_cninfo: stock_industry_pe_ratio_cninfo,
};