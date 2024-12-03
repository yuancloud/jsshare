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
        let columns = [
            "记录标识",
            "证券简称",
            "停牌起始日",
            "上市公告日期",
            "配股缴款起始日",
            "可转配股数量",
            "停牌截止日",
            "实际配股数量",
            "配股价格",
            "配股比例",
            "配股前总股本",
            "每股配权转让费(元)",
            "法人股实配数量",
            "实际募资净额",
            "大股东认购方式",
            "其他配售简称",
            "发行方式",
            "配股失败，退还申购款日期",
            "除权基准日",
            "预计发行费用",
            "配股发行结果公告日",
            "证券代码",
            "配股权证交易截止日",
            "其他股份实配数量",
            "国家股实配数量",
            "委托单位",
            "公众获转配数量",
            "其他配售代码",
            "配售对象",
            "配股权证交易起始日",
            "资金到账日",
            "机构名称",
            "股权登记日",
            "实际募资总额",
            "预计募集资金",
            "大股东认购数量",
            "公众股实配数量",
            "转配股实配数量",
            "承销费用",
            "法人获转配数量",
            "配股后流通股本",
            "股票类别",
            "公众配售简称",
            "发行方式编码",
            "承销方式",
            "公告日期",
            "配股上市日",
            "配股缴款截止日",
            "承销余额(股)",
            "预计配股数量",
            "配股后总股本",
            "职工股实配数量",
            "承销方式编码",
            "发行费用总额",
            "配股前流通股本",
            "股票类别编码",
            "公众配售代码",
        ]
        let result = dataJson.records.map((row) => {
            let mappedRow = {};
            let keys = Object.keys(row)
            columns.forEach((columnName, index) => {
                mappedRow[columnName] = row[keys[index]]; // Map each column to its corresponding row value
            });
            return mappedRow;
        });
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