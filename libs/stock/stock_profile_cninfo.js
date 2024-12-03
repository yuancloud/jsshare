const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///巨潮资讯-个股-公司概况
async function stock_profile_cninfo(symbol = "600030") {
    const url = "https://webapi.cninfo.com.cn/api/sysapi/p_sysapi1133";
    const params = {
        scode: symbol,
    };
    let mcode = util.getResCode1();

    const headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": "0",
        "Host": "webapi.cninfo.com.cn",
        "Accept-Enckey": mcode,
        "Origin": "https://webapi.cninfo.com.cn",
        "Pragma": "no-cache",
        "Proxy-Connection": "keep-alive",
        "Referer": "https://webapi.cninfo.com.cn/",
        "X-Requested-With": "XMLHttpRequest"
    };

    try {
        const response = await axios.post(url, null, { params, headers });
        const records = response.data?.records;
        let result = records.map(record => ({
            "公司名称": record.ORGNAME,
            "英文名称": record.F001V,
            "曾用简称": record.F002V,
            "A股代码": record.ASECCODE,
            "A股简称": record.ASECNAME,
            "B股代码": record.BSECCODE,
            "B股简称": record.BSECNAME,
            "H股代码": record.HSECCODE,
            "H股简称": record.HSECNAME,
            "入选指数": record.F044V,
            "所属市场": record.MARKET,
            "所属行业": record.F032V,
            "法人代表": record.F003V,
            "注册资金": record.F007N,
            "成立日期": record.F010D,
            "上市日期": record.F006D,
            "官方网站": record.F011V,
            "电子邮箱": record.F012V,
            "联系电话": record.F013V,
            "传真": record.F014V,
            "注册地址": record.F004V,
            "办公地址": record.F005V,
            "邮政编码": record.F006V,
            "主营业务": record.F015V,
            "经营范围": record.F016V,
            "机构简介": record.F017V,
        }))

        return result;
    } catch (error) {
        console.error(error);
        throw error; // 抛出异常，让调用者处理
    }
}
module.exports = {
    stock_profile_cninfo: stock_profile_cninfo,
};