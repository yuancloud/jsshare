const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///沐甜科技数据中心-中国食糖指数

async function index_sugar_msweet() {
    /**
     * 沐甜科技数据中心-中国食糖指数
     * https://www.msweet.com.cn/mtkj/sjzx13/index.html
     * @returns {Promise<Array>} 中国食糖指数
     */
    const url = "https://www.msweet.com.cn/eportal/ui";
    const params = new URLSearchParams({
        "struts.portlet.action": "/portlet/price!getSTZSJson.action",
        "moduleId": "cb752447cfe24b44b18c7a7e9abab048"
    });

    try {
        const response = await axios.get(url, { params: params });
        const dataJson = response.data;
        const category = _.map(dataJson.category, (item) => [item]);
        const data = _.map(dataJson.data, (item) => [item]);
        let temp_df = _.zipWith(category, data, (a, b) => a.concat(b));
        
        // 设置列名
        temp_df = temp_df.map(row => ({
            日期: row[0],
            综合价格: row[1],
            原糖价格: row[2],
            现货价格: row[3]
        }));

        // 修正数据源错误
        if (temp_df[3226]) {
            temp_df[3226].原糖价格 = 12.88;
        }

        // 处理日期和数值
        temp_df = temp_df.map(item => ({
            日期: dayjs(item.日期).toDate(),
            综合价格: parseFloat(item.综合价格) || null,
            原糖价格: parseFloat(item.原糖价格) || null,
            现货价格: parseFloat(item.现货价格) || null
        }));

        return temp_df;
    } catch (error) {
        console.error("Error fetching sugar index:", error);
        throw error;
    }
}
///沐甜科技数据中心-配额内进口糖估算指数

async function indexInnerQuoteSugarMsweet() {
    /**
     * 沐甜科技数据中心-配额内进口糖估算指数
     * https://www.msweet.com.cn/mtkj/sjzx13/index.html
     * @return {Array} 配额内进口糖估算指数
     */
    const url = "https://www.msweet.com.cn/datacenterapply/datacenter/json/JinKongTang.json";
    
    try {
        const response = await axios.get(url);
        let dataJson = response.data;
        
        // 合并category和data数组
        let tempData = dataJson.category.map((cat, i) => ({...cat, ...dataJson.data[i]}));
        
        // 设置列名
        const columns = [
            "日期", "利润空间", "泰国糖", "泰国MA5", "巴西MA5", "利润MA5",
            "巴西MA10", "巴西糖", "柳州现货价", "广州现货价", "泰国MA10", "利润MA30", "利润MA10"
        ];
        
        // 修正特定行的数据源错误
        if (tempData[988]) tempData[988]["泰国糖"] = 4045.2;

        // 调整日期格式
        tempData.forEach(row => {
            row["日期"] = dayjs(row["日期"].replace(/\//g, '-')).format('YYYY-MM-DD');
        });

        // 将数值字段转换为数字
        ["利润空间", "泰国糖", "泰国MA5", "巴西MA5", "巴西MA10", "巴西糖", 
         "柳州现货价", "广州现货价", "泰国MA10", "利润MA30", "利润MA10"].forEach(fieldName => {
            tempData = tempData.map(row => ({
                ...row,
                [fieldName]: parseFloat(row[fieldName]) || null
            }));
        });

        return tempData;
    } catch (error) {
        console.error("Error fetching or processing data: ", error);
        throw error; // 或者返回一个空数组或错误对象
    }
}
///沐甜科技数据中心-配额外进口糖估算指数

async function index_outer_quote_sugar_msweet() {
    /**
     * 沐甜科技数据中心-配额外进口糖估算指数
     * https://www.msweet.com.cn/mtkj/sjzx13/index.html
     * @returns {Array} 配额内进口糖估算指数
     */
    const url = "https://www.msweet.com.cn/datacenterapply/datacenter/json/Jkpewlr.json";
    
    try {
        const response = await axios.get(url);
        const dataJson = response.data;
        
        // 将category和data合并成一个二维数组
        const tempData = dataJson.category.map((category, i) => [
            category,
            ...dataJson.data[i]
        ]);

        // 设置列名
        const columns = ["日期", "巴西糖进口成本", "泰国糖进口利润空间", "巴西糖进口利润空间", "泰国糖进口成本", "日照现货价"];
        
        // 转换数据格式
        const tempDf = tempData.map(row => ({
            日期: row[0].replace(/\//g, '-'),
            巴西糖进口成本: parseFloat(row[1]) || null,
            泰国糖进口利润空间: parseFloat(row[2]) || null,
            巴西糖进口利润空间: parseFloat(row[3]) || null,
            泰国糖进口成本: parseFloat(row[4]),
            日照现货价: parseFloat(row[5]) || null
        }));

        // 转换日期格式
        tempDf.forEach(item => {
            item.日期 = dayjs(item.日期, 'YYYY-MM-DD').toDate();
        });

        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个错误响应
    }
}
module.exports = {
    index_sugar_msweet : index_sugar_msweet,
    index_inner_quote_sugar_msweet : index_inner_quote_sugar_msweet,
    index_outer_quote_sugar_msweet : index_outer_quote_sugar_msweet,
};