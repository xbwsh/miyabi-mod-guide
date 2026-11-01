# 内容核对入口

本轮核对：2026-11-01，星见雅 `0.4.56-combo-timeout-v321`，公共模组 `0.5.74-penetration-panel`。这里只记录源码依据，不代表游戏实机验收。网站保留手册式卡片、妖刀升级内嵌与旧锚点，不恢复特效预览。

源目录为网站仓库同级上两层的 `DST-MiYaBi/` 与 `DST-ZZZ/`。先读两边的 `modinfo.lua`；更新正文后再修改页面对应版本。

| 网站内容 | 当前源码入口 |
| --- | --- |
| 三维、配方、角色依赖版本 | `DST-MiYaBi/modmain.lua` |
| 五刀属性、空挥与 3 秒续接窗口 | `DST-MiYaBi/scripts/miyabi_attack_cycle.lua` |
| 妖刀基础与飞雪、升级位面 | `DST-MiYaBi/scripts/prefabs/miyabi_wuwei.lua`、`miyabi_wuwei_combat.lua`、`miyabi_wuwei_repair.lua` |
| 技能文案与基础精通/掌控 | `DST-MiYaBi/scripts/miyabi_character_skills.lua`、`miyabi_character_profile.lua` |
| 暴击减冷却与护盾 | `DST-MiYaBi/scripts/components/miyabi_battle.lua` |
| 背包各级加成与升级材料 | `DST-MiYaBi/scripts/miyabi_pack_progress.lua`、`miyabi_pack_combat.lua` |
| BACK/NECK 与帽内发卡 | `DST-MiYaBi/scripts/miyabi_equipment_slots.lua`、`miyabi_hat_hairclip.lua` |
| 套装、主副词条与未生效词条 | `DST-ZZZ/scripts/zzz_drive_defs.lua` |
| 共享冰条、快照与满条普通伤害 | `DST-ZZZ/scripts/zzz_anomaly_defs.lua`、`zzz_anomaly.lua`、`components/zzz_anomaly.lua` |
| 冰伤与实体抵抗、穿透取高 | `DST-ZZZ/scripts/zzz_elemental_damage.lua`、`zzz_penetration.lua` |
| 面板穿透与异常数值 | `DST-ZZZ/scripts/zzz_character_stats.lua` |
| 首领 S/A/B 20/30/50、参与窗口 | `DST-ZZZ/scripts/zzz_drive_loot.lua` |
| 物品分类 | `DST-ZZZ/scripts/zzz/crafting_filters.lua` |
| 木箱样本收集与无限堆叠 | `DST-ZZZ/scripts/zzz_crate_collect.lua`、`zzz_crate_upgrade.lua`、`prefabs/zzz_crate.lua` |
| 符箓、洞穴天气、能源配方 | `DST-ZZZ/scripts/zzz/yunkui.lua` |
| 音像店、邦巢、信标配方 | `DST-ZZZ/modmain.lua`、`scripts/zzz/bangboo_nest.lua`、`scripts/zzz/beacon.lua` |

四个符箓/能源图标复用 `zzz_production/yunkui_v54/qa/zzz_*-icon.png`，未生成新图或修改运行资源。

本轮网站验证：HTML 层级、站内链接、资源引用、旧锚点；本地浏览器核对五刀/异常文字、搜索、深浅主题、手机表格与新增符箓图片。不会启动游戏或自动进入世界。
