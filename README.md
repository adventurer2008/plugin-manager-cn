# Community Manager CN — Windows MVP 0.1.9

单页 Obsidian 社区插件管理器。

仓库名、包名和插件 ID 保持 `plugin-manager-cn`，插件显示名称为 `Community Manager CN`。

## 安装与使用

1. 从 [GitHub 最新发行版](https://github.com/adventurer2008/plugin-manager-cn/releases/latest)下载 `plugin-manager-cn.zip`。
2. 解压，将其中的 `plugin-manager-cn` 文件夹复制到目标库的 `<配置目录>/plugins/`。通常配置目录是 `.obsidian`，安装后应能找到 `<配置目录>/plugins/plugin-manager-cn/manifest.json`。不要覆盖任何已有的 `data.json`。
3. 在 Obsidian 第三方插件设置中启用 Community Manager CN，然后打开它的设置页面。也可使用“打开插件管理”命令。
4. 搜索名称、描述或 ID，输入即筛选，点击“安装”确认版本后下载。已安装的搜索结果只显示状态，不提供启用或卸载功能。新装插件默认禁用，请到官方第三方插件设置中启用。更新保留原启用状态。
5. “已安装插件”区仅显示“检查更新”按钮；检查后只列出有更新的插件，支持单独或全部加速更新。启用、禁用和卸载使用官方界面。批量操作跳过管理器自身和 `wujie-sync`。

从源码构建需要 Node.js、npm 和 Python 3.9+；Python 用于 Alpha 清单发布工具的自动测试。执行 `npm ci`、`npm run check`、`npm test`、`npm run build`，然后按上述方式复制生成的 `dist/plugin-manager-cn` 文件夹，保留目标库已有的 `data.json`。

默认卸载只移除发行文件，保留用户配置。安装、更新、卸载的发行文件备份保存在 `<配置目录>/pmcn-backups/`；备份是本机数据，不应上传或复制到其他设备。失败恢复也失败时，请停止继续安装，按提示找到快照恢复发行文件并重启。

## 无界同步

专属区支持版本清单、指定版本安装、SHA-256、手动确认正常版本和本机 Rollback。正常版本只有点击“标记当前版本正常”才保存。回退只恢复代码，不恢复配置或远端数据迁移。

默认读取官方国内发行仓库的公开 Release，无需编辑配置。点击无界同步“检查更新”后可选择历史版本；Alpha 测试版排在前面，最多显示最新3个，稳定版随后最多显示最新5个，共用“安装所选版本”按钮。正式版仍读取原国内发行库；Alpha 默认读取下载站的[完整发布清单](https://sync.wujiesync.cc/download/alpha/releases.json)，不需要 GitHub 预发布，也不依赖本机累积旧 Alpha 记录。下载站成功返回后，以其版本列表为准。本机已确认的回退目标独立保留。已验证从完整清单读取1.1.2-alpha.2与1.1.2-alpha.1，安装alpha.2并离线回退成功；测试期间同步插件禁用，不代表 Alpha 功能或同步实机验收。也可由开发者配置自有 HTTPS 清单（feedUrl）。

在无界同步更多菜单中选择“标记当前版本正常”，确认后保存本机代码快照和摘要。随后出现“回退至版本号”，点击即可离线恢复代码，当前配置保留。安装其他版本不会覆盖回退目标。首次安装 Alpha 前若无目标，会要求你明确确认当前版本已验证正常。

发行文件依据清单 SHA-256 核对；GitHub 元数据经加速代理取得时，这表示文件与该元数据一致，不等同于作者签名或独立的来源认证。回退不会撤销配置或云端数据迁移，不能保证任意旧版本兼容新版数据。

清单结构：

```json
{
  "releases": [
    {
      "version": "1.2.3",
      "channel": "Alpha",
      "baseUrl": "https://YOUR-OSS-HOST/wujie-sync/BUILD-ID/",
      "sha256": {
        "manifest.json": "64位十六进制哈希",
        "main.js": "64位十六进制哈希",
        "styles.css": "64位十六进制哈希"
      },
      "rollbackSafe": false
    }
  ]
}
```

以上是结构示例，不是现有生产版本或可访问地址。列表按最新到最旧排列，默认选第一条 Alpha；版本必须匹配安装包的 manifest。可选 styles.css 不存在时省略其哈希。清单 HTTPS 来源本身必须可信。`rollbackSafe` 是发布方声明，不能证明所有配置/云端状态都能逆向迁移。

## 当前边界

- 已内置六个候选 GitHub 加速源，缓存最后成功源并顺序失败切换，最后尝试直连。尚未做三网测速或竞速调度，不承诺某源持续可用。
- 社区目录来自官方目录，经加速通道下载，本地缓存支持断网后搜索。普通插件按 GitHub latest 正式 Release 安装，支持数字 `x.y.z` 标签；不支持非标准标签。
- 社区发行文件尚未接入可信发布哈希，安装前要求确认信任来源；目前只能检查格式、ID、版本和最低应用版本。无界同步独立清单支持 SHA-256。
- OSS 社区目录缓存和社区文件缓存需要后续接入。社区插件当前仍依赖公共加速源或直连；无界同步 Alpha 已接入下载站完整发布清单。
- Windows 为当前交付平台，manifest 标记 desktop-only。Android/iPadOS 尚未验收。
- Obsidian 插件安装、启停、刷新使用内部插件管理接口，集中在 `src/compat.ts`，接口不兼容时停止操作。备份恢复并非断电事务；崩溃或强制退出后可能需要手动恢复。

## 验证

`npm test` 覆盖配置保留、写入失败恢复、启用状态恢复、自身保护、卸载备份、并发互斥。

`tests/smoke.ts` 是只用于独立测试库的真实 Obsidian 测试入口，不能安装到日常库；它会创建测试插件、故意触发加载失败、测试恢复、下载并以禁用状态安装真实社区插件。`test-output/vault/smoke-result.json` 保存本机执行结果。

当前界面：进入页面不列社区插件；输入关键词后最多五条结果。已安装插件只保留同行检查更新及检查后有更新的列表。无界同步使用同样的名称、版本、作者和描述行；更多菜单可标记正常版本，已保存目标后主行显示一键回退按钮。

0.1.9：Alpha 从下载站完整发布清单读取，管理器只展示最新3个；稳定版仍从 GitHub 渠道读取最新5个，限流时使用随包分发的已核验元数据。历史版本下拉按渠道分组，共用“安装所选版本”按钮；不再提供独立“安装最新 Alpha”按钮或累积本机旧 Alpha 记录。

## Alpha 发布工具

`scripts/publish-alpha.ps1` 需要 PowerShell、SSH/scp、服务器端 Python 3.9+，以及自行配置的发布服务器、SSH 目标和密钥。服务器须已配置上传目录、下载站目录和既有发行清单；仓库不含凭据。脚本上传并校验发行文件后，通过 `scripts/update-alpha-index.py` 刷新完整 Alpha 清单、最新版本指针及合并清单，写入前备份清单。

后续发布Alpha使用 scripts/publish-alpha.ps1，传入 PackageDirectory（三个插件发行文件所在目录）、RootTarget、IdentityFile。脚本自动生成版本信息和摘要、上传独立版本目录、执行服务端 scripts/update-alpha-index.py 更新完整清单。已发布版本不可覆盖；正式版入口、应用服务和用户配置不变。也可在完成目录上传后执行服务端更新工具。上传与清单更新需要发布账号及root维护权限，脚本不保存密钥。
