const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');

///巨潮资讯-数据中心-专题统计-股东股本-实际控制人持股变动
async function stock_hold_control_cninfo(symbol = "全部") {
    const symbolMap = {
        "单独控制": "069001",
        "实际控制人": "069002",
        "一致行动人": "069003",
        "家族控制": "069004",
        "全部": "",
    };

    const url = "https://webapi.cninfo.com.cn/api/sysapi/p_sysapi1033";

    const headers = {
        "Accept": "*/*",
        "Accept-Enckey": util.getResCode1(),
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
        ctype: symbolMap[symbol],
    };

    try {
        const response = await axios.get(url, { headers, params });
        const records = response.data.records;
        let result = records.map(record => ({
            控股比例: record.F002N,
            控股数量: record.F001N,
            证券简称: record.SECNAME,
            实际控制人名称: record.F006V,
            直接控制人名称: record.F004V,
            控制类型: record.F003V,
            证券代码: record.SECCODE,
            变动日期: record.ENDDATE
        }));
        return result;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}

///巨潮资讯-数据中心-专题统计-股东股本-高管持股变动明细
async function stock_hold_management_detail_cninfo(symbol = "增持") {
    const symbolMap = {
        "增持": "B",
        "减持": "S",
    };
    const currentDate = dayjs().format('YYYY-MM-DD');
    const url = "https://webapi.cninfo.com.cn/api/sysapi/p_sysapi1030";


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
        "X-Requested-With": "XMLHttpRequest",
    };

    const params = {
        sdate: (parseInt(currentDate.substring(0, 4)) - 1).toString() + currentDate.substring(4),
        edate: currentDate,
        varytype: symbolMap[symbol],
    };

    try {
        const response = await axios.post(url, null, { headers, params });
        const records = response.data.records;
        let result = records.map(record => ({
            "证券简称": record.SECNAME,
            "公告日期": record.DECLAREDATE,
            "高管姓名": record.HUMANNAME,
            "期末市值": record.F009N,
            "成交均价": record.F008N,
            "证券代码": record.SECCODE,
            "变动比例": record.F007N,
            "变动数量": record.F006N,
            "截止日期": record.ENDDATE,
            "期末持股数量": record.F005N,
            "期初持股数量": record.F004N,
            "变动人与董监高关系": record.F003V,
            "董监高职务": record.F002V,
            "董监高姓名": record.F001V,
            "数据来源": record.F011V,
            "持股变动原因": record.F010V,
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

module.exports = {
    stock_hold_control_cninfo: stock_hold_control_cninfo,
    stock_hold_management_detail_cninfo: stock_hold_management_detail_cninfo,
};