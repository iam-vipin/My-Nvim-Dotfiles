# Payment Module

Subscription and billing management.

## Purpose

Handles workspace subscriptions, seat management, and payment processing.

## Directory Structure

```
payment/
├── views/                       # Payment API views (11+ endpoints)
│   ├── product.py               # Product management
│   ├── subscription.py          # Subscription handling
│   ├── license.py               # License management
│   ├── seat.py                  # Seat management
│   └── trial.py                 # Trial subscriptions
├── flags/                       # Feature flag management
├── bgtasks/                     # Payment background tasks
├── utils/                       # Payment utilities
│   ├── workspace_licensing.py   # Workspace license utils
│   └── member_payment.py        # Member payment calculation
├── urls.py                      # API routing
├── rate_limit.py                # Payment rate limiting
├── apps.py                      # Django app config
└── migrations/                  # Database migrations
```

## API Endpoints

| Endpoint                          | Purpose                 |
| --------------------------------- | ----------------------- |
| `ProductEndpoint`                 | Product catalog         |
| `PaymentLinkEndpoint`             | Payment link generation |
| `WorkspaceProductEndpoint`        | Workspace products      |
| `SubscriptionEndpoint`            | Subscription management |
| `UpgradeSubscriptionEndpoint`     | Plan upgrades           |
| `WorkspaceLicenseEndpoint`        | License info            |
| `WorkspaceLicenseRefreshEndpoint` | License refresh         |
| `SeatManagementEndpoint`          | Seat allocation         |
| `TrialSubscriptionEndpoint`       | Trial management        |
| `EnterpriseLicenseEndpoint`       | Enterprise licensing    |

## Features

### Subscriptions

- Create and manage subscriptions
- Plan upgrades and downgrades
- Proration preview

### Seat Management

- Seat allocation per workspace
- Seat provisioning
- Usage tracking

### Trial Handling

- Free trial creation
- Trial expiration
- Conversion to paid

### Enterprise Licensing

- License activation/deactivation
- Seat modification
- License file handling
- Sync with license server

## Feature Flags (`flags/`)

Feature flag management for payment-gated features:

- Check workspace feature access
- Enable/disable features based on plan

## Utilities

### workspace_licensing.py

Workspace license validation and status.

### member_payment.py

Calculate member payment based on seat allocation.

## Background Tasks

Located in `bgtasks/`:

- Billing sync
- Subscription renewal
- Payment processing
- License validation
