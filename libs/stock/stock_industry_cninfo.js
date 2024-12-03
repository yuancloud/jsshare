const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');

///巨潮资讯-行业分类数据
async function stock_industry_category_cninfo(symbol = "巨潮行业分类标准") {
    const symbolMap = {
        "证监会行业分类标准": "008001",
        "巨潮行业分类标准": "008002",
        "申银万国行业分类标准": "008003",
        "新财富行业分类标准": "008004",
        "国资委行业分类标准": "008005",
        "巨潮产业细分标准": "008006",
        "天相行业分类标准": "008007",
        "全球行业分类标准": "008008",
    };

    const url = "https://webapi.cninfo.com.cn/api/stock/p_public0002";
    const params = { indcode: "", indtype: symbolMap[symbol], format: "json" };
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

    try {
        const response = await axios.get(url, { params, headers });
        const records = response.data?.records;
        let result = records.map(row => ({
            父类编码: row["PARENTCODE"],
            类目编码: row["SORTCODE"],
            类目名称: row["SORTNAME"],
            类目名称英文: row["F001V"],
            终止日期: row["F002D"],
            行业类型编码: row["F003V"],
            行业类型: row["F004V"],
            分级: (row["SORTCODE"].length - 1) / 2
        }));

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
///巨潮资讯-上市公司行业归属的变动情况

async function stock_industry_change_cninfo(symbol = "002594", startDate = "20091227", endDate = "20220713") {
    const url = "https://webapi.cninfo.com.cn/api/stock/p_stock2110";
    const params = {
        scode: symbol,
        sdate: `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6)}`,
        edate: `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6)}`
    };
    const headers = {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": "0",
        Host: "webapi.cninfo.com.cn",
        "Accept-Enckey": util.getResCode1(),
        Origin: "https://webapi.cninfo.com.cn",
        Pragma: "no-cache",
        "Proxy-Connection": "keep-alive",
        Referer: "https://webapi.cninfo.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    };

    try {
        const response = await axios.post(url, null, { params, headers });
        const records = response.data?.records;
        let result = records.map(row => ({
            机构名称: row["ORGNAME"],
            证券代码: row["SECCODE"],
            新证券简称: row["SECNAME"],
            变更日期: row["VARYDATE"],
            分类标准编码: row["F001V"],
            分类标准: row["F002V"],
            行业编码: row["F003V"],
            行业门类: row["F004V"],
            行业次类: row["F005V"],
            行业大类: row["F006V"],
            行业中类: row["F007V"],
            最新记录标识: row["F008C"]
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

module.exports = {
    stock_industry_category_cninfo: stock_industry_category_cninfo,
    stock_industry_change_cninfo: stock_industry_change_cninfo,
};