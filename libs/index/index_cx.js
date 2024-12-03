const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///财新数据-指数报告-财新中国 PMI-综合 PMI
require('dayjs/plugin/utc'); // 导入UTC插件
require('dayjs/plugin/timezone'); // 导入时区插件
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

async function index_pmi_com_cx() {
    /**
     * 财新数据-指数报告-财新中国 PMI-综合 PMI
     * https://yun.ccxe.com.cn/indices/pmi
     * @return {Array} 财新中国 PMI-综合 PMI 数据
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "com" };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.data.map(item => ({
            '变化值': item.change,
            '综合PMI': item.pmi,
            '日期': item.date
        }));

        // 重新排序列
        tempData = tempData.map(item => ({
            '日期': dayjs.unix(item.日期 / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD'),
            '综合PMI': item.综合PMI,
            '变化值': item.变化值
        }));

        return tempData;
    } catch (error) {
        console.error(`请求错误: ${error}`);
        throw error; // 或者你可以选择返回一个空数组或默认值
    }
}
///财新数据-指数报告-财新中国 PMI-制造业 PMI
require('dayjs/plugin/utc'); // 导入UTC插件
require('dayjs/plugin/timezone'); // 导入时区插件
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

async function index_pmi_man_cx() {
    /**
     * 财新数据-指数报告-财新中国 PMI-制造业 PMI
     * @returns {Array} 财新中国 PMI-制造业 PMI
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "man" };

    try {
        const response = await axios.get(url, { params });
        const data = response.data;
        let tempData = data.data.map(item => ({
            "变化值": item.change,
            "制造业PMI": item.pmi,
            "日期": item.date
        }));

        // 重新排列列的顺序
        tempData = tempData.map(row => ({
            "日期": dayjs.utc(row.日期, 'X').tz("Asia/Shanghai").format('YYYY-MM-DD'),
            "制造业PMI": row.制造业PMI,
            "变化值": row.变化值
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个空数组或其他默认值
    }
}
///财新数据-指数报告-财新中国 PMI-服务业 PMI
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone'); // 用于时区转换

// 使用插件
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_pmi_ser_cx() {
    /**
     * 财新数据-指数报告-财新中国 PMI-服务业 PMI
     * https://yun.ccxe.com.cn/indices/pmi
     * @return {Array} 财新中国 PMI-服务业 PMI 数据数组
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "ser" };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.data.map(item => ({
            变化值: item.变化值,
            服务业PMI: item.服务业PMI,
            日期: dayjs(item.日期).tz("Asia/Shanghai").format('YYYY-MM-DD')
        }));

        // 确保列顺序正确
        tempData = tempData.map(({ 日期, 服务业PMI, 变化值 }) => ({ 日期, 服务业PMI, 变化值 }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者可以选择返回一个空数组或错误信息
    }
}
///财新数据-指数报告-数字经济指数
require('dayjs/plugin/timezone'); // 导入timezone插件
require('dayjs/plugin/utc'); // 导入UTC插件
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));

async function index_dei_cx() {
    /**
     * 财新数据-指数报告-数字经济指数
     * https://yun.ccxe.com.cn/indices/dei
     * @returns {Array} 数字经济指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "dei" };
    
    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        
        let tempData = dataJson.data.map(item => ({
            日期: item.date,
            数字经济指数: item.index,
            变化值: item.change
        }));
        
        // 将日期转换为Asia/Shanghai时区
        tempData = tempData.map(item => ({
            ...item,
            日期: dayjs.unix(item.日期 / 1000).tz('Asia/Shanghai').format('YYYY-MM-DD')
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者你可以选择如何处理这个错误
    }
}
///财新数据-指数报告-产业指数
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Extend dayjs with the required plugins
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_ii_cx() {
    /**
     * 财新数据-指数报告-产业指数
     * https://yun.ccxe.com.cn/indices/dei
     * @returns {Promise<Array>} 产业指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "ii" };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempArray = dataJson.data.map(item => ({
            变化值: item['变化值'],
            产业指数: item['产业指数'],
            日期: item['日期']
        }));

        // Reorder the properties
        tempArray = tempArray.map(item => ({
            日期: dayjs.unix(item.日期 / 1000).tz('Asia/Shanghai').format('YYYY-MM-DD'),
            产业指数: item.产业指数,
            变化值: item.变化值
        }));

        return tempArray;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///财新数据-指数报告-溢出指数
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone'); // Import timezone plugin

// Use plugins
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_si_cx() {
    /**
     * 财新数据-指数报告-溢出指数
     * https://yun.ccxe.com.cn/indices/dei
     * @return {Promise<Array>} 溢出指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "si" };
    
    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        
        let temp_df = dataJson.data.map(item => ({
            变化值: item['变化值'],
            溢出指数: item['溢出指数'],
            日期: item['日期']
        }));
        
        // Reorder and transform date
        temp_df = temp_df.map(row => ({
            日期: dayjs.unix(row.日期 / 1000).tz('Asia/Shanghai').format('YYYY-MM-DD'),
            溢出指数: row.溢出指数,
            变化值: row.变化值
        }));

        return temp_df;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个空数组或错误信息
    }
}
///财新数据-指数报告-融合指数
require('dayjs/plugin/utc'); // 导入UTC插件
require('dayjs/plugin/timezone'); // 导入时区插件
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

async function index_fi_cx() {
    /**
     * 财新数据-指数报告-融合指数
     * https://yun.ccxe.com.cn/indices/dei
     * @returns {Array} - 返回融合指数的数据
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "fi" };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let temp_df = dataJson.data.map(item => ({
            "变化值": item.change,
            "融合指数": item.index,
            "日期": item.date
        }));

        // 重新排序列
        temp_df = temp_df.map(row => ({
            "日期": row.日期,
            "融合指数": row.融合指数,
            "变化值": row.变化值
        }));

        // 转换日期格式
        temp_df = temp_df.map(row => ({
            ...row,
            "日期": dayjs.unix(row.日期 / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD')
        }));

        return temp_df;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error; // 或者返回一个默认值或错误信息
    }
}
///财新数据-指数报告-基础指数
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone'); // 用于时区转换

// 使用dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_bi_cx() {
    /**
     * 财新数据-指数报告-基础指数
     * https://yun.ccxe.com.cn/indices/dei
     * @return {Array} 基础指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "bi" };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.data;

        // 重命名列
        tempData = tempData.map(item => ({
            日期: item.date,
            基础指数: item.baseIndex,
            变化值: item.changeValue
        }));

        // 选择需要的列
        tempData = tempData.map(item => ({
            日期: dayjs.utc(item.日期, 'X').tz('Asia/Shanghai').format('YYYY-MM-DD'),
            基础指数: item.基础指数,
            变化值: item.变化值
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需要处理错误
    }
}
///财新数据-指数报告-中国新经济指数
const utc = require('dayjs/plugin/utc'); // 导入UTC插件
const timezone = require('dayjs/plugin/timezone'); // 导入时区插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 假设存在一个名为 DataFrame 的类，用于处理类似 pandas 的数据结构
// 例如：const { DataFrame } = require('some-pandas-like-library');

async function index_nei_cx() {
    /**
     * 财新数据-指数报告-中国新经济指数
     * https://yun.ccxe.com.cn/indices/nei
     * @return {DataFrame} 中国新经济指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "nei" };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempDf = new DataFrame(dataJson.data);  // 创建DataFrame对象
        tempDf.columns = ["变化值", "中国新经济指数", "日期"];
        
        // 重新排列列顺序
        tempDf = tempDf.select(["日期", "中国新经济指数", "变化值"]);

        // 处理日期
        tempDf["日期"] = tempDf["日期"].map(date => 
            dayjs.unix(date / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD')
        );

        return tempDf;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;  // 或者你可以选择以其他方式处理错误
    }
}
///财新数据-指数报告-劳动力投入指数
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

async function index_li_cx() {
    /**
     * 财新数据-指数报告-劳动力投入指数
     * https://yun.ccxe.com.cn/indices/nei
     * @return {Array} 劳动力投入指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: 'li' };
    
    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let temp_df = _.map(dataJson.data, item => ({
            日期: dayjs(item.date).tz('Asia/Shanghai').format('YYYY-MM-DD'),
            '劳动力投入指数': item.index,
            '变化值': item.change
        }));
        
        // 假设原始JSON数据中的字段名是date, index, change
        // 如果实际字段名不同，请相应调整
        // 重新排序列以匹配指定顺序
        temp_df = _.map(temp_df, ({ 日期, '劳动力投入指数': 劳动力投入指数, '变化值': 变化值 }) => ({
            日期,
            劳动力投入指数,
            变化值
        }));

        return temp_df;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // 或者根据需要处理错误
    }
}
///财新数据-指数报告-资本投入指数
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_ci_cx() {
    /**
     * 财新数据-指数报告-资本投入指数
     * https://yun.ccxe.com.cn/indices/nei
     * @returns {Promise<Array>} 资本投入指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "ci" };
    
    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let temp_df = dataJson.data;  // 假设dataJson.data是一个数组

        // 重命名列
        temp_df = temp_df.map(item => ({
            日期: item.date,
            '资本投入指数': item.index,
            '变化值': item.change
        }));

        // 重新排序列
        temp_df = temp_df.map(item => ({
            日期: item.日期,
            '资本投入指数': item['资本投入指数'],
            '变化值': item['变化值']
        }));

        // 转换日期格式
        temp_df.forEach(item => {
            item.日期 = dayjs.unix(item.日期 / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD');
        });

        return temp_df;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
///财新数据-指数报告-科技投入指数
require('dayjs/plugin/utc'); // 导入UTC插件
require('dayjs/plugin/timezone'); // 导入时区插件
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

async function index_ti_cx() {
    /**
     * 财新数据-指数报告-科技投入指数
     * https://yun.ccxe.com.cn/indices/nei
     * @return {Array} 科技投入指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "ti" };
    
    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.data.map(item => ({
            变化值: item['变化值'],
            '科技投入指数': item['科技投入指数'],
            日期: dayjs.unix(item.日期 / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD')
        }));

        // 重新排序列
        tempData = tempData.map(item => ({
            日期: item.日期,
            '科技投入指数': item['科技投入指数'],
            变化值: item.变化值
        }));
        
        return tempData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // 或者返回一个空数组或其他错误处理方式
    }
}
///财新数据-指数报告-新经济行业入职平均工资水平
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

async function index_neaw_cx() {
    /**
     * 财新数据-指数报告-新经济行业入职平均工资水平
     * https://yun.ccxe.com.cn/indices/nei
     * @return {Array} 新经济行业入职平均工资水平
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "neaw" };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempDf = dataJson.data.map(item => ({
            '变化值': item['change'],
            '新经济行业入职平均工资水平': item['value'],
            '日期': item['date']
        }));

        // 重排列顺序
        tempDf = tempDf.map(row => ({
            '日期': row['日期'],
            '新经济行业入职平均工资水平': row['新经济行业入职平均工资水平'],
            '变化值': row['变化值']
        }));

        // 转换日期格式
        tempDf.forEach(row => {
            row['日期'] = dayjs.unix(row['日期'] / 1000).tz('Asia/Shanghai').format('YYYY-MM-DD');
        });

        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需要处理错误
    }
}
///财新数据-指数报告-新经济入职工资溢价水平
const utc = require('dayjs/plugin/utc'); // 导入UTC插件
const timezone = require('dayjs/plugin/timezone'); // 导入时区插件
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_awpr_cx() {
    /**
     * 财新数据-指数报告-新经济入职工资溢价水平
     * https://yun.ccxe.com.cn/indices/nei
     * @return {Array} 新经济入职工资溢价水平
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = { type: "awpr" };
    
    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.data;

        // 重命名列名
        tempData = tempData.map(item => ({
            日期: item.date,
            '新经济入职工资溢价水平': item.value,
            变化值: item.change
        }));

        // 重新排序列
        tempData = _.map(tempData, (item) => ({
            日期: item.日期,
            '新经济入职工资溢价水平': item['新经济入职工资溢价水平'],
            变化值: item.变化值
        }));

        // 处理日期
        tempData = tempData.map(item => ({
            ...item,
            日期: dayjs.unix(item.日期 / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD')
        }));

        return tempData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
///财新数据-指数报告-大宗商品指数
const utc = require('dayjs/plugin/utc'); // 导入UTC插件
const timezone = require('dayjs/plugin/timezone'); // 导入时区插件
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_cci_cx() {
    /**
     * 财新数据-指数报告-大宗商品指数
     * https://yun.ccxe.com.cn/indices/nei
     * @returns {Promise<*>} 大宗商品指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = {
        type: "cci",
        code: "1000050",
        month: "-1",
    };
    
    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempDf = new dfd.DataFrame(dataJson.data); // 假设dfd是danfojs的DataFrame构造函数
        tempDf.columns = ["变化值", "大宗商品指数", "日期"];
        
        // 重新排序列
        tempDf = tempDf.select(["日期", "大宗商品指数", "变化值"]);
        
        // 处理日期
        tempDf["日期"] = tempDf["日期"].map((timestamp) => {
            return dayjs.unix(timestamp / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD');
        });

        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个错误对象或空DataFrame等
    }
}
///财新数据-指数报告-高质量因子
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone'); // Import the timezone plugin
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_qli_cx() {
    /**
     * 财新数据-指数报告-高质量因子
     * https://yun.ccxe.com.cn/indices/qli
     * @returns {Array} 高质量因子
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = new URLSearchParams({
        type: "qli",
        code: "1000050",
        month: "-1",
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempDf = dataJson.data.map(item => ({
            "变化幅度": item.change,
            "高质量因子指数": item.index,
            "日期": item.date
        }));

        // 重新排序列
        tempDf = tempDf.map(item => ({
            "日期": item.日期,
            "高质量因子指数": item.高质量因子指数,
            "变化幅度": item.变化幅度
        }));

        // 处理日期格式
        tempDf.forEach(item => {
            item.日期 = dayjs.unix(item.日期 / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD');
        });

        return tempDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///财新数据-指数报告-AI策略指数
const utc = require('dayjs/plugin/utc'); // 导入UTC插件
const timezone = require('dayjs/plugin/timezone'); // 导入时区插件

// 使用插件
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_ai_cx() {
    /**
     * 财新数据-指数报告-AI策略指数
     * https://yun.ccxe.com.cn/indices/ai
     * @return {Promise<Array>} AI策略指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = {
        type: "ai",
        code: "1000050",
        month: "-1",
    };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let tempData = dataJson.data.map(item => ({
            "变化幅度": item.change,
            "AI策略指数": item.index,
            "日期": item.date,
        }));

        // 重新排列列顺序
        tempData = tempData.map(item => ({
            "日期": item.日期,
            "AI策略指数": item["AI策略指数"],
            "变化幅度": item["变化幅度"],
        }));

        // 处理日期
        tempData.forEach(item => {
            item.日期 = dayjs.unix(item.日期 / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD');
        });

        return tempData;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error; // 或者返回一个空数组或错误信息
    }
}
///财新数据-指数报告-基石经济指数
require('dayjs/plugin/timezone'); // 导入timezone插件
require('dayjs/plugin/utc');      // 导入utc插件
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));

async function index_bei_cx() {
    /**
     * 财新数据-指数报告-基石经济指数
     * https://yun.ccxe.com.cn/indices/bei
     * @returns {Array} 基石经济指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = {
        type: "ind",
        code: "930927",
        month: "-1",
    };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        let temp_df = dataJson.data.map(item => ({
            "变化幅度": item[0],
            "基石经济指数": item[1],
            "日期": item[2]
        }));

        // 重排列顺序
        temp_df = temp_df.map(row => ({
            "日期": row["日期"],
            "基石经济指数": row["基石经济指数"],
            "变化幅度": row["变化幅度"]
        }));

        // 处理日期格式
        temp_df.forEach(row => {
            row["日期"] = dayjs.unix(row["日期"]/1000).tz("Asia/Shanghai").format('YYYY-MM-DD');
        });

        return temp_df;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者返回一个错误信息
    }
}
///财新数据-指数报告-新动能指数
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 使用dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

async function index_neei_cx() {
    /**
     * 财新数据-指数报告-新动能指数
     * https://yun.ccxe.com.cn/indices/neei
     * @returns {Promise<Array>} 新动能指数
     */
    const url = "https://yun.ccxe.com.cn/api/index/pro/cxIndexTrendInfo";
    const params = new URLSearchParams({
        type: "ind",
        code: "930928",
        month: "1",
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;

        // 处理返回的数据
        let tempArray = dataJson.data.map(item => ({
            日期: item.date,
            新动能指数: item.index,
            变化幅度: item.change,
        }));

        // 将毫秒时间戳转换为北京时间
        tempArray = tempArray.map(item => ({
            ...item,
            日期: dayjs.unix(item.日期 / 1000).tz("Asia/Shanghai").format('YYYY-MM-DD'),
        }));

        return tempArray;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error; // 或者您可以选择如何处理错误
    }
}
module.exports = {
    index_pmi_com_cx : index_pmi_com_cx,
    index_pmi_man_cx : index_pmi_man_cx,
    index_pmi_ser_cx : index_pmi_ser_cx,
    index_dei_cx : index_dei_cx,
    index_ii_cx : index_ii_cx,
    index_si_cx : index_si_cx,
    index_fi_cx : index_fi_cx,
    index_bi_cx : index_bi_cx,
    index_nei_cx : index_nei_cx,
    index_li_cx : index_li_cx,
    index_ci_cx : index_ci_cx,
    index_ti_cx : index_ti_cx,
    index_neaw_cx : index_neaw_cx,
    index_awpr_cx : index_awpr_cx,
    index_cci_cx : index_cci_cx,
    index_qli_cx : index_qli_cx,
    index_ai_cx : index_ai_cx,
    index_bei_cx : index_bei_cx,
    index_neei_cx : index_neei_cx,
};