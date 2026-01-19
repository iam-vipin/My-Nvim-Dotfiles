# OIDC Group Syncing

## Overview

OIDC Group Syncing allows organizations to automatically manage project membership in Plane based on group claims from their Identity Provider (IdP). When enabled, users are automatically added to mapped projects based on their OIDC group memberships, eliminating manual project assignment and ensuring access stays synchronized with your IdP.

---

## How It Works

### Authentication Flow with Group Syncing

1. User authenticates via your OIDC provider (Okta, Azure AD, Google Workspace, etc.)
2. Plane receives the user's group claims from the OIDC `userinfo` endpoint or ID token
3. Plane checks if any received groups are mapped to projects in the workspace
4. If the user is a workspace member and belongs to a mapped group, they are automatically added to the corresponding project(s)
5. On subsequent logins, memberships are synchronized - users are added to new projects if they joined new groups, and optionally removed if they left groups

---

## Configuration

### Prerequisites

- OIDC authentication must be configured and enabled for your workspace
- Domain verification must be completed (In case of cloud)
- Your IdP must be configured to include group claims in the OIDC response

### Step 1: Enable Group Syncing

1. Navigate to **Workspace Settings** > **Group Sync Configuration**
2. Enable the **Group Syncing** toggle
3. Configure the **Group Claim Name** (default: `groups`)
   - This is the claim name your IdP uses to send group information
   - Common values: `groups`, `roles`, `memberOf`, `custom:groups`

### Step 2: Map Groups to Projects

1. Navigate to **Workspace Settings** > **Group Sync Configuration**
2. Click **Add Group Mapping**
3. Configure the mapping:
   - **OIDC Group Name**: The exact group name as it appears in your IdP (e.g., `engineering-team`, `product-managers`)
   - **Target Project**: Select the project users should be added to
   - **Default Role**: Choose the role for auto-added members
     - **Admin** - Full project control
     - **Member** - Standard access (recommended)
     - **Guest** - View-only access

### Step 3: Configure Sync Behavior

| Setting           | Description                                               | Options                          |
| ----------------- | --------------------------------------------------------- | -------------------------------- |
| **Sync on Login** | Sync group memberships each time user logs in             | Enabled (recommended) / Disabled |
| **Auto-Remove**   | Remove users from projects when they leave the OIDC group | Enabled / Disabled (default)     |
| **Sync Interval** | Background sync frequency for membership updates          | Read only field (set to 24hrs)   |

---

## Behavior Details

### User Addition to Projects

When a user logs in and group syncing is enabled:

| Condition                                                            | Result                                         |
| -------------------------------------------------------------------- | ---------------------------------------------- |
| User is workspace member + in mapped OIDC group + not in project     | **Added to project** with configured role      |
| User is workspace member + in mapped OIDC group + already in project | No change (existing role preserved)            |
| User is NOT workspace member + in mapped OIDC group                  | **Not added** - must be workspace member first |
| User is workspace member + NOT in mapped OIDC group                  | No automatic addition                          |

### User Removal from Projects (when Auto-Remove is enabled)

| Condition                                               | Result                                                |
| ------------------------------------------------------- | ----------------------------------------------------- |
| User removed from OIDC group                            | **Removed from project on Next login or after 24hrs** |
| User was manually added to project (not via group sync) | **Never auto-removed**                                |
| User is only project admin                              | **Not removed** (prevents orphaned projects)          |

### Role Precedence

- If a user belongs to **multiple OIDC groups** mapped to the same project, they receive the **highest role** among all mappings
- **Manually assigned roles** are never downgraded by group sync
- Workspace role constraints still apply (e.g., workspace guests cannot be project admins)

## Common Use Cases

### Engineering Team Onboarding

**Scenario**: New engineers should automatically get access to all engineering projects.

**Solution**:

- Create IdP group: `engineering`
- Map `engineering` > Engineering Backend project (Member role)
- Map `engineering` > Engineering Frontend project (Member role)
- Map `engineering` > Infrastructure project (Guest role)

When a new engineer is added to the `engineering` group in your IdP, they automatically get access to all three projects on their first Plane login.

### Department-Based Access

**Scenario**: Each department has their own projects and should only see relevant work.

**Solution**:

- Map `product-team` > Product Roadmap project
- Map `design-team` > Design System project
- Map `marketing-team` > Marketing Campaigns project

Users only see projects relevant to their department.

### Cross-Functional Projects

**Scenario**: A special project needs members from multiple teams.

**Solution**:

- Create IdP group: `project-apollo`
- Map `project-apollo` > Project Apollo (Member role)
- Add relevant people to `project-apollo` in your IdP

All Project Apollo team members get access regardless of their department.

### Contractor Access

**Scenario**: Contractors need limited, view-only access to specific projects.

**Solution**:

- Create IdP group: `contractors`
- Map `contractors` > relevant projects with Guest role
- Enable Auto-Remove so access is revoked when contract ends

---

## Frequently Asked Questions

**Q: What happens to existing project members when I enable group syncing?**

Existing members are completely unaffected. Group syncing only adds new members going forward. Your current project membership remains intact.

---

**Q: Can users be in a project through both group sync AND manual assignment?**

Yes. If a user is manually added and also belongs to a mapped group, both are tracked. If auto-remove is enabled and they leave the group, they remain in the project because of their manual assignment.

---

**Q: What if I delete a group mapping?**

Deleting a mapping stops future automatic additions from that group. Users who were already added remain in the project - they are not automatically removed.

---

**Q: How do I handle a user who needs a different role than their group default?**

Manually change their role in the project. Manual role changes are preserved and not overwritten by group sync.

---

**Q: Can I map the same group to multiple projects?**

Yes. Create separate mappings for each project. The user will be added to all mapped projects when they log in.

---

**Q: How quickly do changes take effect?**

With Sync on Login enabled, changes take effect on the user's next login. If a user is currently logged in, they will see updates after their next authentication.

---

**Q: Does this work with SAML authentication?**

Currently, group syncing is only available for OIDC authentication. SAML group syncing may be added in a future release.

---
