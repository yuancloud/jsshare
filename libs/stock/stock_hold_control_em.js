const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-特色数据-高管持股-董监高及相关人员持股变动明细

async function stock_hold_management_detail_em() {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        reportName: "RPT_EXECUTIVE_HOLD_DETAILS",
        columns: "ALL",
        quoteColumns: "",
        filter: "",
        pageNumber: "1",
        pageSize: "5000",
        sortTypes: "-1,1,1",
        sortColumns: "CHANGE_DATE,SECURITY_CODE,PERSON_NAME",
        source: "WEB",
        client: "WEB",
        p: "1",
        pageNo: "1",
        pageNum: "1",
        _: "1691501763413"
    };

    let bigData = [];

    try {
        const response = await axios.get(url, { params });
        const totalPage = response.data.result.pages;

        for (let page = 1; page <= totalPage; page++) {
            params.pageNumber = page.toString();
            params.p = page.toString();
            params.pageNo = page.toString();
            params.pageNum = page.toString();

            const pageResponse = await axios.get(url, { params });
            const tempData = pageResponse.data.result.data;
            bigData = bigData.concat(tempData);
        }
        let result = bigData.map(row => ({
            股票代码: row.SECURITY_CODE,  // 股票代码
            衍生代码: row.DERIVE_SECURITY_CODE,  // 衍生证券代码（如果存在）
            股票名称: row.SECURITY_NAME,  // 股票名称
            变动日期: row.CHANGE_DATE?.replace(/-/g, ''),  // 变动日期
            变动人: row.PERSON_NAME,  // 变动人
            变动股数: row.CHANGE_SHARES,  // 变动股数
            成交均价: row.AVERAGE_PRICE,  // 成交均价
            变动金额: row.CHANGE_AMOUNT,  // 变动金额
            变动原因: row.CHANGE_REASON,  // 变动原因
            变动比例: row.CHANGE_RATIO,  // 变动比例
            变动后持股数: row.CHANGE_AFTER_HOLDNUM,  // 变动后持股数
            持股种类: row.HOLD_TYPE,  // 持股种类
            董监高人员姓名: row.DSE_PERSON_NAME,  // 董监高人员姓名
            职务: row.POSITION_NAME,  // 职务
            变动人与董监高的关系: row.PERSON_DSE_RELATION,  // 变动人与董监高的关系
            机构代码: row.ORG_CODE,  // 机构代码
            GGEID: row.GGEID,  // GGEID（保持原字段）
            开始时持有: row.BEGIN_HOLD_NUM,  // 开始时持有
            结束后持有: row.END_HOLD_NUM,  // 结束后持有

        }));
        return result;

    } catch (error) {
        console.error("Error fetching data:", error);
    }

}
///东方财富网-数据中心-特色数据-高管持股-人员增减持股变动明细

async function stock_hold_management_person_em(symbol = "001308", name = "吴远") {
    /**
     * 东方财富网-数据中心-特色数据-高管持股-人员增减持股变动明细
     * @param {string} symbol - 股票代码
     * @param {string} name - 高管名称
     * @returns {Promise<Array>} - 人员增减持股变动明细
     */
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        reportName: "RPT_EXECUTIVE_HOLD_DETAILS",
        columns: "ALL",
        quoteColumns: "",
        filter: `(SECURITY_CODE="${symbol}")(PERSON_NAME="${name}")`,
        pageNumber: "1",
        pageSize: "5000",
        sortTypes: "-1,1,1",
        sortColumns: "CHANGE_DATE,SECURITY_CODE,PERSON_NAME",
        source: "WEB",
        client: "WEB",
        _: "1691503078611"
    });

    try {
        const response = await axios.get(url, { params });
        const records = response.data.result.data;
        const result = records.map(row => ({
            代码: row.SECURITY_CODE,  // 股票代码
            衍生代码: row.DERIVE_SECURITY_CODE,  // 衍生证券代码（如果存在）
            名称: row.SECURITY_NAME,  // 股票名称
            日期: row.CHANGE_DATE?.replace(/-/g, ''),  // 变动日期
            变动人: row.PERSON_NAME,  // 变动人
            变动股数: row.CHANGE_SHARES,  // 变动股数
            成交均价: row.AVERAGE_PRICE,  // 成交均价
            变动金额: row.CHANGE_AMOUNT,  // 变动金额
            变动原因: row.CHANGE_REASON,  // 变动原因
            变动比例: row.CHANGE_RATIO,  // 变动比例
            变动后持股数: row.CHANGE_AFTER_HOLDNUM,  // 变动后持股数
            持股种类: row.HOLD_TYPE,  // 持股种类
            董监高人员姓名: row.DSE_PERSON_NAME,  // 董监高人员姓名
            职务: row.POSITION_NAME,  // 职务
            变动人与董监高的关系: row.PERSON_DSE_RELATION,  // 变动人与董监高的关系
            机构代码: row.ORG_CODE,  // 机构代码
            GGEID: row.GGEID,  // GGEID（保持原字段）
            开始时持有: row.BEGIN_HOLD_NUM,  // 开始时持有
            结束后持有: row.END_HOLD_NUM,  // 结束后持有
        })).filter(item => item["日期"] && item["变动股数"] != null);

        // 返回处理后的数据
        return result
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_hold_management_detail_em: stock_hold_management_detail_em,
    stock_hold_management_person_em: stock_hold_management_person_em,
};