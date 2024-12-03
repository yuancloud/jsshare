const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///益盟-F10-主营构成
const cheerio = require('cheerio');
// 如果需要处理日期，可以引入dayjs
// 
async function stock_zygc_ym(symbol = "000001") {
    /**
     * 益盟-F10-主营构成
     * @param {string} symbol - 股票代码
     * @returns {Object[]} 返回主营构成的数据
     */
    const url = `http://f10.emoney.cn/f10/zygc/${symbol}`;
    
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let yearList = $('.swlab_t li').map((i, el) => $(el).text().trim()).get();
        
        let bigData = [];
        for (let i = 2; i < yearList.length + 2; i++) {
            // 假设页面上的表格可以直接通过索引访问
            // 这里可能需要额外的逻辑来正确地定位到对应的表格
            let tempTable = $('table').eq(i);  // 此处简化了读取表格的过程
            let rows = tempTable.find('tr');
            let headers = rows.eq(0).find('th, td').map((index, element) => $(element).text().trim()).get();

            for (let j = 1; j < rows.length; j++) {
                let cells = rows.eq(j).find('td').map((index, element) => $(element).text().trim()).get();
                if (cells.length === headers.length) {
                    let rowData = {};
                    for (let k = 0; k < headers.length; k++) {
                        rowData[headers[k]] = cells[k];
                    }
                    rowData['报告期'] = yearList[i - 2];  // 添加报告期
                    bigData.push(rowData);
                }
            }
        }

        // 重新组织数据以匹配所需的输出顺序
        return bigData.map(item => ({
            "报告期": item["报告期"],
            "分类方向": item["分类方向"],
            "分类": item["分类"],
            "营业收入": item["营业收入"],
            "营业收入-同比增长": item["营业收入-同比增长"],
            "营业收入-占主营收入比": item["营业收入-占主营收入比"],
            "营业成本": item["营业成本"],
            "营业成本-同比增长": item["营业成本-同比增长"],
            "营业成本-占主营成本比": item["营业成本-占主营成本比"],
            "毛利率": item["毛利率"],
            "毛利率-同比增长": item["毛利率-同比增长"]
        }));
    } catch (error) {
        console.error(`Error fetching or parsing data: ${error}`);
        throw error;
    }
}
///东方财富网-个股-主营构成

async function stock_zygc_em(symbol = "SH688041") {
    const url = "https://emweb.securities.eastmoney.com/PC_HSF10/BusinessAnalysis/PageAjax";
    const params = { code: symbol };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.zygcfx;

        // 重命名列名
        tempData = _.map(tempData, item => ({
            '股票代码': item.SECURITY_CODE,
            '报告日期': item.REPORT_DATE,
            '分类类型': item.MAINOP_TYPE,
            '主营构成': item.ITEM_NAME,
            '主营收入': item.MAIN_BUSINESS_INCOME,
            '收入比例': item.MBI_RATIO,
            '主营成本': item.MAIN_BUSINESS_COST,
            '成本比例': item.MBC_RATIO,
            '主营利润': item.MAIN_BUSINESS_RPOFIT,
            '利润比例': item.MBR_RATIO,
            '毛利率': item.GROSS_RPOFIT_RATIO,
        }));

        // 选择需要的列
        tempData = _.map(tempData, item => _.pick(item, [
            '股票代码',
            '报告日期',
            '分类类型',
            '主营构成',
            '主营收入',
            '收入比例',
            '主营成本',
            '成本比例',
            '主营利润',
            '利润比例',
            '毛利率'
        ]));

        // 处理日期
        tempData = _.map(tempData, item => ({
            ...item,
            '报告日期': dayjs(item['报告日期']).toDate()
        }));

        // 映射分类类型
        tempData = _.map(tempData, item => ({
            ...item,
            '分类类型': item['分类类型'] === '2' ? '按产品分类' : (item['分类类型'] === '3' ? '按地区分类' : item['分类类型'])
        }));

        // 转换数值
        const numericFields = ['主营收入', '收入比例', '主营成本', '成本比例', '主营利润', '利润比例', '毛利率'];
        tempData = _.map(tempData, item => _.mapValues(item, (value, key) => 
            numericFields.includes(key) ? parseFloat(value) || null : value
        ));

        return tempData;
    } catch (error) {
        console.error(`Error fetching data for symbol ${symbol}:`, error);
        throw error;
    }
}
module.exports = {
    stock_zygc_ym : stock_zygc_ym,
    stock_zygc_em : stock_zygc_em,
};