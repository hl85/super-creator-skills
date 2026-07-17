# WeChat Official Account Red Lines

Categories below are not exhaustive blacklists. They are *seeds*: the reviewer should generalize from each example to similar phrasings, including paraphrases, abbreviations, English transliterations, and obfuscated forms (拼音首字母, homophones).

For every match, classify severity:

- **BLOCK** — politically sensitive content, content that violates Chinese law, medical claims with absolute language, financial inducements, sexual or violent content
- **REVIEW** — borderline cases (sarcasm about institutions, comparative product claims, unverified celebrity claims)

## 1. Political (BLOCK)

Examples to flag:
- 直接评价中国最高领导人 / 党中央 / 中央政府的具体决策（褒贬均属敏感）
- 涉及"六四"、"文革批判"、"新疆/西藏/香港/台湾"政治定性
- 攻击或讽刺解放军、公检法、宣传系统
- 提及被禁组织（FLG、东突等）
- 引用境外政治新闻而无中性语境

Seed phrases (do **not** treat as a literal blacklist; generalize):
"独裁", "暴政", "颜色革命", "和平演变", "维权律师"（特定语境）

## 2. Medical (BLOCK on absolute claims)

Examples to flag:
- "治愈"、"根治"、"100% 有效"、"无副作用" 等绝对化用词
- 推荐处方药、未经审批的疗法
- 把保健品/食品功效写成药品功效
- 引用"专家"无法核实的医学结论

## 3. Financial (BLOCK on inducement)

Examples to flag:
- 推荐具体股票/基金代码 + 时间窗（"下周必涨"）
- 承诺收益率（"年化 30%"）
- 引导加群、加微信、扫码"领免费课"
- 引用未持牌机构的投资建议

## 4. Sexual / Violent (BLOCK)

Examples to flag:
- 露骨性描写、性服务暗示
- 详细自杀方式、自残方法
- 美化暴力、恐怖袭击

## 5. Marketing-Spam Patterns (REVIEW)

Examples to flag (公众号反"诱导关注"机制会限流):
- "转发到三个群获取..."
- "点赞过 100 我就..."
- "在看 + 留言 + 转发 三连"
- 标题党：与正文不符、夸张数字

## 6. External-Link Behavior (REVIEW)

公众号正文中外链一般不可点击。审核时应：
- 标记所有非公众号生态外链
- 建议改为底部「参考链接」或二维码

## 7. Common False-Positive Pitfalls (do **not** flag)

- 历史人物的客观陈述（毛泽东、邓小平 的史实）
- 引用官方媒体原文（新华社、人民日报）并标注出处
- 中性的国际新闻报道
- 学术或法律语境下的专业术语（如医学论文里的"治愈率"）
