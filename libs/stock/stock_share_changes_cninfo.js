const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');

///巨潮资讯-股本股东-公司股本变动
async function stock_share_change_cninfo(symbol = '002594', startDate = '20091227', endDate = '20241021') {
    const url = "https://webapi.cninfo.com.cn/api/stock/p_stock2215";
    const params = {
        scode: symbol,
        sdate: `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6)}`,
        edate: `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6)}`,
    };

    // 假设 cninfo.js 文件已经被加载到全局变量中
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

    try {
        const response = await axios.post(url, null, { params, headers });
        const records = response.data?.records;
        let result = records.map(record => {
            return {
                "证券代码": record.SECCODE,
                "证券简称": record.SECNAME,
                "机构名称": record.ORGNAME,
                "公告日期": record.DECLAREDATE,
                "变动日期": record.VARYDATE,
                "变动原因编码": record.F001V,
                "变动原因": record.F002V,
                "总股本": record.F003N,
                "未流通股份": record.F004N,
                "发起人股份": record.F005N,
                "国家持股": record.F006N,
                "国有法人持股": record.F007N,
                "境内法人持股": record.F008N,
                "境外法人持股": record.F009N,
                "自然人持股": record.F010N,
                "募集法人股": record.F011N,
                "内部职工股": record.F012N,
                "转配股": record.F013N,
                "其他流通受限股份": record.F014N,
                "优先股": record.F015N,
                "其他未流通股": record.F016N,
                "已流通股份": record.F021N,
                "人民币普通股": record.F022N,
                "境内上市外资股-B股": record.F023N,
                "境外上市外资股-H股": record.F024N,
                "高管股": record.F025N,
                "其他流通股": record.F026N,
                "流通受限股份": record.F028N,
                "配售法人股": record.F017N,
                "战略投资者持股": record.F018N,
                "证券投资基金持股": record.F019N,
                "一般法人持股": record.F020N,
                "国家持股-受限": record.F029N,
                "国有法人持股-受限": record.F030N,
                "其他内资持股-受限": record.F031N,
                "其中:境内法人持股": record.F032N,
                "其中:境内自然人持股": record.F033N,
                "外资持股-受限": record.F034N,
                "其中:境外法人持股": record.F035N,
                "其中:境外自然人持股": record.F036N,
                "其中:限售高管股": record.F037N,
                "其中:限售B股": record.F038N,
                "其中:限售H股": record.F040N,
                "最新记录标识": record.F027C,
                "其他": record.F049N,
                "控股股东、实际控制人": record.F050N
            }
        })
        return result;
    } catch (error) {
        console.error("请求失败:", error);
        throw error;
    }
}
module.exports = {
    stock_share_change_cninfo: stock_share_change_cninfo,
};