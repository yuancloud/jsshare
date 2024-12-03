const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///新浪新版股票指数成份页面, 目前该接口可获取指数数量较少
const demjson = require('demjson'); // 用于解析非标准JSON格式

async function indexStockConsSina(symbol = "000300") {
    /**
     * 新浪新版股票指数成份页面, 目前该接口可获取指数数量较少
     * @param {string} symbol - 指数代码
     * @return {Array} - 指数的成份股列表
     */
    if (symbol === "000300") {
        symbol = "hs300";
        const url = `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCountSimple`;
        const params = { node: `${symbol}` };
        
        try {
            const response = await axios.get(url, { params });
            const pageCount = Math.ceil(parseInt(response.data) / 80) + 1;
            let tempDf = [];
            
            for (let page = 1; page < pageCount; page++) {
                const dataUrl = `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData`;
                const dataParams = {
                    page: String(page),
                    num: "80",
                    sort: "symbol",
                    asc: "1",
                    node: "hs300",
                    symbol: "",
                    _s_r_a: "init"
                };

                const dataResponse = await axios.get(dataUrl, { params: dataParams });
                const decodedData = demjson.decode(dataResponse.data);
                tempDf = _.concat(tempDf, decodedData);
            }
            return tempDf;
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    }

    const url = `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeDataSimple`;
    const params = {
        page: 1,
        num: "3000",
        sort: "symbol",
        asc: "1",
        node: `zhishu_${symbol}`,
        _s_r_a: "setlen"
    };

    try {
        const response = await axios.get(url, { params });
        const temp = demjson.decode(response.data);
        return temp;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///聚宽-指数数据-指数列表
const cheerio = require('cheerio');
// 如果需要处理日期，可以取消注释并使用 dayjs
// 
async function index_stock_info() {
    /**
     * 聚宽-指数数据-指数列表
     * https://www.joinquant.com/data/dict/indexData
     * @return {Array} 指数信息的数据数组
     */
    try {
        const url = "https://www.joinquant.com/data/dict/indexData";
        const response = await axios.get(url, { responseType: 'text' });
        const $ = cheerio.load(response.data);
        const $table = $('table').eq(0); // 选择第一个表格
        const rows = [];
        
        // 解析表头
        const headers = [];
        $table.find('thead th').each((index, element) => {
            headers.push($(element).text());
        });

        // 解析表格行
        $table.find('tbody tr').each((rowIndex, row) => {
            const cells = $(row).find('td');
            let tempRow = {};
            for (let i = 0; i < cells.length; i++) {
                if (i === 0) { // 处理"指数代码"
                    const codeParts = $(cells[i]).text().split('.');
                    tempRow[headers[i]] = codeParts[0];
                } else {
                    tempRow[headers[i]] = $(cells[i]).text();
                }
            }
            // 只保留指定列
            const newRow = {
                index_code: tempRow[headers[0]],
                display_name: tempRow[headers[1]],
                publish_date: tempRow[headers[2]]
            };
            rows.push(newRow);
        });

        return rows;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        throw error;
    }
}

// 导出函数以便在其他地方使用
module.exports = index_stock_info;
///最新股票指数的成份股目录
const cheerio = require('cheerio');

async function index_stock_cons(symbol = "399639") {
    const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vII_NewestComponent/indexid/${symbol}.phtml`;
    let response = await axios.get(url, { responseType: 'text' });
    let $ = cheerio.load(response.data, { decodeEntities: false });

    let pageNumElement = $('td.table2 a').last().attr('href');
    let page_num = pageNumElement ? pageNumElement.split('page=')[1].split('&')[0] : '#';

    if (page_num === '#') {
        let tables = _.attempt(() => $.html());
        if (_.isError(tables)) throw new Error('Failed to parse the HTML for single page.');

        // 这里假设我们有一个函数可以像pd.read_html一样从字符串读取表格
        let temp_df = readHtmlTables(tables, 3, 1).slice(0, 3);
        temp_df.forEach(row => row['品种代码'] = ('000000' + row['品种代码']).slice(-6));
        return temp_df;
    }

    let temp_df = [];
    for (let page = 1; page <= parseInt(page_num); page++) {
        let pageUrl = `https://vip.stock.finance.sina.com.cn/corp/view/vII_NewestComponent.php?page=${page}&indexid=${symbol}`;
        let pageResponse = await axios.get(pageUrl, { responseType: 'text' });
        let $page = cheerio.load(pageResponse.data, { decodeEntities: false });

        // 同样假设readHtmlTables函数存在
        let currentPageDf = readHtmlTables($page.html(), 3, 1).slice(0, 3);
        currentPageDf.forEach(row => row['品种代码'] = ('000000' + row['品种代码']).slice(-6));
        temp_df = temp_df.concat(currentPageDf);
    }
    return temp_df;
}

// 假设函数，用于模拟从HTML字符串读取表格的功能。
function readHtmlTables(html, tableIndex, skipRows) {
    // 实现细节取决于你如何处理HTML表格解析。这可能需要一个专门的库或自定义解析逻辑。
    // 返回值应是一个数组，每个元素代表一行，包含列名作为键。
    // 这个函数需要根据实际使用的库进行具体实现。
    throw new Error("This is a placeholder. Implement the actual table reading logic here.");
}
///中证指数网站-成份股目录
const XLSX = require('xlsx');

async function indexStockConsCsindex(symbol = "000300") {
    /**
     * 中证指数网站-成份股目录
     * https://www.csindex.com.cn/zh-CN/indices/index-detail/000300
     * @param {string} symbol - 指数代码, 可以通过 ak.index_stock_info() 函数获取
     * @returns {Promise<Array>} 最新指数的成份股
     */
    const url = `https://csi-web-dev.oss-cn-shanghai-finance-1-pub.aliyuncs.com/static/html/csindex/public/uploads/file/autofile/cons/${symbol}cons.xls`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const tempData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // 设置列名
        const columns = [
            "日期",
            "指数代码",
            "指数名称",
            "指数英文名称",
            "成分券代码",
            "成分券名称",
            "成分券英文名称",
            "交易所",
            "交易所英文名称",
        ];

        // 调整数据格式
        const formattedData = _.map(tempData, (row) => {
            return _.zipObject(columns, row);
        });

        // 处理日期
        const result = _.map(formattedData, (item) => {
            item['日期'] = dayjs(item['日期'], 'YYYYMMDD').toDate();
            item['指数代码'] = _.padStart(String(item['指数代码']), 6, '0');
            item['成分券代码'] = _.padStart(String(item['成分券代码']), 6, '0');
            return item;
        });

        return result;
    } catch (error) {
        console.error(`Error fetching or processing data: ${error.message}`);
        throw error;
    }
}
///中证指数网站-样本权重
const XLSX = require('xlsx'); // 需要安装 xlsx 库
const dayjs = require('dayjs'); // 需要安装 dayjs 库

async function index_stock_cons_weight_csindex(symbol = "000300") {
    /**
     * 中证指数网站-样本权重
     * https://www.csindex.com.cn/zh-CN/indices/index-detail/000300
     * @param {string} symbol - 指数代码, 可以通过 ak.index_stock_info() 接口获取
     * @return {Promise<Object[]>} 最新指数的成份股权重
     */
    const url = `https://csi-web-dev.oss-cn-shanghai-finance-1-pub.aliyuncs.com/static/html/csindex/public/uploads/file/autofile/closeweight/${symbol}closeweight.xls`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const temp_df = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // 重命名列
        temp_df.forEach(row => {
            row.日期 = dayjs(row.日期, "YYYYMMDD").toDate();
            row.指数代码 = ('000000' + row.指数代码).slice(-6);
            row.成分券代码 = ('000000' + row.成分券代码).slice(-6);
            row.权重 = parseFloat(row.权重) || null; // 处理非数值情况
        });

        return temp_df;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error;
    }
}
///输入股票代码判断股票市场
function stockACodeToSymbol(symbol = "000300") {
    /**
     * 输入股票代码判断股票市场
     * @param {string} symbol - 股票代码
     * @returns {string} 股票市场
     */
    if (symbol.startsWith("6") || symbol.startsWith("900")) {
        return `sh${symbol}`;
    } else {
        return `sz${symbol}`;
    }
}
module.exports = {
    index_stock_cons_sina : index_stock_cons_sina,
    index_stock_info : index_stock_info,
    index_stock_cons : index_stock_cons,
    index_stock_cons_csindex : index_stock_cons_csindex,
    index_stock_cons_weight_csindex : index_stock_cons_weight_csindex,
    stock_a_code_to_symbol : stock_a_code_to_symbol,
};