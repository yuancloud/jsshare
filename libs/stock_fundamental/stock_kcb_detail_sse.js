const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///
const _ = require('lodash');  // 如果需要进行数据处理，比如筛选、映射等
// 假设你已经通过某种方式引入了dayjs，如果需要日期时间处理的话
// 
async function stockKcbDetailRenewal() {
    const url = "http://query.sse.com.cn/commonSoaQuery.do";
    const params = new URLSearchParams({
        'isPagination': 'true',
        'sqlId': 'SH_XM_LB',
        'stockAuditNum': '926',  // 每次更新该字段就可以
        '_': '1649324745607',
    });
    const headers = {
        'Host': 'query.sse.com.cn',
        'Pragma': 'no-cache',
        'Referer': 'http://kcb.sse.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { params, headers });
        const dataJson = response.data;
        let tempDf = _.map(dataJson.result, item => ({...item}));  // 使用lodash将结果转换为数组对象
        // 处理下 tempDf 里面的字段就可以了
        console.log(tempDf);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// 注意：这段代码需要在支持ES6环境（如Node.js）中运行，并且需要安装axios和lodash库。
module.exports = {
    stock_kcb_detail_renewal : stock_kcb_detail_renewal,
};