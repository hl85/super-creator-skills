# X (Twitter) Red Lines

X moderation is more permissive than WeChat on speech but stricter on **algorithmic distribution** (shadowban, reach throttling) and on **legal exposure** (defamation, doxxing). This list reflects 2024–2026 community-reported patterns, not official policy.

## 1. Shadowban / Reach-Throttle Triggers (REVIEW)

Examples to flag:
- 多个外链（X penalizes posts with off-platform links; 1 link is fine, 2+ noticeably hurts reach）
- 大量 hashtag（>2 tags 反而降权）
- 全大写 + 多个感叹号（被分类为 spam-like）
- 发布频次过高（同主题 5 分钟内多条）
- 转发自己的帖子并加同样内容

## 2. Legal / Liability (BLOCK)

Examples to flag:
- 指名道姓的诽谤（"X is a fraud" 没有依据）
- 公开未公开的私人通讯截图（DM、私信、私人邮件）
- 透露他人住址、电话、单位（doxxing）
- 引用未经证实的犯罪指控
- 发布版权材料无授权（电影片段、付费课程截图）

## 3. Irony / Misreading Risk (REVIEW)

X 是高摘抄/高断章取义平台。任何一句话都可能被截图传播。审核应标记：
- 反讽句若被去掉上下文是否危险？（"我支持加税" 反讽 vs 字面）
- 自嘲句被陌生人误读为攻击的可能性？
- 政治笑话在不同时区/读者群的接受度？

When in doubt, suggest adding `/s` or restating literally.

## 4. Platform-Sensitive Topics (REVIEW)

Topics where X moderation has been inconsistent:
- COVID 相关医学声明
- 选举相关声明（特别是美国选举周期内）
- 跨性别 / 性别认同（双向风险）
- 以色列-巴勒斯坦
- 加密货币推荐（被标 spam 概率高）

## 5. Thread Quality Signals (REVIEW)

X 算法明显偏好"完整 thread"而非"末条带链接"。审核应标记：
- 钩子推（第一条）是否能独立读懂？
- 链接是否被压在最后一条而非中间？
- 是否过早 @ 大 V 求转发（被分类为 engagement bait）

## 6. Common False-Positive Pitfalls (do **not** flag)

- 引用公开新闻报道（即使敏感主题）
- 注明来源的事实陈述
- 第一人称的技术失败复盘（debug 故事）
- 学术 / 工程语境下的强语气
