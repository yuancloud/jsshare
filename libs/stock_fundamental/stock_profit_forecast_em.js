const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-研究报告-盈利预测

async function stockProfitForecastEm(symbol = "") {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    let params = {
        reportName: "RPT_WEB_RESPREDICT",
        columns: "WEB_RESPREDICT",
        pageNumber: "1",
        pageSize: "500",
        sortTypes: "-1",
        sortColumns: "RATING_ORG_NUM",
        p: "1",
        pageNo: "1",
        pageNum: "1"
    };

    if (symbol) {
        params.filter = `(INDUSTRY_BOARD="${symbol}")`;
    }

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        const pageNum = parseInt(dataJson.result.pages, 10);
        let bigDf = [];

        for (let page = 1; page <= pageNum; page++) {
            params.pageNumber = page.toString();
            params.p = page.toString();
            params.pageNo = page.toString();
            params.pageNum = page.toString();

            const pageResponse = await axios.get(url, { params });
            const pageDataJson = pageResponse.data;
            const tempDf = pageDataJson.result.data;
            bigDf = bigDf.concat(tempDf);
        }

        // 模拟pandas的reset_index和重命名列名
        bigDf = _.map(bigDf, (item, index) => ({ ...item, 'index': index + 1 }));
        const year1 = _.mode(_.map(bigDf, 'YEAR1'));
        const year2 = _.mode(_.map(bigDf, 'YEAR2'));
        const year3 = _.mode(_.map(bigDf, 'YEAR3'));
        const year4 = _.mode(_.map(bigDf, 'YEAR4'));

        // 重构列名
        bigDf = _.map(bigDf, item => ({
            序号: item.index,
            代码: item.SCODE,
            名称: item.SNAME,
            研报数: item.REPORT_CNT,
            "机构投资评级(近六个月)-买入": item.BUY,
            "机构投资评级(近六个月)-增持": item.HOLD,
            "机构投资评级(近六个月)-中性": item.NEUTRAL,
            "机构投资评级(近六个月)-减持": item.SELL,
            "机构投资评级(近六个月)-卖出": item.STRONG_SELL,
            [`${year1}预测每股收益`]: item.EPS1,
            [`${year2}预测每股收益`]: item.EPS2,
            [`${year3}预测每股收益`]: item.EPS3,
            [`${year4}预测每股收益`]: item.EPS4
        }));

        // 处理NaN值
        bigDf = _.map(bigDf, item => ({
            ...item,
            "机构投资评级(近六个月)-买入": _.toNumber(item["机构投资评级(近六个月)-买入"]) || 0,
            "机构投资评级(近六个月)-增持": _.toNumber(item["机构投资评级(近六个月)-增持"]) || 0,
            "机构投资评级(近六个月)-中性": _.toNumber(item["机构投资评级(近六个月)-中性"]) || 0,
            "机构投资评级(近六个月)-减持": _.toNumber(item["机构投资评级(近六个月)-减持"]) || 0,
            "机构投资评级(近六个月)-卖出": _.toNumber(item["机构投资评级(近六个月)-卖出"]) || 0,
            [`${year1}预测每股收益`]: _.toNumber(item[`${year1}预测每股收益`]),
            [`${year2}预测每股收益`]: _.toNumber(item[`${year2}预测每股收益`]),
            [`${year3}预测每股收益`]: _.toNumber(item[`${year3}预测每股收益`]),
            [`${year4}预测每股收益`]: _.toNumber(item[`${year4}预测每股收益`])
        }));

        // 排序
        bigDf = _.orderBy(bigDf, ['研报数'], ['desc']);

        // 更新序号
        bigDf = _.map(bigDf, (item, index) => ({ ...item, 序号: index + 1 }));

        return bigDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 注意：在实际项目中，你需要确保已经安装了axios和lodash库。
module.exports = {
    stock_profit_forecast_em : stock_profit_forecast_em,
};