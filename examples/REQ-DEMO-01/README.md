# 示例：REQ-DEMO-01 分类级与内容级标签策略配置

一个**虚构 demo（内容发布平台）**的讲解配置，6 步、跨 3 个页面，演示工具包的典型用法。选择器都是假的，只为说明写法。

| 步 | 页面 | 揭示动作 | 高亮 |
|----|------|---------|------|
| 1 创建·分类级配置 | index.html | click `#create` → click `#advancedToggle` | `.tag-options` |
| 2 编辑·修改分类级配置 | index.html | click `.more` → click `[data-action=edit]` → click `#advancedToggle` | `.edit-tip` |
| 3 跟随分类开关 | detail.html | 打开抽屉 → `uploadFile` → click `#ctNextBtn` | `#ctFollowToggle` 行 |
| 4 关闭跟随自定义标签 | detail.html | 同上 → `uncheckFollow` | `.ct-rule-options` |
| 5 异常态·分类无配置 | detail.html | 同上 → `fakeException` | `.ex-exception-hint` |
| 6 片段页元数据展示 | slice.html | click `#metaDataBtn` | `#metaTagRule` 行 |

要点：
- **自定义动作**：`uploadFile`（DataTransfer 模拟文件让「下一步」可用）、`uncheckFollow`（切开关）、`fakeException`（运行时伪造异常态：开关灰显 + 注入提示条）。
- **registerCleanup**：还原 `fakeException` 改过的开关 disabled / opacity / 注入的提示条——每步 setup 前与退出时都会调用。
- **registerExit**：退出时关闭讲解中打开的弹窗/抽屉（`#close`/`#ctClose`/`#metaClose`）。
- 每步 setup 自包含（都从「打开入口」开始），可从任意步骤点直接跳入。

> 这些选择器（`#create`、`#ctFollowToggle` 等）是为虚构 demo 编的，**不要照抄**；这是「怎么写」的参考，不是可直接用的配置。
