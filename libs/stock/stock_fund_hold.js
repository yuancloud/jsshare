const axios = require('axios');
///东方财富网-数据中心-主力数据-基金持仓
async function stock_report_fund_hold(symbol = '基金持仓', date = '20210331') {
    const symbolMap = {
        "基金持仓": "1",
        "QFII持仓": "2",
        "社保持仓": "3",
        "券商持仓": "4",
        "保险持仓": "5",
        "信托持仓": "6",
    };
    const url = 'http://data.eastmoney.com/dataapi/zlsj/list';
    const params = {
        date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`,
        type: symbolMap[symbol],
        zjc: '0',
        sortField: 'HOULD_NUM',
        sortDirec: '1',
        pageNum: '1',
        pageSize: '500',
        p: '1',
        pageNo: '1'
    };

    let bigDf = [];
    try {
        const response = await axios.get(url, { params });
        const totalPage = response.data.pages;

        for (let page = 1; page <= totalPage; page++) {
            params.pageNum = page.toString();
            params.p = page.toString();
            params.pageNo = page.toString();

            const pageResponse = await axios.get(url, { params });
            const tempDf = pageResponse.data.data;
            bigDf = bigDf.concat(tempDf);
        }

        let result = bigDf.map((row, index) => ({
            序号: index + 1,
            "内部代码": row.SECURITY_INNER_CODE,
            "股票简称": row.SECURITY_NAME_ABBR,
            "报告日期": row.REPORT_DATE,
            "机构类型": row.ORG_TYPE,
            "持有基金家数": row.HOULD_NUM,
            "持股总数": row.TOTAL_SHARES,
            "持股市值": row.HOLD_VALUE,
            "自由流通股占比": row.FREESHARES_RATIO,
            "持股变化": row.HOLDCHA,
            "持股变动数值": row.HOLDCHA_NUM,
            "持股变动比例": row.HOLDCHA_RATIO,
            "证券代码": row.SECUCODE,
            "总股本占比": row.TOTALSHARES_RATIO,
            "机构类型名称": row.ORG_TYPE_NAME,
            "季度变化率": row.QCHANGE_RATE,
            "自由流通市值": row.FREE_MARKET_CAP,
            "自由流通股": row.FREE_SHARES,
            "证券类型代码": row.SECURITY_TYPE_CODE,
            "持股变动市值": row.HOLDCHA_VALUE,
            "股票代码": row.SECURITY_CODE
        }));
        return result;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
    }


}
///东方财富网-数据中心-主力数据-基金持仓-明细
async function stock_report_fund_hold_detail(symbol = "008286", date = "20220331") {
    /**
     * 东方财富网-数据中心-主力数据-基金持仓-明细
     * http://data.eastmoney.com/zlsj/ccjj/2020-12-31-008286.html
     * @param {string} symbol - 基金代码
     * @param {string} date - 财报发布日期, xxxx-03-31, xxxx-06-30, xxxx-09-30, xxxx-12-31
     * @return {Array} - 基金持仓-明细数据
     */
    const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "SECURITY_CODE",
        sortTypes: "-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_MAINDATA_MAIN_POSITIONDETAILS",
        columns: "ALL",
        quoteColumns: "",
        filter: `(HOLDER_CODE="${symbol}")(REPORT_DATE='${formattedDate}')`,
        source: "WEB",
        client: "WEB"
    });

    try {
        const response = await axios.get(url, { params });
        const records = response.data?.result.data || [];

        // 选择需要的列
        const result = records.map((row, index) => ({
            序号: index + 1,
            "证券代码": row.SECUCODE,
            "股票代码": row.SECURITY_CODE,
            "内部代码": row.SECURITY_INNER_CODE,
            "股票简称": row.SECURITY_NAME_ABBR,
            "报告日期": row.REPORT_DATE.replace(' 00:00:00', ""),
            "持有人代码": row.HOLDER_CODE,
            "持有人名称": row.HOLDER_NAME,
            "母机构代码": row.PARENT_ORG_CODE,
            "母机构旧代码": row.PARENT_ORGCODE_OLD,
            "母机构名称": row.PARENT_ORG_NAME,
            "机构类型代码": row.ORG_TYPE_CODE,
            "机构类型": row.ORG_TYPE,
            "持股总数": row.TOTAL_SHARES,
            "持股市值": row.HOLD_MARKET_CAP,
            "总股本占比": row.TOTAL_SHARES_RATIO,
            "自由流通股占比": row.FREE_SHARES_RATIO,
            "净资产占比": row.NETASSET_RATIO,
            "机构名称简称": row.ORG_NAME_ABBR
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    stock_report_fund_hold: stock_report_fund_hold,
    stock_report_fund_hold_detail: stock_report_fund_hold_detail,
};