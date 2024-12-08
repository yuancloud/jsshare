const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///新浪行业-板块行情

async function stock_sector_spot(indicator = "行业") {
    let url, params;

    if (indicator === "新浪行业") {
        url = "http://vip.stock.finance.sina.com.cn/q/view/newSinaHy.php";
    } else if (indicator === "启明星行业") {
        url = "http://biz.finance.sina.com.cn/hq/qmxIndustryHq.php";
    } else if (indicator === "概念") {
        url = "http://money.finance.sina.com.cn/q/view/newFLJK.php";
        params = { param: "class" };
    } else if (indicator === "地域") {
        url = "http://money.finance.sina.com.cn/q/view/newFLJK.php";
        params = { param: "area" };
    } else if (indicator === "行业") {
        url = "http://money.finance.sina.com.cn/q/view/newFLJK.php";
        params = { param: "industry" };
    }

    const response = await axios.get(url, { params, responseType: 'arraybuffer' });
    let decoder = new TextDecoder('gb2312');  // Assuming the browser supports 'gb2312'
    let textData = decoder.decode(response.data);

    const jsonData = JSON.parse(textData.substring(textData.indexOf('{')));
    const tempArray = _.map(jsonData, value => value.split(','));

    const tempDF = tempArray.map(row => ({
        label: row[0],
        板块: row[1],
        公司家数: parseInt(row[2], 10),
        平均价格: parseFloat(row[3]),
        涨跌额: parseFloat(row[4]),
        涨跌幅: parseFloat(row[5]),
        总成交量: parseInt(row[6], 10),
        总成交额: parseFloat(row[7]),
        股票代码: row[8],
        个股涨跌幅: parseFloat(row[9]),
        个股当前价: parseFloat(row[10]),
        个股涨跌额: parseFloat(row[11]),
        股票名称: row[12]
    }));

    return tempDF;
}
///新浪行业-板块行情-成份详情
async function stock_sector_detail(sector = 'gn_gfgn') {
    const urlCount = "http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCount";
    const paramsCount = { node: sector };

    try {
        const responseCount = await axios.get(urlCount, { params: paramsCount });
        let totalNum = parseInt(responseCount.data, 10);
        const totalPages = Math.ceil(totalNum / 80);
        let bigData = [];

        const urlData = "http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData";

        for (let page = 1; page <= totalPages; page++) {
            const paramsData = {
                page: String(page),
                num: "80",
                sort: "symbol",
                asc: "1",
                node: sector,
                symbol: "",
                _s_r_a: "page"
            };

            const responseData = await axios.get(urlData, { params: paramsData });
            bigData = bigData.concat(responseData.data);
        }
        bigData.forEach((item, index) => {
            item.buy = parseFloat(item.buy);
            item.high = parseFloat(item.high);
            item.low = parseFloat(item.low);
            item.open = parseFloat(item.open);
            item.sell = parseFloat(item.sell);
            item.settlement = parseFloat(item.settlement);
            item.trade = parseFloat(item.trade);
            item.ticktime = item.ticktime?.replace(":", "");
        })
        return bigData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 注意：此函数返回的是一个包含所有股票信息的对象数组。
module.exports = {
    stock_sector_spot: stock_sector_spot,
    stock_sector_detail: stock_sector_detail,
};