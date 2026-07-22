# 示例：REQK-01 知识库级与文档级分段策略配置

来自一个真实 demo（知识中台原型）的讲解配置，6 步、跨 3 个页面，演示了工具包的典型用法：

| 步 | 页面 | 揭示动作 | 高亮 |
|----|------|---------|------|
| 1 创建·库级配置 | index.html | click `#create` → click `#advancedToggle` | `.rule-options` |
| 2 编辑·修改库级配置 | index.html | click `.more` → click `[data-action=edit]` → click `#advancedToggle` | `.edit-tip` |
| 3 跟随知识库开关 | knowledge-detail.html | 打开抽屉 → `uploadFile` → click `#akNextBtn` | `#akFollowToggle` 行 |
| 4 关闭跟随自定义分段 | knowledge-detail.html | 同上 → `uncheckFollow` | `.ak-rule-options` |
| 5 异常态·知识库无配置 | knowledge-detail.html | 同上 → `fakeException` | `.ex-exception-hint` |
| 6 切片页元数据展示 | slice-detail.html | click `#metaDataBtn` | `#metaSegRule` 行 |

要点：
- **自定义动作**：`uploadFile`（DataTransfer 模拟文件让「下一步」可用）、`uncheckFollow`（切开关）、`fakeException`（运行时伪造异常态：开关灰显 + 注入提示条）。
- **registerCleanup**：还原 `fakeException` 改过的开关 disabled / opacity / 注入的提示条——每步 setup 前与退出时都会调用。
- **registerExit**：退出时关闭讲解中打开的弹窗/抽屉（`#close`/`#akClose`/`#metaClose`）。
- 每步 setup 自包含（都从「打开入口」开始），可从任意步骤点直接跳入。

> 这些选择器（`#create`、`#akFollowToggle` 等）是原 demo 的，**不要照抄**；这是「怎么写」的参考，不是可直接用的配置。
