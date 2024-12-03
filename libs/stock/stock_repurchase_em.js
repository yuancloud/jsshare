const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-股票回购-股票回购数据

async function stock_repurchase_em() {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "UPD,DIM_DATE,DIM_SCODE",
        sortTypes: "-1,-1,-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPTA_WEB_GETHGLIST_NEW",
        columns: "ALL",
        source: "WEB"
    });

    try {
        let response = await axios.get(url, { params });
        const totalPage = response.data.result.pages;
        let bigDf = [];

        for (let page = 1; page <= totalPage; page++) {
            params.set("pageNumber", page.toString());
            response = await axios.get(url, { params });
            const tempDf = response.data.result.data;
            bigDf = bigDf.concat(tempDf);
        }

        // Rename columns
        bigDf = bigDf.map(item => ({
            '股票代码': item.DIM_SCODE,
            '股票简称': item.SECURITYSHORTNAME,
            '最新价': item.NEWPRICE,
            '计划回购价格区间': item.REPURPRICECAP,
            '计划回购数量区间-下限': item.REPURNUMLOWER,
            '计划回购数量区间-上限': item.REPURNUMCAP,
            '占公告前一日总股本比例-下限': item.ZSZXX,
            '占公告前一日总股本比例-上限': item.ZSZSX,
            '计划回购金额区间-下限': item.JEXX,
            '计划回购金额区间-上限': item.JESX,
            '回购起始时间': item.DIM_TRADEDATE,
            '实施进度': item.REPURPROGRESS,
            '已回购股份价格区间-下限': item.REPURPRICELOWER1,
            '已回购股份价格区间-上限': item.REPURPRICECAP1,
            '已回购股份数量': item.REPURNUM,
            '已回购金额': item.REPURAMOUNT,
            '最新公告日期': item.UPDATEDATE
        }));


        return bigDf;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
module.exports = {
    stock_repurchase_em: stock_repurchase_em,
};