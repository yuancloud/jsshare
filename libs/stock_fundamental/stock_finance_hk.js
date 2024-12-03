const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富-港股-财务报表-三大报表

async function stockFinancialHkReportEm(stock = "00700", symbol = "资产负债表", indicator = "年度") {
    const url = "https://datacenter.eastmoney.com/securities/api/data/v1/get";
    let params = {
        reportName: 'RPT_CUSTOM_HKSK_APPFN_CASHFLOW_SUMMARY',
        columns: 'SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,START_DATE,REPORT_DATE,FISCAL_YEAR,CURRENCY,ACCOUNT_STANDARD,REPORT_TYPE',
        quoteColumns: '',
        filter: `(SECUCODE="${stock}.HK")`,
        source: 'F10',
        client: 'PC',
        v: '02092616586970355'
    };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.result.data[0].REPORT_LIST;

        if (indicator === "年度") {
            tempData = tempData.filter(item => item.REPORT_TYPE === "年报");
        }

        const yearList = tempData.map(item => item.REPORT_DATE.split(" ")[0]);

        let reportName, columns;
        switch (symbol) {
            case "资产负债表":
                reportName = "RPT_HKF10_FN_BALANCE_PC";
                columns = "SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,ORG_CODE,REPORT_DATE,DATE_TYPE_CODE,FISCAL_YEAR,STD_ITEM_CODE,STD_ITEM_NAME,AMOUNT,STD_REPORT_DATE";
                break;
            case "利润表":
                reportName = "RPT_HKF10_FN_INCOME_PC";
                columns = "SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,ORG_CODE,REPORT_DATE,DATE_TYPE_CODE,FISCAL_YEAR,START_DATE,STD_ITEM_CODE,STD_ITEM_NAME,AMOUNT";
                break;
            case "现金流量表":
                reportName = "RPT_HKF10_FN_CASHFLOW_PC";
                columns = "SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,ORG_CODE,REPORT_DATE,DATE_TYPE_CODE,FISCAL_YEAR,START_DATE,STD_ITEM_CODE,STD_ITEM_NAME,AMOUNT";
                break;
            default:
                throw new Error(`Unsupported symbol: ${symbol}`);
        }

        params = {
            reportName,
            columns,
            quoteColumns: "",
            filter: `(SECUCODE="${stock}.HK")(REPORT_DATE in (${yearList.map(y => `'${y}'`).join(',')}))`,
            pageNumber: "1",
            pageSize: "",
            sortTypes: "-1,1",
            sortColumns: "REPORT_DATE,STD_ITEM_CODE",
            source: "F10",
            client: "PC",
            v: "01975982096513973"
        };

        const response2 = await axios.get(url, { params });
        const dataJson2 = response2.data;
        return dataJson2.result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
///东方财富-港股-财务分析-主要指标
// 如果需要进行日期处理，可以引入dayjs
// 
async function stockFinancialHkAnalysisIndicatorEm(symbol = "00853", indicator = "年度") {
    /**
     * 东方财富-港股-财务分析-主要指标
     * https://emweb.securities.eastmoney.com/PC_HKF10/NewFinancialAnalysis/index?type=web&code=00700
     * @param {string} symbol - 股票代码
     * @param {string} indicator - choice of {"年度", "报告期"}
     * @returns {Promise<Array>} - 新浪财经-港股-财务分析-主要指标
     */
    const url = "https://datacenter.eastmoney.com/securities/api/data/v1/get";
    let params = new URLSearchParams({
        reportName: "RPT_HKF10_FN_MAININDICATOR",
        columns: "HKF10_FN_MAININDICATOR",
        quoteColumns: "",
        pageNumber: "1",
        pageSize: "9",
        sortTypes: "-1",
        sortColumns: "STD_REPORT_DATE",
        source: "F10",
        client: "PC",
        v: "01975982096513973"
    });

    if (indicator === "年度") {
        params.append("filter", `(SECUCODE="${symbol}.HK")(DATE_TYPE_CODE="001")`);
    } else {
        params.append("filter", `(SECUCODE="${symbol}.HK")`);
    }

    try {
        const response = await axios.get(url, { params: params.toString() });
        const dataJson = response.data;
        const tempData = dataJson.result.data;
        return tempData; // 返回数据作为JSON对象数组
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
module.exports = {
    stock_financial_hk_report_em : stock_financial_hk_report_em,
    stock_financial_hk_analysis_indicator_em : stock_financial_hk_analysis_indicator_em,
};