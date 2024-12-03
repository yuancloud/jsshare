const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///期货手续费数据细节处理函数

async function _futures_comm_qihuo_process(df, name = null) {
    const common_temp_df = _.cloneDeep(df); // 深拷贝 DataFrame

    common_temp_df['合约名称'] = common_temp_df['合约品种'].map(item => item.split('(')[0].trim());
    common_temp_df['合约代码'] = common_temp_df['合约品种'].map(item => item.split('(')[1].replace(')', '').trim());
    common_temp_df['涨停板'] = common_temp_df['涨/跌停板'].map(item => item.split('/')[0].trim());
    common_temp_df['跌停板'] = common_temp_df['涨/跌停板'].map(item => item.split('/')[1].trim());
    common_temp_df['保证金-买开'] = common_temp_df['保证金-买开'].map(item => item.replace('%', ''));
    common_temp_df['保证金-卖开'] = common_temp_df['保证金-卖开'].map(item => item.replace('%', ''));
    common_temp_df['保证金-每手'] = common_temp_df['保证金-保证金/每手'].map(item => item.replace('元', ''));
    common_temp_df['手续费'] = common_temp_df['手续费(开+平)'].map(item => item.replace('元', ''));

    let temp_df_ratio;
    try {
        temp_df_ratio = common_temp_df['手续费标准-开仓']
            .filter(item => item.includes('万分之'))
            .map(item => parseFloat(item.split('/')[0]) / 10000);
    } catch (e) {
        temp_df_ratio = null; // 使用 null 表示缺失值
    }
    const temp_df_yuan = common_temp_df['手续费标准-开仓']
        .filter(item => item.includes('元'))
        .map(item => item.replace('元', ''));
    common_temp_df['手续费标准-开仓-万分之'] = temp_df_ratio;
    common_temp_df['手续费标准-开仓-元'] = temp_df_yuan;

    // 对于平昨和平今的处理与上面相似
    // ...

    // 删除不需要的列
    delete common_temp_df['手续费标准-开仓'];
    delete common_temp_df['手续费标准-平昨'];
    delete common_temp_df['手续费标准-平今'];
    delete common_temp_df['合约品种'];
    delete common_temp_df['涨/跌停板'];
    delete common_temp_df['手续费(开+平)'];
    delete common_temp_df['保证金-保证金/每手'];

    common_temp_df['交易所名称'] = name;

    // 重新排序列
    common_temp_df = _.pick(common_temp_df, [
        "交易所名称",
        "合约名称",
        "合约代码",
        "现价",
        "涨停板",
        "跌停板",
        "保证金-买开",
        "保证金-卖开",
        "保证金-每手",
        "手续费标准-开仓-万分之",
        "手续费标准-开仓-元",
        "手续费标准-平昨-万分之",
        "手续费标准-平昨-元",
        "手续费标准-平今-万分之",
        "手续费标准-平今-元",
        "每跳毛利",
        "手续费",
        "每跳净利",
        "备注",
    ]);

    // 将某些列转换为数值类型
    // 注意：这里假设 df 提供了 toNumber 方法，否则你需要手动实现或者使用库函数
    // common_temp_df['现价'] = common_temp_df['现价'].toNumber();
    // ...

    // 获取更新时间
    const { data } = await axios.get('https://www.9qihuo.com/qihuoshouxufei', { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    const $ = cheerio.load(data);
    const rawDateText = $('#dlink').prev().text();
    const commUpdateTime = rawDateText.split('，')[0].replace('（手续费更新时间：', '');
    const priceUpdateTime = rawDateText.split('，')[1].replace('价格更新时间：', '').replace('。）', '');

    common_temp_df['手续费更新时间'] = commUpdateTime;
    common_temp_df['价格更新时间'] = priceUpdateTime;

    return common_temp_df;
}
///九期网-期货手续费
const cheerio = require('cheerio');
// 假设 _futures_comm_qihuo_process 已经定义好
// const _futures_comm_qihuo_process = require('./_futures_comm_qihuo_process');

async function futuresCommInfo(symbol = "所有") {
    /**
     * 九期网-期货手续费
     * @param {string} symbol - 交易所名称
     * @returns {Promise<Array>} - 期货手续费数据
     */
    const url = "https://www.9qihuo.com/qihuoshouxufei";
    try {
        const response = await axios.get(url, { httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
        const $ = cheerio.load(response.data);
        const tempTable = $('table').eq(0); // 假设我们需要的是第一个表格
        const headers = [
            "合约品种",
            "现价",
            "涨/跌停板",
            "保证金-买开",
            "保证金-卖开",
            "保证金-保证金/每手",
            "手续费标准-开仓",
            "手续费标准-平昨",
            "手续费标准-平今",
            "每跳毛利",
            "手续费(开+平)",
            "每跳净利",
            "备注",
            "-",
            "-"
        ];

        let rows = [];
        tempTable.find('tr').each((i, el) => {
            const row = $(el).find('td').map((j, td) => $(td).text().trim()).get();
            if (row.length > 0) rows.push(row);
        });

        // 将第一行作为表头，其余行为数据
        const data = [headers, ...rows.slice(1)];

        // 找到各交易所的起始索引
        const shfeIndex = data.findIndex(row => row[0].includes("上海期货交易所"));
        const dceIndex = data.findIndex(row => row[0].includes("大连商品交易所"));
        const czceIndex = data.findIndex(row => row[0].includes("郑州商品交易所"));
        const ineIndex = data.findIndex(row => row[0].includes("上海国际能源交易中心"));
        const gfexIndex = data.findIndex(row => row[0].includes("广州期货交易所"));
        const cffexIndex = data.findIndex(row => row[0].includes("中国金融期货交易所"));

        // 根据索引切割数据
        const shfeData = data.slice(shfeIndex + 4, dceIndex);
        const dceData = data.slice(dceIndex + 4, czceIndex);
        const czceData = data.slice(czceIndex + 4, ineIndex);
        const ineData = data.slice(ineIndex + 4, gfexIndex);
        const gfexData = data.slice(gfexIndex + 4, cffexIndex);
        const cffexData = data.slice(cffexIndex + 4);

        // 根据 symbol 返回对应的数据
        switch (symbol) {
            case "上海期货交易所":
                return _futures_comm_qihuo_process(shfeData, "上海期货交易所");
            case "大连商品交易所":
                return _futures_comm_qihuo_process(dceData, "大连商品交易所");
            case "郑州商品交易所":
                return _futures_comm_qihuo_process(czceData, "郑州商品交易所");
            case "上海国际能源交易中心":
                return _futures_comm_qihuo_process(ineData, "上海国际能源交易中心");
            case "广州期货交易所":
                return _futures_comm_qihuo_process(gfexData, "广州期货交易所");
            case "中国金融期货交易所":
                return _futures_comm_qihuo_process(cffexData, "中国金融期货交易所");
            default:
                const bigData = [];
                bigData.push(..._futures_comm_qihuo_process(shfeData, "上海期货交易所"));
                bigData.push(..._futures_comm_qihuo_process(dceData, "大连商品交易所"));
                bigData.push(..._futures_comm_qihuo_process(czceData, "郑州商品交易所"));
                bigData.push(..._futures_comm_qihuo_process(ineData, "上海国际能源交易中心"));
                bigData.push(..._futures_comm_qihuo_process(gfexData, "广州期货交易所"));
                bigData.push(..._futures_comm_qihuo_process(cffexData, "中国金融期货交易所"));
                return bigData;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}
module.exports = {
    _futures_comm_qihuo_process: _futures_comm_qihuo_process,
    futures_comm_info: futures_comm_info,
};