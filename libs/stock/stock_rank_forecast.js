const axios = require('axios');
const util = require('../util/util.js');

///巨潮资讯-数据中心-评级预测-投资评级
async function stock_rank_forecast_cninfo(date = "20230817") {
    /**
     * 巨潮资讯-数据中心-评级预测-投资评级
     * @param {string} date - 查询日期
     * @returns {Promise<Array>} 投资评级
     */

    const url = "http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1089";
    const params = { tdate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}` };

    const headers = {
        "Accept": "*/*",
        "Accept-Enckey": util.getResCode1(),
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": "0",
        "Host": "webapi.cninfo.com.cn",
        "Origin": "http://webapi.cninfo.com.cn",
        "Pragma": "no-cache",
        "Proxy-Connection": "keep-alive",
        "Referer": "http://webapi.cninfo.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    };

    try {
        const response = await axios.post(url, null, { params, headers });
        const records = response.data.records;
        let result = records.map(record => ({
            "证券简称": record.SECNAME,
            "发布日期": record.DECLAREDATE,
            "前一次投资评级": record.F008V,
            "评级变化": record.F007V,
            "目标价格-上限": record.F010N == '-' ? '' : record.F010N,
            "是否首次评级": record.F006V,
            "投资评级": record.F004V,
            "研究员名称": record.F003V,
            "研究机构简称": record.F002V,
            "目标价格-下限": record.F009N == '-' ? '' : record.F009N,
            "证券代码": record.SECCODE,
        }));
        return result;
    } catch (error) {
        console.error("Error fetching stock rank forecast:", error);
        throw error;
    }
}

module.exports = {
    stock_rank_forecast_cninfo: stock_rank_forecast_cninfo,
};