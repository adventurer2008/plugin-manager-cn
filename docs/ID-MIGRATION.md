# wujie-hub ID 迁移

GitHub 仓库已改名为 https://github.com/adventurer2008/wujie-hub ，旧仓库网址由 GitHub 重定向。包名、新插件 ID 和构建目录统一为 wujie-hub。

社区已发布条目的 ID 不能直接编辑。官方要求联系 #community-directory 管理员；更换 ID 将重置下载统计，原用户需要重新安装。依据：https://docs.obsidian.md/community-directory/faq 。不要自行把新 ID 覆盖到旧目录，也不要创建重复条目来绕过迁移。

在官方确认切换顺序前，main 和社区渠道保留 0.1.16 旧 ID；本分支准备0.1.17新 ID，不能直接合并发布。正式发布检查会阻止尚未记录官方确认的 ID 迁移。

## 同设备、同库的手动迁移

1. 在 Obsidian 官方插件设置中停用旧管理器，保留旧目录和全部配置、备份。
2. 新发行包安装到 `<配置目录>/plugins/wujie-hub/`。不要重命名旧目录来替代安装，也不要让新旧管理器同时运行。
3. 如需沿用管理器配置，仅在同一设备、同一库中手动复制旧目录的 data.json 到新目录；原文件保留，且不能覆盖已有新配置。严禁从另一设备复制含本机回退快照的配置。
4. 启用新插件后检查搜索、更新和本机回退目标。新管理器拒绝管理新旧两个管理器 ID；旧版仍运行时拒绝开始文件修改。

不自动移动、删除旧目录，不改动无界同步或其他目标插件的 data.json。跨设备与旧库配置迁移结果不能据此视为已验证。

## 待发送给官方管理员的申请

I maintain Wujie Hub, currently listed as `plugin-manager-cn`:
https://community.obsidian.md/plugins/plugin-manager-cn

I renamed my GitHub repository from `adventurer2008/plugin-manager-cn` to `adventurer2008/wujie-hub` (the old URL redirects). I would like to migrate the Community entry ID to `wujie-hub` and update its repository location.

I understand that changing the identifier resets downloads and requires existing users to reinstall. I have kept the published default branch and release 0.1.16 on the old ID while preparing the new ID on `codex/wujie-hub-id-migration`. Could an administrator assist with the migration and confirm the sequence for switching the manifest and publishing the new-ID release? I have not created a duplicate Community entry.
