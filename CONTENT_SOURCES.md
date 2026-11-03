# 内容核对入口

本轮核对：2026-11-03，星见雅 `0.4.101-debug-section`，公共模组 `0.5.113-debug-section`。这里只记录源码依据，不代表游戏实机验收。网站保留手册式卡片、妖刀升级内嵌与旧锚点，不展示或介绍特效贴图。

源目录为网站仓库同级上两层的 `DST-MiYaBi/` 与 `DST-ZZZ/`。先读两边的 `modinfo.lua`；更新正文后再修改页面对应版本。

| 网站内容 | 当前源码入口 |
| --- | --- |
| 三维、配方、角色依赖版本 | `DST-MiYaBi/modmain.lua` |
| 五刀属性、空挥与 3 秒续接窗口 | `DST-MiYaBi/scripts/miyabi_attack_cycle.lua` |
| 妖刀基础与飞雪、升级位面 | `DST-MiYaBi/scripts/prefabs/miyabi_wuwei.lua`、`miyabi_wuwei_combat.lua`、`miyabi_wuwei_repair.lua` |
| 妖刀范围冰伤、砍树与攻速 | `DST-MiYaBi/scripts/miyabi_wuwei_area.lua`、`miyabi_wuwei_chop.lua`、`miyabi_wuwei_speed.lua` |
| 帽子眼球伞升级 | `DST-MiYaBi/scripts/miyabi_hat_upgrade.lua` |
| 独立帽子与护甲隐藏 | `DST-MiYaBi/modinfo.lua`、`scripts/miyabi_equipment_visuals.lua` |
| 技能文案与基础精通/掌控 | `DST-MiYaBi/scripts/miyabi_character_skills.lua`、`miyabi_character_profile.lua` |
| 落霜、霜月档位、按键与索敌 | `DST-MiYaBi/scripts/miyabi_frost.lua`、`components/miyabi_frost.lua`、`miyabi_moon.lua`、`miyabi_moon_echo.lua`、`miyabi_moon_input.lua` |
| 武痴狐狸巨兽记录与斩杀 | `DST-MiYaBi/scripts/miyabi_boss_memory.lua` |
| 暴击减冷却与护盾 | `DST-MiYaBi/scripts/components/miyabi_battle.lua` |
| 背包各级加成与升级材料 | `DST-MiYaBi/scripts/miyabi_pack_progress.lua`、`miyabi_pack_combat.lua` |
| BACK/NECK 与帽内发卡 | `DST-MiYaBi/scripts/miyabi_equipment_slots.lua`、`miyabi_hat_hairclip.lua` |
| 套装、主副词条与未生效词条 | `DST-ZZZ/scripts/zzz_drive_defs.lua` |
| 属性、变种与独立异常条 | `DST-ZZZ/scripts/zzz_attributes.lua`、`zzz_anomaly_defs.lua`、`zzz_anomaly.lua`、`components/zzz_anomaly.lua` |
| 霜寒、碎冰、霜灼及紊乱 | `DST-ZZZ/scripts/zzz_anomaly_ice.lua`、`zzz_anomaly_status.lua` |
| 感电、灼烧、侵蚀及紊乱 | `DST-ZZZ/scripts/zzz_anomaly_shock.lua`、`zzz_anomaly_burn.lua`、`zzz_anomaly_corruption.lua`、`zzz_anomaly_attack_proc.lua` |
| 属性伤害、抗性与穿透取高 | `DST-ZZZ/scripts/zzz_elemental_damage.lua`、`zzz_attribute_resistance.lua`、`zzz_penetration.lua` |
| 异常条元素图标 | `DST-ZZZ/scripts/zzz_anomaly_defs.lua`、`zzz_anomaly_ui.lua` |
| 按实际扣血的伤害统计 | `DST-ZZZ/scripts/zzz_damage_meter.lua`、`zzz_damage_meter_ui.lua` |
| 两模组调试模式与默认值 | 两边 `modinfo.lua`、`DST-ZZZ/scripts/zzz_debug_runtime.lua` |
| 面板穿透与异常数值 | `DST-ZZZ/scripts/zzz_character_stats.lua` |
| 首领 S/A/B 20/30/50、参与窗口 | `DST-ZZZ/scripts/zzz_drive_loot.lua` |
| 物品分类 | `DST-ZZZ/scripts/zzz/crafting_filters.lua` |
| 木箱样本收集与无限堆叠 | `DST-ZZZ/scripts/zzz_crate_collect.lua`、`zzz_crate_upgrade.lua`、`prefabs/zzz_crate.lua` |
| 符箓、洞穴天气、能源配方 | `DST-ZZZ/scripts/zzz/yunkui.lua` |
| 音像店、邦巢、信标配方 | `DST-ZZZ/modmain.lua`、`scripts/zzz/bangboo_nest.lua`、`scripts/zzz/beacon.lua` |
| 信标共享裂隙、原版效果与平稳抵达 | `DST-ZZZ/scripts/zzz/beacon.lua`、`zzz/beacon_fx.lua`、`prefabs/zzz_beacon_rift.lua` |

四个符箓/能源图标复用 `zzz_production/yunkui_v54/qa/zzz_*-icon.png`，未生成新图或修改运行资源。

九种属性图标复用 `zzz_production/attribute_icons_v342/icons/` 中的透明原图，缩小导出为网页图片；不修改模组运行资源。
