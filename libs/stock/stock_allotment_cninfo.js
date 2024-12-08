const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///巨潮资讯-个股-配股实施方案
async function stock_allotment_cninfo(symbol = '600030', startDate = '19700101', endDate = '22220222') {
    /**
     * 巨潮资讯-个股-配股实施方案
     * @param {string} symbol - 股票代码
     * @param {string} startDate - 开始查询的日期
     * @param {string} endDate - 结束查询的日期
     * @returns {Promise<Object[]>} 配股实施方案
     */
    const url = "https://webapi.cninfo.com.cn/api/stock/p_stock2232";
    const params = {
        scode: symbol,
        sdate: !startDate ? startDate : `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`,
        edate: !endDate ? endDate : `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`,
    };
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
        "X-Requested-With": "XMLHttpRequest"
    };

    try {
        const response = await axios.post(url, null, { params, headers });
        const dataJson = response.data;
        let result = dataJson.records.map((item) => ({
            "记录标识": item.SUBID,
            "证券简称": item.SECNAME,
            "停牌起始日": item.F049D?.replace(/-/g, ''),
            "上市公告日期": item.F037D?.replace(/-/g, ''),
            "配股缴款起始日": item.F013D?.replace(/-/g, ''),
            "可转配股数量": item.F029N,
            "停牌截止日": item.F053D?.replace(/-/g, ''),
            "实际配股数量": item.F017N,
            "配股价格": item.F005N,
            "配股比例": item.F004N,
            "配股前总股本": item.F024N,
            "每股配权转让费(元)": item.F032N,
            "法人股实配数量": item.F044N,
            "实际募资净额": item.F020N,
            "大股东认购方式": item.F028V,
            "其他配售简称": item.F036V,
            "发行方式": item.F051V,
            "配股失败，退还申购款日期": item.F048D?.replace(/-/g, ''),
            "除权基准日": item.F012D?.replace(/-/g, ''),
            "预计发行费用": item.F008N,
            "配股发行结果公告日": item.F052D?.replace(/-/g, ''),
            "证券代码": item.SECCODE,
            "配股权证交易截止日": item.F040D?.replace(/-/g, ''),
            "其他股份实配数量": item.F047N,
            "国家股实配数量": item.F043N,
            "委托单位": item.F055N,
            "公众获转配数量": item.F031N,
            "其他配售代码": item.F035V,
            "配售对象": item.F050V,
            "配股权证交易起始日": item.F039D,
            "资金到账日": item.F023D?.replace(/-/g, ''),
            "机构名称": item.ORGNAME,
            "股权登记日": item.F011D?.replace(/-/g, ''),
            "实际募资总额": item.F019N,
            "预计募集资金": item.F007N,
            "大股东认购数量": item.F027N,
            "公众股实配数量": item.F026N,
            "转配股实配数量": item.F046N,
            "承销费用": item.F022N,
            "法人获转配数量": item.F030N,
            "配股后流通股本": item.F042N,
            "股票类别": item.F002V,
            "公众配售简称": item.F034V,
            "发行方式编码": item.F054V,
            "承销方式": item.F010V,
            "公告日期": item.DECLAREDATE?.replace(/-/g, ''),
            "配股上市日": item.F038D?.replace(/-/g, ''),
            "配股缴款截止日": item.F014D?.replace(/-/g, ''),
            "承销余额(股)": item.F018N,
            "预计配股数量": item.F006N,
            "配股后总股本": item.F025N,
            "职工股实配数量": item.F045N,
            "承销方式编码": item.F009V,
            "发行费用总额": item.F021N,
            "配股前流通股本": item.F041N,
            "股票类别编码": item.F001V,
            "公众配售代码": item.F033V,
        }));
        return result
    } catch (error) {
        console.error("Error fetching stock allotment data:", error);
        throw error;
    }
}

// 注意：_getFileContentCninfo 函数需要根据实际情况实现。
module.exports = {
    stock_allotment_cninfo: stock_allotment_cninfo,
};