import { layout, route } from "@react-router/dev/routes";
import type { RouteConfigEntry } from "@react-router/dev/routes";

export const extendedRoutes: RouteConfigEntry[] = [
  // ========================================================================
  // ALL APP ROUTES
  // ========================================================================
  layout("./(all)/layout.tsx", [
    // ======================================================================
    // WORKSPACE-SCOPED ROUTES
    // ======================================================================
    layout("./(all)/[workspaceSlug]/layout.tsx", [
      // ====================================================================
      // PROJECTS APP SECTION - WORKSPACE LEVEL ROUTES
      // ====================================================================
      layout("./(all)/[workspaceSlug]/(projects)/layout.tsx", [
        // --------------------------------------------------------------------
        // WORKSPACE LEVEL ROUTES
        // --------------------------------------------------------------------
        // Dashboards
        layout("./(all)/[workspaceSlug]/(projects)/dashboards/layout.tsx", [
          // Dashboards List
          layout("./(all)/[workspaceSlug]/(projects)/dashboards/(list)/layout.tsx", [
            route(":workspaceSlug/dashboards", "./(all)/[workspaceSlug]/(projects)/dashboards/(list)/page.tsx"),
          ]),

          // Dashboard Detail
          layout("./(all)/[workspaceSlug]/(projects)/dashboards/(detail)/[dashboardId]/layout.tsx", [
            route(
              ":workspaceSlug/dashboards/:dashboardId",
              "./(all)/[workspaceSlug]/(projects)/dashboards/(detail)/[dashboardId]/page.tsx"
            ),
          ]),
        ]),

        // Initiatives
        layout("./(all)/[workspaceSlug]/(projects)/initiatives/layout.tsx", [
          // Initiatives List
          layout("./(all)/[workspaceSlug]/(projects)/initiatives/(list)/layout.tsx", [
            route(":workspaceSlug/initiatives", "./(all)/[workspaceSlug]/(projects)/initiatives/(list)/page.tsx"),
          ]),

          // Initiative Overview
          layout("./(all)/[workspaceSlug]/(projects)/initiatives/(detail)/[initiativeId]/(overview)/layout.tsx", [
            route(
              ":workspaceSlug/initiatives/:initiativeId",
              "./(all)/[workspaceSlug]/(projects)/initiatives/(detail)/[initiativeId]/(overview)/page.tsx"
            ),
          ]),

          // Initiative Scope
          layout("./(all)/[workspaceSlug]/(projects)/initiatives/(detail)/[initiativeId]/scope/layout.tsx", [
            route(
              ":workspaceSlug/initiatives/:initiativeId/scope",
              "./(all)/[workspaceSlug]/(projects)/initiatives/(detail)/[initiativeId]/scope/page.tsx"
            ),
          ]),
        ]),

        // Customers
        layout("./(all)/[workspaceSlug]/(projects)/customers/layout.tsx", [
          // Customers List
          layout("./(all)/[workspaceSlug]/(projects)/customers/(list)/layout.tsx", [
            route(":workspaceSlug/customers", "./(all)/[workspaceSlug]/(projects)/customers/(list)/page.tsx"),
          ]),

          // Customer Detail
          layout("./(all)/[workspaceSlug]/(projects)/customers/(detail)/[customerId]/layout.tsx", [
            route(
              ":workspaceSlug/customers/:customerId",
              "./(all)/[workspaceSlug]/(projects)/customers/(detail)/[customerId]/page.tsx"
            ),
          ]),
        ]),

        // Advanced Search
        route(":workspaceSlug/search", "./(all)/[workspaceSlug]/(projects)/search/page.tsx"),

        // --------------------------------------------------------------------
        // TEAMSPACE LEVEL ROUTES
        // --------------------------------------------------------------------

        layout("./(all)/[workspaceSlug]/(projects)/teamspaces/layout.tsx", [
          // Teamspaces List
          layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(list)/layout.tsx", [
            route(":workspaceSlug/teamspaces", "./(all)/[workspaceSlug]/(projects)/teamspaces/(list)/page.tsx"),
          ]),

          // Teamspace Detail
          layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/layout.tsx", [
            // Teamspace Overview
            layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/(overview)/layout.tsx", [
              route(
                ":workspaceSlug/teamspaces/:teamspaceId",
                "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/(overview)/page.tsx"
              ),
            ]),

            // Teamspace Cycles
            layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/cycles/layout.tsx", [
              route(
                ":workspaceSlug/teamspaces/:teamspaceId/cycles",
                "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/cycles/page.tsx"
              ),
            ]),

            // Teamspace Issues
            layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/issues/layout.tsx", [
              route(
                ":workspaceSlug/teamspaces/:teamspaceId/issues",
                "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/issues/page.tsx"
              ),
            ]),

            // Teamspace Projects
            layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/projects/(list)/layout.tsx", [
              route(
                ":workspaceSlug/teamspaces/:teamspaceId/projects",
                "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/projects/(list)/page.tsx"
              ),
            ]),

            // Teamspace Project Detail
            layout(
              "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/projects/(detail)/layout.tsx",
              [
                route(
                  ":workspaceSlug/teamspaces/:teamspaceId/projects/:projectId",
                  "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/projects/(detail)/[projectId]/page.tsx"
                ),
              ]
            ),

            // Teamspace Pages
            layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/pages/layout.tsx", [
              // Pages List
              layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/pages/(list)/layout.tsx", [
                route(
                  ":workspaceSlug/teamspaces/:teamspaceId/pages",
                  "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/pages/(list)/page.tsx"
                ),
              ]),

              // Teamspace Page Detail
              layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/pages/(detail)/layout.tsx", [
                route(
                  ":workspaceSlug/teamspaces/:teamspaceId/pages/:pageId",
                  "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/pages/(detail)/[pageId]/page.tsx"
                ),
              ]),
            ]),

            // Teamspace Views
            layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/views/(list)/layout.tsx", [
              route(
                ":workspaceSlug/teamspaces/:teamspaceId/views",
                "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/views/(list)/page.tsx"
              ),
            ]),

            // Teamspace View Detail
            layout("./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/views/(detail)/layout.tsx", [
              route(
                ":workspaceSlug/teamspaces/:teamspaceId/views/:viewId",
                "./(all)/[workspaceSlug]/(projects)/teamspaces/(detail)/[teamspaceId]/views/(detail)/[viewId]/page.tsx"
              ),
            ]),
          ]),
        ]),

        // --------------------------------------------------------------------
        // END: TEAMSPACE LEVEL ROUTES
        // --------------------------------------------------------------------

        // --------------------------------------------------------------------
        // PROJECT LEVEL ROUTES
        // --------------------------------------------------------------------
        // Project Detail
        layout("./(all)/[workspaceSlug]/(projects)/projects/(detail)/layout.tsx", [
          // Project Overview
          layout("./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/overview/(list)/layout.tsx", [
            route(
              ":workspaceSlug/projects/:projectId/overview",
              "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/overview/(list)/page.tsx"
            ),
          ]),

          // Project Epics
          layout("./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/epics/layout.tsx", [
            // Epics List
            layout("./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/epics/(list)/layout.tsx", [
              route(
                ":workspaceSlug/projects/:projectId/epics",
                "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/epics/(list)/page.tsx"
              ),
            ]),

            // Project Epic Detail
            layout("./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/epics/(detail)/layout.tsx", [
              route(
                ":workspaceSlug/projects/:projectId/epics/:epicId",
                "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/epics/(detail)/[epicId]/page.tsx"
              ),
            ]),
          ]),

          // Project Automations
          layout(
            "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/automations/[automationId]/layout.tsx",
            [
              route(
                ":workspaceSlug/projects/:projectId/automations/:automationId",
                "./(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/automations/[automationId]/page.tsx"
              ),
            ]
          ),
        ]),

        // Pi Chat (Project Level)
        layout("./(all)/[workspaceSlug]/(projects)/projects/pi-chat/layout.tsx", [
          route(":workspaceSlug/projects/pi-chat", "./(all)/[workspaceSlug]/(projects)/projects/pi-chat/page.tsx"),
          route(
            ":workspaceSlug/projects/pi-chat/new",
            "./(all)/[workspaceSlug]/(projects)/projects/pi-chat/new/page.tsx"
          ),
          route(
            ":workspaceSlug/projects/pi-chat/:chatId",
            "./(all)/[workspaceSlug]/(projects)/projects/pi-chat/[chatId]/page.tsx"
          ),
        ]),
      ]),

      // ====================================================================
      // END: PROJECT LEVEL ROUTES
      // ====================================================================

      // ====================================================================
      // WIKI APP SECTION
      // ====================================================================

      layout("./(all)/[workspaceSlug]/(wiki)/wiki/layout.tsx", [
        // Wiki Home
        route(":workspaceSlug/wiki", "./(all)/[workspaceSlug]/(wiki)/wiki/page.tsx"),

        // Wiki Page Types
        // Public Pages
        layout("./(all)/[workspaceSlug]/(wiki)/wiki/(pageType)/public/layout.tsx", [
          route(":workspaceSlug/wiki/public", "./(all)/[workspaceSlug]/(wiki)/wiki/(pageType)/public/page.tsx"),
        ]),

        // Wiki Private Pages
        layout("./(all)/[workspaceSlug]/(wiki)/wiki/(pageType)/private/layout.tsx", [
          route(":workspaceSlug/wiki/private", "./(all)/[workspaceSlug]/(wiki)/wiki/(pageType)/private/page.tsx"),
        ]),

        // Wiki Archived Pages
        layout("./(all)/[workspaceSlug]/(wiki)/wiki/(pageType)/archived/layout.tsx", [
          route(":workspaceSlug/wiki/archived", "./(all)/[workspaceSlug]/(wiki)/wiki/(pageType)/archived/page.tsx"),
        ]),

        // Wiki Shared Pages
        layout("./(all)/[workspaceSlug]/(wiki)/wiki/(pageType)/shared/layout.tsx", [
          route(":workspaceSlug/wiki/shared", "./(all)/[workspaceSlug]/(wiki)/wiki/(pageType)/shared/page.tsx"),
        ]),

        // Wiki Page Detail
        layout("./(all)/[workspaceSlug]/(wiki)/wiki/[pageId]/layout.tsx", [
          route(":workspaceSlug/wiki/:pageId", "./(all)/[workspaceSlug]/(wiki)/wiki/[pageId]/page.tsx"),
        ]),
      ]),

      // ====================================================================
      // END: WIKI APP SECTION
      // ====================================================================

      // ====================================================================
      // PI APP SECTION
      // ====================================================================

      layout("./(all)/[workspaceSlug]/(pi)/pi-chat/layout.tsx", [
        // Pi Chat Home
        route(":workspaceSlug/pi-chat", "./(all)/[workspaceSlug]/(pi)/pi-chat/page.tsx"),

        // Pi Chat New
        route(":workspaceSlug/pi-chat/new", "./(all)/[workspaceSlug]/(pi)/pi-chat/new/page.tsx"),

        // Pi Chat Detail
        route(":workspaceSlug/pi-chat/:chatId", "./(all)/[workspaceSlug]/(pi)/pi-chat/[chatId]/page.tsx"),
      ]),

      // ====================================================================
      // END: PI APP SECTION
      // ====================================================================

      // ====================================================================
      // SETTINGS SECTION
      // ====================================================================
      layout("./(all)/[workspaceSlug]/(settings)/layout.tsx", [
        // --------------------------------------------------------------------
        // WORKSPACE SETTINGS
        // --------------------------------------------------------------------

        layout("./(all)/[workspaceSlug]/(settings)/settings/(workspace)/layout.tsx", [
          // Customers
          route(
            ":workspaceSlug/settings/customers",
            "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/customers/page.tsx"
          ),

          // Initiatives
          route(
            ":workspaceSlug/settings/initiatives",
            "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/initiatives/page.tsx"
          ),

          // Plane Intelligence
          route(
            ":workspaceSlug/settings/plane-intelligence",
            "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/plane-intelligence/page.tsx"
          ),

          // Project States
          route(
            ":workspaceSlug/settings/project-states",
            "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/project-states/page.tsx"
          ),

          // Teamspaces
          route(
            ":workspaceSlug/settings/teamspaces",
            "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/teamspaces/page.tsx"
          ),

          // Worklogs
          route(
            ":workspaceSlug/settings/worklogs",
            "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/worklogs/page.tsx"
          ),

          // Templates
          layout("./(all)/[workspaceSlug]/(settings)/settings/(workspace)/templates/(templates)/layout.tsx", [
            route(
              ":workspaceSlug/settings/templates",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/templates/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/templates/page",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/templates/(templates)/page/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/templates/project",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/templates/(templates)/project/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/templates/project/:templateId/publish",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/templates/(templates)/project/[templateId]/publish/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/templates/work-item",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/templates/(templates)/work-item/page.tsx"
            ),
          ]),

          // Integrations
          layout("./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/layout.tsx", [
            // Integrations - Create
            route(
              ":workspaceSlug/settings/integrations/create",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/create/page.tsx"
            ),

            // Integrations - App Management (Install/Edit)
            layout("./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/[appSlug]/layout.tsx", [
              route(
                ":workspaceSlug/settings/integrations/:appSlug/install",
                "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/[appSlug]/install/page.tsx"
              ),
              route(
                ":workspaceSlug/settings/integrations/:appSlug/edit",
                "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/[appSlug]/edit/page.tsx"
              ),
            ]),

            // Specific Integration Routes
            layout("./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/(integrations)/layout.tsx", [
              route(
                ":workspaceSlug/settings/integrations/github",
                "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/(integrations)/github/page.tsx"
              ),
              route(
                ":workspaceSlug/settings/integrations/github-enterprise",
                "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/(integrations)/github-enterprise/page.tsx"
              ),
              route(
                ":workspaceSlug/settings/integrations/gitlab",
                "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/(integrations)/gitlab/page.tsx"
              ),
              route(
                ":workspaceSlug/settings/integrations/gitlab-enterprise",
                "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/(integrations)/gitlab-enterprise/page.tsx"
              ),
              route(
                ":workspaceSlug/settings/integrations/sentry",
                "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/(integrations)/sentry/page.tsx"
              ),
              route(
                ":workspaceSlug/settings/integrations/slack",
                "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/integrations/(integrations)/slack/page.tsx"
              ),
            ]),
          ]),

          // Imports importers
          layout("./(all)/[workspaceSlug]/(settings)/settings/(workspace)/imports/(importers)/layout.tsx", [
            route(
              ":workspaceSlug/settings/imports/asana",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/imports/(importers)/asana/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/imports/clickup",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/imports/(importers)/clickup/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/imports/confluence",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/imports/(importers)/confluence/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/imports/csv",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/imports/(importers)/csv/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/imports/jira",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/imports/(importers)/jira/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/imports/jira-server",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/imports/(importers)/jira-server/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/imports/linear",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/imports/(importers)/linear/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/imports/notion",
              "./(all)/[workspaceSlug]/(settings)/settings/(workspace)/imports/(importers)/notion/page.tsx"
            ),
          ]),
        ]),

        // --------------------------------------------------------------------
        // ACCOUNT SETTINGS
        // --------------------------------------------------------------------

        layout("./(all)/[workspaceSlug]/(settings)/settings/account/layout.tsx", [
          route(
            ":workspaceSlug/settings/account/connections",
            "./(all)/[workspaceSlug]/(settings)/settings/account/connections/page.tsx"
          ),
        ]),

        // --------------------------------------------------------------------
        // PROJECT SETTINGS
        // --------------------------------------------------------------------

        layout("./(all)/[workspaceSlug]/(settings)/settings/projects/layout.tsx", [
          // Project Epics
          route(
            ":workspaceSlug/settings/projects/:projectId/epics",
            "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/epics/page.tsx"
          ),
          // Project Integrations
          route(
            ":workspaceSlug/settings/projects/:projectId/integrations",
            "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/integrations/page.tsx"
          ),
          // Project Updates
          route(
            ":workspaceSlug/settings/projects/:projectId/project-updates",
            "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/project-updates/page.tsx"
          ),
          // Project Work Item Types
          route(
            ":workspaceSlug/settings/projects/:projectId/work-item-types",
            "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/work-item-types/page.tsx"
          ),
          // Project Workflows
          route(
            ":workspaceSlug/settings/projects/:projectId/workflows",
            "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/workflows/page.tsx"
          ),
          // Project Features - Cycles
          route(
            ":workspaceSlug/settings/projects/:projectId/features/cycles",
            "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/features/cycles/page.tsx"
          ),
          // Recurring Work Items
          layout("./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/recurring-work-items/layout.tsx", [
            route(
              ":workspaceSlug/settings/projects/:projectId/recurring-work-items",
              "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/recurring-work-items/page.tsx"
            ),
            layout(
              "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/recurring-work-items/(details)/layout.tsx",
              [
                route(
                  ":workspaceSlug/settings/projects/:projectId/recurring-work-items/create",
                  "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/recurring-work-items/(details)/create/page.tsx"
                ),
                route(
                  ":workspaceSlug/settings/projects/:projectId/recurring-work-items/:recurringWorkItemId/update",
                  "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/recurring-work-items/(details)/[recurringWorkItemId]/update/page.tsx"
                ),
              ]
            ),
          ]),
          // Project Templates
          route(
            ":workspaceSlug/settings/projects/:projectId/templates",
            "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/templates/page.tsx"
          ),
          layout("./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/templates/(templates)/layout.tsx", [
            route(
              ":workspaceSlug/settings/projects/:projectId/templates/page",
              "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/templates/(templates)/page/page.tsx"
            ),
            route(
              ":workspaceSlug/settings/projects/:projectId/templates/work-item",
              "./(all)/[workspaceSlug]/(settings)/settings/projects/[projectId]/templates/(templates)/work-item/page.tsx"
            ),
          ]),
        ]),
      ]),
    ]),
    // ======================================================================
    // STANDALONE ROUTES (outside workspace context)
    // ======================================================================

    // --------------------------------------------------------------------
    // PROFILE SETTINGS
    // --------------------------------------------------------------------

    layout("./(all)/profile/layout.tsx", [route("profile/connections", "./(all)/profile/connections/page.tsx")]),

    // --------------------------------------------------------------------
    // STANDALONE ROUTES

    // Mobile Auth
    route("m/auth", "./m/auth/page.tsx"),

    // OAuth Consent Page
    layout("./oauth/layout.tsx", [route("oauth", "./oauth/page.tsx")]),

    // OAuth Installations
    layout("./(all)/installations/[provider]/layout.tsx", [
      route("installations/:provider", "./(all)/installations/[provider]/page.tsx"),
    ]),

    // Workspace Selector
    layout("./workspace-selector/layout.tsx", [
      route("workspace-selector/:feature/:identifier", "./workspace-selector/[feature]/[identifier]/page.tsx"),
    ]),

    // --------------------------------------------------------------------
    // END: STANDALONE ROUTES
    // --------------------------------------------------------------------
  ]),

  // ========================================================================
  // REDIRECT ROUTES
  // ========================================================================
  // Legacy URL redirects for backward compatibility

  // Pages to Wiki redirect: /:workspaceSlug/pages/:path*
  // → /:workspaceSlug/wiki/:path*
  route(":workspaceSlug/pages/*", "routes/redirects/extended/wiki.tsx"),
];
