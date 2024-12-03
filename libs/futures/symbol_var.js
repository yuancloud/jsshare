const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///查找到具体合约代码, 返回大写字母的品种名称
function symbol_varieties(contract_code) {
    /**
     * 查找到具体合约代码, 返回大写字母的品种名称
     * @param {string} contract_code - 合约代码, 例如 'ru1801'
     * @return {string} 品种名称, 例如 'RU'
     */
    let symbol_detail = contract_code.replace(/\d/g, '').toUpperCase().trim();
    if (symbol_detail === "PTA") {
        symbol_detail = "TA";
    }
    return symbol_detail;
}
///映射出市场代码
function symbol_market(symbol_detail = "SC") {
    /**
     * 映射出市场代码
     * @param {string} symbol_detail - 符号详情
     * @returns {string} 市场代码
     */
    let var_item = symbol_varieties(symbol_detail);  // 假设symbol_varieties是一个已经定义好的函数
    for (let [market_item, contract_items] of Object.entries(cons.market_exchange_symbols)) {  // 假设cons.market_exchange_symbols是已定义的对象
        if (contract_items.includes(var_item)) {
            return market_item;
        }
    }
}
///查找中文字符
function findChinese(chineseString) {
    /**
     * 查找中文字符
     * @param {string} chineseString - 中文字符串
     * @return {string}
     */
    const p = /[\u4e00-\u9fa5]/g;  // 正则表达式匹配所有中文字符
    const res = chineseString.match(p);  // 使用match查找所有匹配项
    return res ? res.join("") : "";  // 如果有结果就连接成字符串返回，否则返回空字符串
}
///映射期货品种中文名称和英文缩写
function chinese_to_english(chinese_var) {
    /**
     * 映射期货品种中文名称和英文缩写
     * @param {string} chinese_var - 期货品种中文名称
     * @return {string} 对应的英文缩写
     */
    const chinese_list = [
        "橡胶", "天然橡胶", "石油沥青", "沥青", "沥青仓库", "沥青(仓库)", "沥青厂库", "沥青(厂库)",
        "热轧卷板", "热轧板卷", "燃料油", "白银", "线材", "螺纹钢", "铅", "铜", "铝", "锌",
        "黄金", "钯金", "锡", "镍", "纸浆", "豆一", "大豆", "豆二", "胶合板", "玉米", "玉米淀粉",
        "聚乙烯", "LLDPE", "LDPE", "豆粕", "豆油", "大豆油", "棕榈油", "纤维板", "鸡蛋", "聚氯乙烯",
        "PVC", "聚丙烯", "PP", "焦炭", "焦煤", "铁矿石", "乙二醇", "强麦", "强筋小麦", " 强筋小麦",
        "硬冬白麦", "普麦", "硬白小麦", "硬白小麦（）", "皮棉", "棉花", "一号棉", "白糖", "PTA", "菜籽油",
        "菜油", "早籼稻", "早籼", "甲醇", "柴油", "玻璃", "油菜籽", "菜籽", "菜籽粕", "菜粕", "动力煤",
        "粳稻", "晚籼稻", "晚籼", "硅铁", "锰硅", "硬麦", "棉纱", "苹果", "原油", "中质含硫原油", "尿素",
        "20号胶", "苯乙烯", "不锈钢", "粳米", "20号胶20", "红枣", "不锈钢仓库", "纯碱", "液化石油气",
        "低硫燃料油", "纸浆仓库", "石油沥青厂库", "石油沥青仓库", "螺纹钢仓库", "螺纹钢厂库", "纸浆厂库",
        "低硫燃料油仓库", "低硫燃料油厂库", "短纤", "涤纶短纤", "生猪", "花生", "工业硅", "氧化铝",
        "丁二烯橡胶", "碳酸锂", "氧化铝仓库", "氧化铝厂库", "烧碱", "丁二烯橡胶仓库", "丁二烯橡胶厂库"
    ];
    const english_list = [
        "RU", "RU", "BU", "BU", "BU", "BU", "BU2", "BU2", "HC", "HC", "FU", "AG", "WR", "RB",
        "PB", "CU", "AL", "ZN", "AU", "AU", "SN", "NI", "SP", "A", "A", "B", "BB", "C", "CS",
        "L", "L", "L", "M", "Y", "Y", "P", "FB", "JD", "V", "V", "PP", "PP", "J", "JM", "I",
        "EG", "WH", "WH", "WH", "PM", "PM", "PM", "PM", "CF", "CF", "CF", "SR", "TA", "OI",
        "OI", "RI", "ER", "MA", "MA", "FG", "RS", "RS", "RM", "RM", "ZC", "JR", "LR", "LR",
        "SF", "SM", "WT", "CY", "AP", "SC", "SC", "UR", "NR", "EB", "SS", "RR", "NR", "CJ",
        "SS", "SA", "PG", "LU", "SP", "BU", "BU", "RB", "RB", "SP", "LU", "LU", "PF", "PF",
        "LH", "PK", "SI", "AO", "BR", "LC", "AO", "AO", "SH", "BR", "BR"
    ];

    const pos = chinese_list.indexOf(chinese_var);
    return english_list[pos];
}
module.exports = {
    symbol_varieties : symbol_varieties,
    symbol_market : symbol_market,
    find_chinese : find_chinese,
    chinese_to_english : chinese_to_english,
};