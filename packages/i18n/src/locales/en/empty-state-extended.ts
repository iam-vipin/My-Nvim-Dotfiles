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
      title: "Turn complex projects into structured epics.",
      description: "An epic helps you organize big goals into smaller, trackable tasks.",
      cta_primary: "Create an Epic",
      cta_secondary: "Documentation",
    },
    epic_work_items: {
      title: "You haven't added work items to this epic yet.",
      description: "Start by adding some work items to this epic and track them here.",
      cta_secondary: "Add work items",
    },
  },
  workspace_empty_state: {
    home_widget_stickies: {
      title: "Jot down an idea, capture an aha, or record a brainwave. Add a sticky to get started.",
    },
    stickies: {
      title: "Capture ideas instantly",
      description: "Create stickies for quick notes and to-dos, and keep them with you wherever you go.",
      cta_primary: "Create first sticky",
      cta_secondary: "Documentation",
    },
    active_cycles: {
      title: "No active cycles",
      description:
        "You don't have any ongoing cycles right now. Active cycles appear here when they include today's date.",
    },
    teamspaces: {
      title: "With teamspaces unlock better organization and tracking",
      description:
        "Create a dedicated surface for every real-world team, separate from all other work surfaces in Plane, and customize them to suit how your team works.",
      cta_primary: "Create a new Teamspace",
    },
    initiatives: {
      title: "Track projects and epics from one place",
      description:
        "Use initiatives to group and monitor related projects and epics. View progress, priorities, and outcomes—all from a single screen.",
      cta_primary: "Create an Initiative",
    },
    customers: {
      title: "Manage work by what's important to your customers",
      description:
        "Bring customer requests to work items, assign priority by requests, and roll up work items' states into customer records. Soon, you will integrate with your CRM or Support tool for even better work management by customer attributes.",
      cta_primary: "Create customer record",
    },
    dashboard: {
      title: "Visualize your progress with dashboards",
      description:
        "Build customizable dashboards to track metrics, measure outcomes, and present insights effectively.",
      cta_primary: "Create new dashboard",
    },
    wiki: {
      title: "Write a note, a doc, or a full knowledge base.",
      description:
        "Pages are thought spotting space in Plane. Take down meeting notes, format them easily, embed work items, lay them out using a library of components, and keep them all in your project's context.",
      cta_primary: "Create your page",
    },
    project_overview_state_sidebar: {
      title: "Enable project states",
      description: "Enable Project States to view and manage properties like state, priority, due dates and more.",
    },
  },
  settings_empty_state: {
    teamspace: {
      title: "No teamspace yet",
      description:
        "Bring together your members in a teamspace to track progress, workload, and activity - effortlessly.. Learn more",
      cta_primary: "Add teamspace",
    },
    work_item_types: {
      title: "Create and customize work item types",
      description:
        "Define unique work item types for your project. Each type can have its own properties, workflows, and fields - tailored to your project and team's needs.",
      cta_primary: "Enable",
    },
    work_item_type_properties: {
      title:
        "Define the property and details you want to capture for this work item type. Customize it to match your project's workflow.",
      cta_secondary: "Add property",
    },
    epic_setting: {
      title: "Enable Epics",
      description:
        "Group related work items into larger bodies that span multiple cycles and modules - perfect for tracking big-picture progress.",
      cta_primary: "Enable",
    },
    templates: {
      title: "No templates yet",
      description: "Reduce setup time by creating templates for work items, and pages — and start new work in seconds.",
      cta_primary: "Create your first template",
    },
    recurring_work_items: {
      title: "No recurring work item yet",
      description: "Set up recurring work items to automate repeat tasks and stay on schedule effortlessly.",
      cta_primary: "Create recurring work item",
    },
    worklogs: {
      title: "Track timesheets for all members",
      description: "Log time on work items to view detailed timesheets for any team member across projects.",
    },
    customers_setting: {
      title: "Enable customer management to get started.",
      cta_primary: "Enable",
    },
    template_setting: {
      title: "No templates yet",
      description:
        "Reduce setup time by creating templates for projects, work items, and pages — and start new work in seconds.",
      cta_primary: "Create template",
    },
  },
} as const;
