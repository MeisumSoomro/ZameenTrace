# Schema Overview

## `users`

Core identity table for farmers, neighbors, surveyors, operators, and government admins.

Important fields:

- `id`
- `full_name`
- `email`
- `phone`
- `role`

## `land_parcels`

Stores the current, active state of each parcel.

Important fields:

- `parcel_id` - external unique parcel identifier
- `owner_user_id` - current owner reference
- `owner_*_snapshot` - owner details preserved on the parcel record
- `province`, `district`, `tehsil`, `village`
- `boundary`
- `area_sqm`
- `centroid`
- `status`
- `current_version_id`

## `land_parcel_versions`

Immutable-style history table for parcel changes.

Important fields:

- `parcel_id`
- `version_number`
- `change_type`
- `boundary`
- `area_sqm`
- `changed_by_user_id`
- `change_reason`

Use this table for:

- boundary updates
- ownership snapshot changes
- later audit and rollback workflows

## `verification_approvals`

Stores neighbor or stakeholder approvals against a specific parcel version.

Important fields:

- `parcel_id`
- `parcel_version_id`
- `approver_user_id`
- `relationship_to_parcel`
- `status`

## `dispute_records`

Tracks parcel disputes and their resolution state.

Important fields:

- `parcel_id`
- `parcel_version_id`
- `raised_by_user_id`
- `dispute_category`
- `title`
- `description`
- `status`
- `resolution_notes`

## Relationship summary

- one user can own many parcels
- one parcel has many versions
- one parcel version can have many approvals
- one parcel can have many disputes
- a dispute may point to a specific parcel version when relevant

## Migration file

The initial schema is defined in `database/migrations/0001_core_schema.sql`.
