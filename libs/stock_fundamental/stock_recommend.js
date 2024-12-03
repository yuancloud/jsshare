const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///新浪财经-机构推荐池-最新投资评级
const cheerio = require('cheerio');

async function stockInstituteRecommend(symbol = "投资评级选股") {
    const url = "http://stock.finance.sina.com.cn/stock/go.php/vIR_RatingNewest/index.phtml";
    const params = { num: "40", p: "1" };

    try {
        const response = await axios.get(url, { params });
        const $ = cheerio.load(response.data);
        const indicatorMap = {};
        $('#leftMenu dd:eq(1) li').each((index, element) => {
            const a = $(element).find('a');
            indicatorMap[a.text()] = a.attr('href');
        });

        const targetUrl = indicatorMap[symbol];
        if (!targetUrl) throw new Error(`Symbol ${symbol} not found in the indicator map.`);

        const response2 = await axios.get(targetUrl, { params: { num: "10000", p: "1" } });
        const $2 = cheerio.load(response2.data);
        let tempData = [];
        // Assuming the first table is the one we're interested in.
        $('table', $2.html()).first().find('tr').each((i, row) => {
            if (i === 0) return; // Skip header
            const cells = $(row).find('td').map((j, cell) => $(cell).text().trim()).get();
            tempData.push(cells);
        });

        // Adjusting the data according to the symbol
        switch (symbol) {
            case "股票综合评级":
                tempData = _.map(tempData, (row) => {
                    row[0] = _.padStart(row[0], 6, '0'); // 股票代码
                    return _.fromPairs(_.zip(['股票代码', '名称', '最新价', '涨跌幅', '综合评级', '评级次数', '买入次数', '增持次数', '中性次数'], row));
                });
                break;
            case "首次评级股票":
                tempData = _.map(tempData, (row) => {
                    row[0] = _.padStart(row[0], 6, '0'); // 股票代码
                    return _.fromPairs(_.zip(['股票代码', '名称', '最新价', '涨跌幅', '评级机构', '评级日期', '评级', '目标价格'], row));
                });
                break;
            case "目标涨幅排名":
                tempData = _.map(tempData, (row) => {
                    row[0] = _.padStart(row[0], 6, '0'); // 股票代码
                    return _.fromPairs(_.zip(['股票代码', '名称', '最新价', '涨跌幅', '平均目标价', '最高目标价', '最低目标价', '平均目标涨幅'], row));
                });
                break;
            case "机构关注度":
            case "行业关注度":
                tempData = _.map(tempData, (row) => {
                    row[0] = _.padStart(row[0], 6, '0'); // 股票代码
                    return _.fromPairs(_.zip(['股票代码', '名称', '最新价', '涨跌幅', '关注度', '评级次数', '买入次数', '增持次数', '中性次数', '减持次数', '卖出次数'], row));
                });
                break;
            case "投资评级选股":
                tempData = _.map(tempData, (row) => {
                    row[0] = _.padStart(row[0], 6, '0'); // 股票代码
                    return _.fromPairs(_.zip(['股票代码', '名称', '最新价', '涨跌幅', '评级机构', '评级日期', '评级', '目标价格'], row));
                });
                break;
            default:
                tempData = _.map(tempData, (row) => {
                    row[0] = _.padStart(row[0], 6, '0'); // 股票代码
                    return _.fromPairs(_.zip(['股票代码', '名称', '最新价', '涨跌幅', '评级机构', '评级日期', '评级', '目标价格'], row));
                });
                break;
        }

        return tempData;
    } catch (error) {
        console.error(error);
        return [];
    }
}
///新浪财经-机构推荐池-股票评级记录
const cheerio = require('cheerio'); // 用于解析HTML

async function stockInstituteRecommendDetail(symbol = "000001") {
    /**
     * 新浪财经-机构推荐池-股票评级记录
     * @param {string} symbol - 股票代码
     * @returns {Array} - 具体股票的股票评级记录
     */
    const url = `http://stock.finance.sina.com.cn/stock/go.php/vIR_StockSearch/key/${symbol}.phtml`;
    const params = {
        num: "5000",
        p: "1"
    };

    try {
        const response = await axios.get(url, { params });
        const $ = cheerio.load(response.data);
        
        // 假设表格数据是页面中的第一个表格，并且我们只关心前8列
        let tempData = [];
        $('table').first().find('tr').each((index, element) => {
            if (index > 0) { // 跳过表头
                let row = [];
                $(element).find('td').slice(0, 8).each((i, td) => {
                    row.push($(td).text());
                });
                tempData.push(row);
            }
        });

        // 处理股票代码填充至6位
        tempData.forEach(item => {
            item[0] = item[0].padStart(6, '0');
        });

        // 重命名列名，此处简化为直接返回数据，实际应用中可能需要根据实际情况调整
        return tempData;
    } catch (error) {
        console.error(`Error fetching data for symbol ${symbol}:`, error);
        throw error; // 或者返回一个错误对象
    }
}

// 注意：此函数返回的是一个二维数组，而非DataFrame。
// 如果你需要进一步处理这个数据结构以更好地模仿Pandas的行为，你可能需要额外定义一些辅助函数。
module.exports = {
    stock_institute_recommend : stock_institute_recommend,
    stock_institute_recommend_detail : stock_institute_recommend_detail,
};