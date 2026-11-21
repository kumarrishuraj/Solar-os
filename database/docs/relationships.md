# SolarOS Database Relationships & Referential Integrity

This document details all relational mappings, cardinalities, foreign key actions (`ON DELETE`), and architectural safeguards protecting business and financial records.

---

## 1. Cardinality & Foreign Key Matrix

| Source Table (Child) | Foreign Key Column | Target Table (Parent) | Cardinality | ON DELETE Action | Architectural Rationale |
|---|---|---|---|---|---|
| `leads` | `customer_id` | `customers` | N : 1 | `RESTRICT` | Prevents deleting customers with historical enquiries. |
| `leads` | `assigned_salesperson_id` | `users` | N : 1 | `SET NULL` | Preserves lead history if a sales agent departs. |
| `projects` | `customer_id` | `customers` | N : 1 | `RESTRICT` | Protects contracted solar assets and invoices. |
| `projects` | `lead_id` | `leads` | N : 1 | `SET NULL` | Preserves project if lead intake record is purged. |
| `property_assessments` | `customer_id` | `customers` | N : 1 | `RESTRICT` | Preserves site history. |
| `property_assessments` | `lead_id` | `leads` | N : 1 | `SET NULL` | Retains assessment if lead record changes. |
| `property_assessments` | `project_id` | `projects` | N : 1 | `SET NULL` | Decouples assessment from project cancellation. |
| `assessment_images` | `assessment_id` | `property_assessments` | N : 1 | `CASCADE` | Purges image references when assessment is deleted. |
| `ai_analysis_results` | `assessment_id` | `property_assessments` | N : 1 | `CASCADE` | Model results belong strictly to assessment instance. |
| `site_surveys` | `project_id` | `projects` | N : 1 | `RESTRICT` | Protects physical engineering survey evidence. |
| `site_surveys` | `assessment_id` | `property_assessments` | N : 1 | `SET NULL` | Keeps survey even if self-assessment is updated. |
| `site_surveys` | `surveyor_id` | `users` | N : 1 | `RESTRICT` | Preserves surveyor signature accountability. |
| `site_surveys` | `approved_by` | `users` | N : 1 | `SET NULL` | Retains approval record if engineer leaves. |
| `solar_recommendations` | `assessment_id` | `property_assessments` | N : 1 | `CASCADE` | Sizing models belong to the assessment instance. |
| `solar_recommendations` | `project_id` | `projects` | N : 1 | `SET NULL` | Retains recommendation history. |
| `quotations` | `project_id` | `projects` | N : 1 | `RESTRICT` | Prevents project deletion once bids are issued. |
| `quotations` | `customer_id` | `customers` | N : 1 | `RESTRICT` | Protects commercial bidding history. |
| `quotation_items` | `quotation_id` | `quotations` | N : 1 | `CASCADE` | Line items strictly belong to quotation contract. |
| `quotation_items` | `product_id` | `products` | N : 1 | `RESTRICT` | Prevents deleting hardware referenced in active bids. |
| `payments` | `project_id` | `projects` | N : 1 | `RESTRICT` | **CRITICAL**: Immutable financial ledger. |
| `payments` | `quotation_id` | `quotations` | N : 1 | `SET NULL` | Retains payment record even if quote is superseded. |
| `inventory` | `product_id` | `products` | N : 1 | `RESTRICT` | Catalog products cannot be deleted with stock. |
| `inventory_movements` | `product_id` | `products` | N : 1 | `RESTRICT` | Immutable physical movement ledger. |
| `inventory_movements` | `inventory_id` | `inventory` | N : 1 | `RESTRICT` | Protects warehouse ledger entries. |
| `inventory_movements` | `performed_by` | `users` | N : 1 | `SET NULL` | Preserves stock audit if warehouse worker departs. |
| `equipment` | `product_id` | `products` | N : 1 | `RESTRICT` | Cannot delete catalog item with active units. |
| `equipment` | `project_id` | `projects` | N : 1 | `SET NULL` | Unit can be unallocated and returned to stock. |
| `equipment` | `installation_id` | `installations` | N : 1 | `SET NULL` | Hardware can be detached if reinstalled. |
| `installations` | `project_id` | `projects` | N : 1 | `RESTRICT` | Protects physical installation operations. |
| `installations` | `assigned_technician_id`| `users` | N : 1 | `SET NULL` | Preserves installation record if technician leaves. |
| `installation_checklist`| `installation_id` | `installations` | N : 1 | `CASCADE` | Checklist belongs strictly to installation. |
| `installation_checklist`| `completed_by` | `users` | N : 1 | `SET NULL` | Retains sign-off task audit. |
| `warranties` | `equipment_id` | `equipment` | N : 1 | `RESTRICT` | **CRITICAL**: Legal warranty liability tracking. |
| `warranties` | `customer_id` | `customers` | N : 1 | `RESTRICT` | Customer warranty rights cannot be destroyed. |
| `telemetry` | `equipment_id` | `equipment` | N : 1 | `CASCADE` | High-frequency IoT data cleaned up with equipment. |
| `service_tickets` | `customer_id` | `customers` | N : 1 | `RESTRICT` | Customer service history protected. |
| `service_tickets` | `project_id` | `projects` | N : 1 | `SET NULL` | Ticket retained if project reference shifts. |
| `service_tickets` | `equipment_id` | `equipment` | N : 1 | `SET NULL` | Preserves ticket if faulty unit is decommissioned. |
| `service_tickets` | `assigned_technician_id`| `users` | N : 1 | `SET NULL` | Ticket preserved if technician re-assigned. |
| `audit_logs` | `user_id` | `users` | N : 1 | `SET NULL` | Audit log persists permanently. |

---

## 2. Preventing Accidental Deletion of Business Records

A common anti-pattern in relational databases is setting `ON DELETE CASCADE` indiscriminately across parent-child relationships. In SolarOS:
- Deleting a customer or project must **never** cascade into `payments`, `warranties`, `equipment`, or `installations`.
- The database enforces `ON DELETE RESTRICT` on all financial, contractual, and physical asset tables. If an administrator attempts to delete a customer with payments or projects, PostgreSQL throws a foreign key violation (`23503`).
- Cascade deletion is strictly restricted to ephemeral sub-entities:
  - `assessment_images` cascade when the parent `property_assessments` is dropped.
  - `ai_analysis_results` cascade when the parent `property_assessments` is dropped.
  - `quotation_items` cascade when their parent `quotations` contract is dropped.
  - `installation_checklist` cascades when the `installations` record is deleted.

---

## 3. Resolving Circular Dependencies

SolarOS has a mutual relationship between hardware and installation:
1. An `equipment` unit has a foreign key to the `installations` entity (`equipment.installation_id`).
2. An `installation` specifies physical work for a `project`, and equipment allocated to that project is physically mounted during the installation.

### Migration Resolution Strategy:
- In migration `015_create_equipment.sql`, the table `equipment` is created with column `installation_id UUID` **without** a foreign key constraint.
- In migration `016_create_installations.sql`, the `installations` table is created.
- Immediately following `installations` creation, `016_create_installations.sql` executes:
  ```sql
  ALTER TABLE equipment
      ADD CONSTRAINT fk_equipment_installation
      FOREIGN KEY (installation_id)
      REFERENCES installations(id)
      ON DELETE SET NULL;
  ```
This guarantees zero circular foreign key errors during migration runs and clean dependency teardown in `reset.sql`.
