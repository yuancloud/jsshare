const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///50ETF 期权波动率指数 QVIX

async function indexOption50etfQvix() {
    /**
     * 50ETF 期权波动率指数 QVIX
     * http://1.optbbs.com/s/vix.shtml?50ETF
     * @returns {Promise<Array>} - 50ETF 期权波动率指数 QVIX
     */
    const url = "http://1.optbbs.com/d/csv/d/k.csv";
    
    try {
        // 使用axios获取CSV数据
        const response = await axios.get(url);
        const data = response.data;
        
        // 解析CSV数据
        const tempArray = data.split('\n').map(row => row.split(','));
        const headers = tempArray.shift(); // 移除首行并将其作为列名
        const tempData = tempArray.slice(0, -1); // 取前五行数据
        
        // 定义新列名
        const newHeaders = [
            "date",
            "open",
            "high",
            "low",
            "close",
        ];
        
        // 转换数据格式
        const result = tempData.map(row => {
            return _.zipObject(newHeaders, row.map((value, index) => {
                if (index === 0) { // 日期处理
                    return dayjs(value).toDate();
                } else { // 数值处理
                    return _.toNumber(value);
                }
            }));
        });
        
        return result;
    } catch (error) {
        console.error("Error fetching or processing the data:", error);
        throw error; // 抛出错误以便调用者可以处理
    }
}
///50 ETF 期权波动率指数 QVIX

async function indexOption50etfMinQvix() {
    /**
     * 50 ETF 期权波动率指数 QVIX
     * http://1.optbbs.com/s/vix.shtml?50ETF
     * @return {Array} 50 ETF 期权波动率指数 QVIX
     */
    const url = "http://1.optbbs.com/d/csv/d/vix50.csv";
    
    try {
        // 使用axios获取CSV数据
        const response = await axios.get(url);
        const data = response.data;
        
        // 解析CSV数据
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',');
        const tempData = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                time: values[0],
                qvix: parseFloat(values[1]) || null,  // 尝试转换为浮点数，如果失败则设置为null
            };
        });
        
        return tempData;
    } catch (error) {
        console.error("Error fetching or parsing the data:", error);
        throw error;  // 可以根据需要处理错误
    }
}
///300 ETF 期权波动率指数 QVIX

async function indexOption300etfQvix() {
    /**
     * 300 ETF 期权波动率指数 QVIX
     * http://1.optbbs.com/s/vix.shtml?300ETF
     * @returns {Promise<Array>} - 300 ETF 期权波动率指数 QVIX 数据
     */
    const url = "http://1.optbbs.com/d/csv/d/k.csv";
    
    try {
        const response = await axios.get(url);
        const data = response.data.split('\n').map(line => line.split(','));
        // 假设CSV文件的第一行是标题行，我们跳过它
        const headers = data.shift();
        
        // 选择特定列：date, open, high, low, close
        const tempData = data.map(row => ({
            date: row[0],
            open: parseFloat(row[9]),
            high: parseFloat(row[10]),
            low: parseFloat(row[11]),
            close: parseFloat(row[12])
        }));

        // 处理日期格式
        const result = tempData.map(item => ({
            ...item,
            date: dayjs(item.date).toDate()
        }));

        return result;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error; // 或者返回一个默认值或错误对象
    }
}
///300 ETF 期权波动率指数 QVIX-分时

async function indexOption300etfMinQvix() {
    /**
     * 300 ETF 期权波动率指数 QVIX-分时
     * http://1.optbbs.com/s/vix.shtml?300ETF
     * @returns {Promise<Array>} 300 ETF 期权波动率指数 QVIX-分时
     */
    const url = "http://1.optbbs.com/d/csv/d/vix300.csv";
    
    try {
        // 使用axios获取CSV数据
        const response = await axios.get(url, { responseType: 'text' });
        const csvData = response.data;
        
        // 将CSV数据解析为数组
        const tempArray = csvData.split('\n').map(row => row.split(',')).slice(0, -1); // 去除最后一行可能存在的空行
        
        // 获取列名并移除第一行
        const [timeColumn, qvixColumn] = tempArray.shift();
        
        // 转换数据类型
        const result = tempArray.map(row => ({
            time: row[0],
            qvix: Number(row[1]) || null, // 如果转换失败则设置为null
        }));
        
        return result;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error; // 可以根据需要处理错误
    }
}
module.exports = {
    index_option_50etf_qvix : index_option_50etf_qvix,
    index_option_50etf_min_qvix : index_option_50etf_min_qvix,
    index_option_300etf_qvix : index_option_300etf_qvix,
    index_option_300etf_min_qvix : index_option_300etf_min_qvix,
};