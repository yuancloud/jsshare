const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///柯桥时尚指数

async function index_kq_fashion(symbol = "时尚创意指数") {
    const url = "http://api.idx365.com/index/project/34/data";
    const symbolMap = {
        "柯桥时尚指数": "root",
        "时尚创意指数": "01",
        "时尚设计人才数": "0101",
        "新花型推出数": "0102",
        "创意产品成交数": "0103",
        "创意企业数量": "0104",
        "时尚活跃度指数": "02",
        "电商运行数": "0201",
        "时尚平台拓展数": "0201",
        "新产品销售额占比": "0201",
        "企业合作占比": "0201",
        "品牌传播费用": "0201",
        "时尚推广度指数": "03",
        "国际交流合作次数": "0301",
        "企业参展次数": "0302",
        "外商驻点数量变化": "0302",
        "时尚评价指数": "04",
    };
    
    const params = { structCode: symbolMap[symbol] };
    try {
        const response = await axios.get(url, { params });
        let dataJson = response.data;
        
        // 将原始数据转换为更简洁的结构
        let tempData = dataJson.data.map(item => ({
            日期: dayjs(item.publishTime).format('YYYY-MM-DD'),
            指数: item.indexValue
        }));

        // 对数据按日期排序
        tempData.sort((a, b) => new Date(a.日期) - new Date(b.日期));

        // 计算涨跌值和涨跌幅
        for (let i = 1; i < tempData.length; i++) {
            tempData[i].涨跌值 = tempData[i].指数 - tempData[i - 1].指数;
            tempData[i].涨跌幅 = (tempData[i].指数 - tempData[i - 1].指数) / tempData[i - 1].指数;
        }
        
        return tempData;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error;
    }
}
module.exports = {
    index_kq_fashion : index_kq_fashion,
};