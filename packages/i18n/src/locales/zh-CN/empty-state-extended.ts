/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

export default {
  project_empty_state: {
    epics: {
      title: "将复杂项目转化为结构化史诗。",
      description: "史诗帮助您将大目标组织成更小的可跟踪任务。",
      cta_primary: "创建史诗",
      cta_secondary: "文档",
    },
    epic_work_items: {
      title: "您尚未向此史诗添加工作项。",
      description: "开始向此史诗添加一些工作项并在此处跟踪它们。",
      cta_secondary: "添加工作项",
    },
  },
  workspace_empty_state: {
    home_widget_stickies: {
      title: "记下想法、捕捉灵光一现或记录思维火花。添加便签开始。",
    },
    stickies: {
      title: "即时捕捉想法",
      description: "创建便签记录快速笔记和待办事项,并随身携带它们无论您走到哪里。",
      cta_primary: "创建第一个便签",
      cta_secondary: "文档",
    },
    active_cycles: {
      title: "无活跃周期",
      description: "您目前没有任何正在进行的周期。包含今天日期的活跃周期将显示在此处。",
    },
    teamspaces: {
      title: "使用团队空间解锁更好的组织和跟踪",
      description:
        "为每个真实世界的团队创建专用空间,与 Plane 中的所有其他工作空间分离,并自定义它们以适应您的团队工作方式。",
      cta_primary: "创建新的团队空间",
    },
    initiatives: {
      title: "从一个地方跟踪项目和史诗",
      description: "使用计划对相关项目和史诗进行分组和监控。查看进度、优先级和成果 — 全部来自单个屏幕。",
      cta_primary: "创建计划",
    },
    customers: {
      title: "按对客户重要的内容管理工作",
      description:
        "将客户请求与工作项关联,按请求分配优先级,并将工作项状态汇总到客户记录中。很快,您将能够与您的 CRM 或支持工具集成,以便按客户属性进行更好的工作管理。",
      cta_primary: "创建客户记录",
    },
    dashboard: {
      title: "使用仪表板可视化您的进度",
      description: "构建可自定义的仪表板以跟踪指标、衡量成果并有效呈现见解。",
      cta_primary: "创建新仪表板",
    },
    wiki: {
      title: "编写笔记、文档或完整的知识库。",
      description:
        "页面是 Plane 中的思想捕捉空间。记录会议笔记,轻松格式化,嵌入工作项,使用组件库进行布局,并将它们全部保留在项目上下文中。",
      cta_primary: "创建您的页面",
    },
    project_overview_state_sidebar: {
      title: "启用项目状态",
      description: "启用项目状态以查看和管理状态、优先级、截止日期等属性。",
    },
  },
  settings_empty_state: {
    teamspace: {
      title: "暂无团队空间",
      description: "在团队空间中聚集成员,轻松跟踪进度、工作量和活动。了解更多",
      cta_primary: "添加团队空间",
    },
    work_item_types: {
      title: "创建和自定义工作项类型",
      description:
        "为项目定义独特的工作项类型。每种类型都可以有自己的属性、工作流程和字段 — 根据项目和团队需求量身定制。",
      cta_primary: "启用",
    },
    work_item_type_properties: {
      title: "定义要为此工作项类型捕获的属性和详细信息。自定义它以匹配项目的工作流程。",
      cta_secondary: "添加属性",
    },
    epic_setting: {
      title: "启用史诗",
      description: "将相关工作项分组到跨越多个周期和模块的更大主体中 — 非常适合跟踪全局进度。",
      cta_primary: "启用",
    },
    templates: {
      title: "暂无模板",
      description: "通过为工作项和页面创建模板来减少设置时间 — 并在几秒钟内开始新工作。",
      cta_primary: "创建您的第一个模板",
    },
    recurring_work_items: {
      title: "暂无循环工作项",
      description: "设置循环工作项以自动化重复任务并轻松保持计划进度。",
      cta_primary: "创建循环工作项",
    },
    worklogs: {
      title: "跟踪所有成员的工时表",
      description: "在工作项上记录时间以查看跨项目任何团队成员的详细工时表。",
    },
    customers_setting: {
      title: "启用客户管理以开始。",
      cta_primary: "启用",
    },
    template_setting: {
      title: "暂无模板",
      description: "通过为项目、工作项和页面创建模板来减少设置时间 — 并在几秒钟内开始新工作。",
      cta_primary: "创建模板",
    },
  },
} as const;
