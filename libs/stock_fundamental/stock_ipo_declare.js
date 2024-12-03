const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-新股申购-首发申报信息-首发申报企业信息

async function stockIpoDeclare() {
    /**
     * 东方财富网-数据中心-新股申购-首发申报信息-首发申报企业信息
     * https://data.eastmoney.com/xg/xg/sbqy.html
     * @returns {Array} 首发申报企业信息
     */
    const url = "https://datainterface.eastmoney.com/EM_DataCenter/JS.aspx";
    const params = new URLSearchParams({
        st: "1",
        sr: "-1",
        ps: "500",
        p: "1",
        type: "NS",
        sty: "NSFR",
        js: "({data:[(x)],pages:(pc)})",
        mkt: "1",
        fd: "2021-04-02"
    });

    try {
        const response = await axios.get(url, { params });
        const dataText = response.data;
        // 去除首尾括号并解析JSON
        const dataJson = JSON.parse(dataText.substring(1, dataText.length - 1));
        const tempData = _.map(dataJson.data, item => item.split(','));

        // 添加序号列
        const tempDf = _.map(tempData, (item, index) => {
            return {
                序号: index + 1,
                会计师事务所: item[1],
                保荐机构: item[3],
                律师事务所: item[5],
                拟上市地: item[8],
                备注: item[11],
                申报企业: item[12]
            };
        });

        // 返回所需的列
        const result = _.map(tempDf, item => _.pick(item, [
            '序号',
            '申报企业',
            '拟上市地',
            '保荐机构',
            '会计师事务所',
            '律师事务所',
            '备注'
        ]));

        return result;
    } catch (error) {
        console.error("Error fetching or processing IPO declaration data:", error);
        throw error;
    }
}
module.exports = {
    stock_ipo_declare : stock_ipo_declare,
};