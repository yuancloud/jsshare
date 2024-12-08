const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///深圳证券交易所-股票列表
const XLSX = require('xlsx');

async function stock_info_sz_name_code(symbol = "A股列表") {
    const indicatorMap = {
        "A股列表": "tab1",
        "B股列表": "tab2",
        "CDR列表": "tab3",
        "AB股列表": "tab4",
    };

    const params = {
        SHOWTYPE: 'xlsx',
        CATALOGID: '1110',
        TABKEY: indicatorMap[symbol],
        random: Math.random().toString().substring(2),
    };

    try {
        const response = await axios.get('https://www.szse.cn/api/report/ShowReport', { params, responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const tempData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
        tempData.forEach((item) => {
            item['A股总股本'] = parseInt(item['A股总股本'].replace(/,/g, ''));
            item['A股流通股本'] = parseInt(item['A股流通股本'].replace(/,/g, ''));
            item['B股总股本'] = parseInt(item['B股总股本'].replace(/,/g, ''));
            item['B股流通股本'] = parseInt(item['B股流通股本'].replace(/,/g, ''));
            item['A股上市日期'] = item['A股上市日期']?.replace(/-/g, '')
        })
        return tempData;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
/**
 * 获取上海证券交易所-股票列表
 * @param {string} symbol - 选择 {"主板A股": "1", "主板B股": "2", "科创板": "8"}
 * @returns {Promise<Array>} 指定indicator的数据
 */
async function stock_info_sh_name_code(symbol = "主板A股") {
    const indicatorMap = { "主板A股": "1", "主板B股": "2", "科创板": "8" };
    const url = "https://query.sse.com.cn/sseQuery/commonQuery.do";
    const headers = {
        "Host": "query.sse.com.cn",
        "Pragma": "no-cache",
        "Referer": "https://www.sse.com.cn/assortment/stock/list/share/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
    };
    const params = {
        STOCK_TYPE: indicatorMap[symbol],
        REG_PROVINCE: "",
        CSRC_CODE: "",
        STOCK_CODE: "",
        sqlId: "COMMON_SSE_CP_GPJCTPZ_GPLB_GP_L",
        COMPANY_STATUS: "2,4,5,7,8",
        type: "inParams",
        isPagination: "true",
        "pageHelp.cacheSize": "1",
        "pageHelp.beginPage": "1",
        "pageHelp.pageSize": "10000",
        "pageHelp.pageNo": "1",
        "pageHelp.endPage": "1",
        _: "1653291270045" // 这个时间戳可能需要动态生成
    };

    try {
        const response = await axios.get(url, { headers, params });
        const reords = response.data?.result;

        let result = reords.map(item => ({
            "证券代码": item.A_STOCK_CODE ? item.A_STOCK_CODE : item.B_STOCK_CODE,
            "公司简称（英文）": item.COMPANY_ABBR_EN,
            "上市板块": item.LIST_BOARD,
            "公司简称": item.COMPANY_ABBR,
            "退市日期": item.DELIST_DATE == '-' ? "" : item.DELIST_DATE?.replace(/-/g, ''),
            "编号": item.NUM,
            "证券名称（中文）": item.SEC_NAME_CN,
            "公司全称（英文）": item.FULL_NAME_IN_ENGLISH,
            "证券全称": item.SEC_NAME_FULL,
            "B股代码": item.B_STOCK_CODE == "-" ? "" : item.B_STOCK_CODE,
            "上市日期": item.LIST_DATE?.replace(/-/g, ''),
            "产品状态": item.PRODUCT_STATUS,
            "公司代码": item.COMPANY_CODE,
            "公司全称": item.FULL_NAME
        }));

        return result;
    } catch (error) {
        console.error("Error fetching stock information:", error);
        throw error;
    }
}
///北京证券交易所-股票列表

async function stock_info_bj_name_code() {
    const url = "https://www.bse.cn/nqxxController/nqxxCnzq.do";
    const payload = {
        page: "0",
        typejb: "T",
        xxfcbj: ["2"],
        xxzqdm: "",
        sortfield: "xxzqdm",
        sorttype: "asc"
    };
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    };

    try {
        let { data: response } = await axios.post(url, new URLSearchParams(payload), { headers });
        let dataText = response;
        let dataJson = JSON.parse(dataText.substring(dataText.indexOf("["), -1));
        let totalPages = dataJson[0].totalPages;
        let bigDf = [];

        for (let page = 0; page < totalPages; page++) {
            payload.page = page.toString();
            let { data: responseData } = await axios.post(url, new URLSearchParams(payload), { headers });
            dataText = responseData;
            dataJson = JSON.parse(dataText.substring(dataText.indexOf("["), -1));
            let tempDf = dataJson[0].content;
            bigDf = bigDf.concat(tempDf);
        }

        // 重命名列
        bigDf = bigDf.map(row => ({
            "证券代码": row[39],
            "证券简称": row[41],
            "总股本": row[36],
            "流通股本": row[10],
            "上市日期": row[0]?.replace(/-/g, ''),
            "所属行业": row[16],
            "地区": row[26],
            "报告日期": row[21]?.replace(/-/g, '')
        }));

        return bigDf;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
///上海证券交易所-终止上市公司

async function stock_info_sh_delist(symbol = "全部") {
    const symbolMap = {
        "全部": "1,2,8",
        "沪市": "1,2",
        "科创板": "8",
    };

    const url = "https://query.sse.com.cn/commonQuery.do";
    const headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Host": "query.sse.com.cn",
        "Pragma": "no-cache",
        "Referer": "https://www.sse.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36"
    };
    const params = {
        sqlId: "COMMON_SSE_CP_GPJCTPZ_GPLB_GP_L",
        isPagination: "true",
        STOCK_CODE: "",
        CSRC_CODE: "",
        REG_PROVINCE: "",
        STOCK_TYPE: symbolMap[symbol],
        COMPANY_STATUS: "3",
        type: "inParams",
        "pageHelp.cacheSize": "1",
        "pageHelp.beginPage": "1",
        "pageHelp.pageSize": "500",
        "pageHelp.pageNo": "1",
        "pageHelp.endPage": "1",
        _: "1643035608183"
    };

    try {
        const response = await axios.get(url, { headers, params });
        const dataJson = response.data;
        let tempData = dataJson.result.map(item => ({
            "公司代码": item.COMPANY_CODE,
            "公司简称": item.COMPANY_ABBR,
            "上市日期": dayjs(item.LIST_DATE).toDate(),
            "暂停上市日期": dayjs(item.DELIST_DATE).toDate()
        }));

        // 将日期转换为YYYYMMDD格式
        tempData = tempData.map(item => ({
            ...item,
            "上市日期": dayjs(item["上市日期"]).format("YYYYMMDD"),
            "暂停上市日期": dayjs(item["暂停上市日期"]).format("YYYYMMDD")
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///深证证券交易所-暂停上市公司-终止上市公司

async function stock_info_sz_delist(symbol = "暂停上市公司") {
    /**
     * 深证证券交易所-暂停上市公司-终止上市公司
     * @param {string} symbol - 选项 {"暂停上市公司", "终止上市公司"}
     * @returns {Promise<Array>} 返回暂停上市公司或终止上市公司的数据
     */
    const indicatorMap = { "暂停上市公司": "tab1", "终止上市公司": "tab2" };
    const url = "https://www.szse.cn/api/report/ShowReport";
    const params = {
        SHOWTYPE: "xlsx",
        CATALOGID: "1793_ssgs",
        TABKEY: indicatorMap[symbol],
        random: Math.random().toString(36).substring(2, 15)
    };

    try {
        const response = await axios.get(url, { params, responseType: 'arraybuffer' });
        const data = new Uint8Array(response.data);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const tempData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (_.isEmpty(tempData)) {
            return [];
        }

        // 处理数据
        const processedData = _.map(tempData, (item) => {
            return {
                ...item,
                '证券代码': _.padStart(item['证券代码'].toString(), 6, '0'),
                '上市日期': dayjs(item['上市日期']).format('YYYYMMDD'),
                '终止上市日期': dayjs(item['终止上市日期']).format('YYYYMMDD')
            };
        });

        return processedData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者你可以选择返回一个空数组或者其他错误处理方式
    }
}

///深证证券交易所-市场数据-股票数据-名称变更
async function stock_info_sz_change_name(symbol = "全称变更") {
    /**
     * 深证证券交易所-市场数据-股票数据-名称变更
     * https://www.szse.cn/www/market/stock/changename/index.html
     * @param {string} symbol - 变更类型的选择 {"全称变更": "tab1", "简称变更": "tab2"}
     * @returns {Promise<Array>} 名称变更数据
     */
    const indicatorMap = { "全称变更": "tab1", "简称变更": "tab2" };
    const url = "https://www.szse.cn/api/report/ShowReport";
    const params = new URLSearchParams({
        SHOWTYPE: 'xlsx',
        CATALOGID: 'SSGSGMXX',
        TABKEY: indicatorMap[symbol],
        random: Math.random().toString(36).substring(2, 15)
    });

    try {
        const response = await axios.get(url, { params: params, responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const tempData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // 处理数据
        const result = tempData.map(item => {
            return {
                ...item,
                "证券代码": item["证券代码"].toString().padStart(6, '0'),
                "变更日期": dayjs(item["变更日期"]).toDate()
            };
        }).sort((a, b) => dayjs(a["变更日期"]).isBefore(dayjs(b["变更日期"])) ? -1 : 1);

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///新浪财经-股票曾用名
const cheerio = require('cheerio');

async function stock_info_change_name(symbol = "000503") {
    /**
     * 新浪财经-股票曾用名
     * @param {string} symbol 股票代码
     * @return {Promise<Array>} 股票曾用名列表
     */
    const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vCI_CorpInfo/stockid/${symbol}.phtml`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const table = $('table').eq(2); // 注意：这里索引可能需要调整，以匹配Python代码中的[3]
        const rows = [];
        table.find('tr').each((index, row) => {
            if (index > 0) { // 跳过表头
                const cells = $(row).find('td');
                if (cells.length >= 2) {
                    const item = $(cells[0]).text().trim();
                    const value = $(cells[1]).text().trim();
                    if (item && value) {
                        rows.push({ item, value });
                    }
                }
            }
        });

        const nameListRow = rows.find(row => row.item.includes("证券简称更名历史"));
        if (nameListRow) {
            const nameList = nameListRow.value.split(/\s+/).filter(name => name !== '');
            const bigDf = nameList.map((name, index) => ({ index: index + 1, name }));
            return bigDf;
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}
///沪深京 A 股列表
function stock_info_a_code_name() {
    /**
     * 沪深京 A 股列表
     * @returns {Array} 沪深京 A 股数据
     */
    let bigDF = [];

    // 获取上海主板A股信息
    let stockSH = stockInfoShNameCode("主板A股");
    stockSH = _.map(stockSH, item => ({
        "证券代码": item.证券代码,
        "证券简称": item.证券简称
    }));

    // 获取深圳A股信息
    let stockSZ = stockInfoSzNameCode("A股列表");
    stockSZ = _.map(stockSZ, item => ({
        "A股代码": _.padStart(item["A股代码"].toString(), 6, '0'),
        "A股简称": item["A股简称"]
    }));
    bigDF = _.concat(bigDF, stockSZ);
    bigDF = _.map(bigDF, item => ({
        "证券代码": item["A股代码"],
        "证券简称": item["A股简称"]
    }));

    // 获取科创板信息
    let stockKCB = stockInfoShNameCode("科创板");
    stockKCB = _.map(stockKCB, item => ({
        "证券代码": item.证券代码,
        "证券简称": item.证券简称
    }));
    bigDF = _.concat(bigDF, stockKCB);

    // 获取北京证券交易所信息
    let stockBSE = stockInfoBjNameCode();
    stockBSE = _.map(stockBSE, item => ({
        "证券代码": item.证券代码,
        "证券简称": item.证券简称
    }));
    bigDF = _.concat(bigDF, stockBSE);

    // 重命名列
    bigDF = _.map(bigDF, item => ({
        code: item.证券代码,
        name: item.证券简称
    }));

    return bigDF;
}
module.exports = {
    stock_info_sz_name_code: stock_info_sz_name_code,
    stock_info_sh_name_code: stock_info_sh_name_code,
    stock_info_bj_name_code: stock_info_bj_name_code,
    stock_info_sh_delist: stock_info_sh_delist,
    stock_info_sz_delist: stock_info_sz_delist,
    stock_info_sz_change_name: stock_info_sz_change_name,
    stock_info_change_name: stock_info_change_name,
    stock_info_a_code_name: stock_info_a_code_name,
};