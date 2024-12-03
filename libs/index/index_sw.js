const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///乐咕乐股-申万一级-分类
const cheerio = require('cheerio');

async function sw_index_first_info() {
    const url = "https://legulegu.com/stockdata/sw-industry-overview";
    try {
        const response = await axios.get(url, { headers: headers });
        const $ = cheerio.load(response.data);
        const codeRaw = $('#level1Items .lg-industries-item-chinese-title').toArray();
        const nameRaw = $('#level1Items .lg-industries-item-number').toArray();
        const valueRaw = $('#level1Items .lg-sw-industries-item-value').toArray();

        const code = codeRaw.map(item => $(item).text());
        const name = nameRaw.map(item => $(item).text().split('(')[0]);
        const num = nameRaw.map(item => $(item).text().split('(')[1].split(')')[0]);
        const num1 = valueRaw.map(item => $(item).find('.value').eq(0).text().trim());
        const num2 = valueRaw.map(item => $(item).find('.value').eq(1).text().trim());
        const num3 = valueRaw.map(item => $(item).find('.value').eq(2).text().trim());
        const num4 = valueRaw.map(item => $(item).find('.value').eq(3).text().trim());

        // 构建临时数据结构
        const tempData = [];
        for (let i = 0; i < code.length; i++) {
            tempData.push({
                '行业代码': code[i],
                '行业名称': name[i],
                '成份个数': parseInt(num[i], 10) || null,
                '静态市盈率': parseFloat(num1[i]) || null,
                'TTM(滚动)市盈率': parseFloat(num2[i]) || null,
                '市净率': parseFloat(num3[i]) || null,
                '静态股息率': parseFloat(num4[i]) || null
            });
        }

        return tempData;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}

// 注意：这里没有包含headers变量的定义，你需要根据实际情况自行定义。
///乐咕乐股-申万二级-分类
const cheerio = require('cheerio');

async function sw_index_second_info() {
    const url = "https://legulegu.com/stockdata/sw-industry-overview";
    try {
        const response = await axios.get(url, { headers: {} });
        const $ = cheerio.load(response.data);
        
        const codeRaw = $('#level2Items .lg-industries-item-chinese-title').get();
        const nameRaw = $('#level2Items .lg-industries-item-number').get();
        const valueRaw = $('#level2Items .lg-sw-industries-item-value').get();

        const code = _.map(codeRaw, item => $(item).text());
        const name = _.map(nameRaw, item => $(item).text().split('(')[0]);
        const num = _.map(nameRaw, item => $(item).text().split('(')[1].split(')')[0]);

        const num1 = _.map(valueRaw, item => $(item).find('.value').eq(0).text().trim());
        const num2 = _.map(valueRaw, item => $(item).find('.value').eq(1).text().trim());
        const num3 = _.map(valueRaw, item => $(item).find('.value').eq(2).text().trim());
        const num4 = _.map(valueRaw, item => $(item).find('.value').eq(3).text().trim());

        // 创建临时数据结构
        const tempData = [code, name, num, num1, num2, num3, num4];
        const columns = ["行业代码", "行业名称", "成份个数", "静态市盈率", "TTM(滚动)市盈率", "市净率", "静态股息率"];
        const tempDf = _.zip(...tempData).map(row => _.zipObject(columns, row));

        // 将特定列转换为数值类型
        tempDf.forEach(row => {
            ['成份个数', '静态市盈率', 'TTM(滚动)市盈率', '市净率', '静态股息率'].forEach(key => {
                row[key] = parseFloat(row[key]) || null;
            });
        });

        return tempDf;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}
///乐咕乐股-申万三级-分类
const cheerio = require('cheerio');

async function sw_index_third_info() {
    const url = "https://legulegu.com/stockdata/sw-industry-overview";
    try {
        const response = await axios.get(url, { headers: {} });
        const $ = cheerio.load(response.data);
        
        const codeRaw = $('#level3Items .lg-industries-item-chinese-title').toArray();
        const nameRaw = $('#level3Items .lg-industries-item-number').toArray();
        const valueRaw = $('#level3Items .lg-sw-industries-item-value').toArray();

        const code = _.map(codeRaw, item => $(item).text());
        const name = _.map(nameRaw, item => $(item).text().split('(')[0]);
        const num = _.map(nameRaw, item => $(item).text().split('(')[1].split(')')[0]);
        const num1 = _.map(valueRaw, item => $(item).find('.value').eq(0).text().trim());
        const num2 = _.map(valueRaw, item => $(item).find('.value').eq(1).text().trim());
        const num3 = _.map(valueRaw, item => $(item).find('.value').eq(2).text().trim());
        const num4 = _.map(valueRaw, item => $(item).find('.value').eq(3).text().trim());

        const tempData = _.zip(code, name, num, num1, num2, num3, num4);
        const columns = ["行业代码", "行业名称", "成份个数", "静态市盈率", "TTM(滚动)市盈率", "市净率", "静态股息率"];
        const tempDf = _.map(tempData, row => _.zipObject(columns, row));

        // 转换数字类型
        const convertToNumeric = (value) => !isNaN(value) ? parseFloat(value) : null;
        for (let row of tempDf) {
            row["成份个数"] = convertToNumeric(row["成份个数"]);
            row["静态市盈率"] = convertToNumeric(row["静态市盈率"]);
            row["TTM(滚动)市盈率"] = convertToNumeric(row["TTM(滚动)市盈率"]);
            row["市净率"] = convertToNumeric(row["市净率"]);
            row["静态股息率"] = convertToNumeric(row["静态股息率"]);
        }

        return tempDf;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
///乐咕乐股-申万三级-行业成份
const cheerio = require('cheerio');
const csv = require('fast-csv');
const fs = require('fs');

async function sw_index_third_cons(symbol = "801120.SI") {
    const url = `https://legulegu.com/stockdata/index-composition?industryCode=${symbol}`;
    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        const table = $('table').eq(0); // 假设我们需要的第一个表格
        let rows = [];
        table.find('tr').each((i, el) => {
            let row = [];
            $(el).find('td, th').each((j, cell) => {
                row.push($(cell).text().trim());
            });
            if (row.length > 0) rows.push(row);
        });

        // 定义列名
        const columns = [
            "序号",
            "股票代码",
            "股票简称",
            "纳入时间",
            "申万1级",
            "申万2级",
            "申万3级",
            "价格",
            "市盈率",
            "市盈率ttm",
            "市净率",
            "股息率",
            "市值",
            "归母净利润同比增长(09-30)",
            "归母净利润同比增长(06-30)",
            "营业收入同比增长(09-30)",
            "营业收入同比增长(06-30)"
        ];

        // 处理数据
        const temp_df = rows.slice(1).map(row => {
            return columns.reduce((acc, col, index) => {
                acc[col] = row[index];
                return acc;
            }, {});
        }).map(item => {
            // 转换数字类型
            ["价格", "市盈率", "市盈率ttm", "市净率", "股息率", "市值"].forEach(key => {
                item[key] = parseFloat(item[key]) || null;
            });
            // 清除百分比符号并转换为数字
            ["股息率", "归母净利润同比增长(09-30)", "归母净利润同比增长(06-30)", "营业收入同比增长(09-30)", "营业收入同比增长(06-30)"].forEach(key => {
                item[key] = parseFloat(item[key].replace('%', '')) || null;
            });
            return item;
        });

        return temp_df;
    } catch (error) {
        console.error(error);
    }
}

// 导出函数，以便在其他地方使用
module.exports = sw_index_third_cons;
module.exports = {
    sw_index_first_info : sw_index_first_info,
    sw_index_second_info : sw_index_second_info,
    sw_index_third_info : sw_index_third_info,
    sw_index_third_cons : sw_index_third_cons,
};