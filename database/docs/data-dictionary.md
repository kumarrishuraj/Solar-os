# SolarOS Data Dictionary

Complete field-by-field reference dictionary for all tables in the SolarOS database.

---

## 1. `users`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Internal user unique identifier |
| `auth_user_id` | UUID | YES | NULL | UNIQUE | Link to Supabase Auth (`auth.users.id`) |
| `full_name` | VARCHAR(150) | NO | - | 1-150 chars | Full legal name of staff member |
| `email` | VARCHAR(255) | NO | - | UNIQUE, Email regex | Official corporate email address |
| `phone` | VARCHAR(20) | YES | NULL | E.164 / Indian phone format | Mobile / direct contact number |
| `role` | VARCHAR(30) | NO | - | `admin`, `director`, `sales`, `surveyor`, `engineer`, `finance`, `warehouse`, `technician`, `service_agent` | Role-based authorization group |
| `is_active` | BOOLEAN | NO | TRUE | TRUE / FALSE | Status of staff access |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Record insertion time |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Last update timestamp |

---

## 2. `customers`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Customer unique identifier |
| `full_name` | VARCHAR(150) | NO | - | 1-150 chars | Individual or company name |
| `email` | VARCHAR(255) | YES | NULL | Valid email format | Primary contact email |
| `phone` | VARCHAR(20) | NO | - | 10-20 chars | Primary telephone number |
| `alternate_phone` | VARCHAR(20) | YES | NULL | 10-20 chars | Secondary telephone number |
| `property_address`| TEXT | NO | - | - | Street address of property |
| `city` | VARCHAR(100) | NO | - | Indian city | City of installation |
| `state` | VARCHAR(100) | NO | - | Indian state | State / Union territory |
| `postal_code` | VARCHAR(10) | NO | - | 6-digit PIN code | Postal PIN code |
| `latitude` | NUMERIC(10, 7) | YES | NULL | -90.0000000 to +90.0000000 | WGS84 GPS latitude |
| `longitude` | NUMERIC(10, 7) | YES | NULL | -180.0000000 to +180.0000000 | WGS84 GPS longitude |
| `property_type` | VARCHAR(50) | YES | 'residential'| `residential`, `commercial`, `industrial`, `agricultural`, `institutional`, `other` | Building category |
| `notes` | TEXT | YES | NULL | - | Customer preferences or directions |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Profile creation date |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Profile update date |

---

## 3. `leads`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Lead primary identifier |
| `lead_number` | VARCHAR(50) | NO | - | UNIQUE | Format: `LEAD-YYYY-XXXX` |
| `customer_id` | UUID | NO | - | FK -> `customers.id` (RESTRICT) | Associated customer |
| `source` | VARCHAR(50) | YES | 'website' | `website`, `referral`, `google_ads`, `exhibition`, `direct_walkin`, `other` | Acquisition channel |
| `monthly_electricity_bill`| NUMERIC(12, 2)| YES | NULL | >= 0 | Average utility bill in INR |
| `monthly_consumption_kwh` | NUMERIC(12, 2)| YES | NULL | >= 0 | Average monthly energy in kWh |
| `estimated_system_capacity_kw` | NUMERIC(10, 2)| YES | NULL | >= 0 | Indicative sizing in kW |
| `status` | VARCHAR(40) | NO | 'new' | `new`, `contacted`, `qualified`, `survey_scheduled`, `quotation_sent`, `converted`, `lost` | Lead stage |
| `assigned_salesperson_id` | UUID | YES | NULL | FK -> `users.id` (SET NULL) | Sales owner |
| `notes` | TEXT | YES | NULL | - | CRM interactions log |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Lead capture time |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Lead stage change time |

---

## 4. `projects`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Project primary identifier |
| `project_number` | VARCHAR(50) | NO | - | UNIQUE | Format: `PRJ-YYYY-XXXX` |
| `customer_id` | UUID | NO | - | FK -> `customers.id` (RESTRICT) | Contracting customer |
| `lead_id` | UUID | YES | NULL | FK -> `leads.id` (SET NULL) | Originating enquiry |
| `project_name` | VARCHAR(200) | NO | - | Descriptive title | Project display name |
| `proposed_capacity_kw` | NUMERIC(10, 2)| YES | NULL | >= 0 | Engineering capacity (kW) |
| `approved_capacity_kw` | NUMERIC(10, 2)| YES | NULL | >= 0 | Sanctioned capacity (kW) |
| `project_status` | VARCHAR(50) | NO | 'enquiry' | `enquiry`, `assessment`, `survey_pending`, `survey_approved`, `design_approved`, `quotation_pending`, `quotation_approved`, `payment_pending`, `ready_for_dispatch`, `installation_scheduled`, `installation_in_progress`, `completed`, `cancelled` | Project lifecycle status |
| `estimated_cost` | NUMERIC(14, 2)| YES | NULL | >= 0 | Estimated cost (INR) |
| `final_cost` | NUMERIC(14, 2)| YES | NULL | >= 0 | Final invoiced cost (INR) |
| `expected_completion_date`| DATE | YES | NULL | Valid date | Planned completion date |
| `actual_completion_date` | DATE | YES | NULL | Valid date | Actual grid sync date |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Project creation date |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Last milestone change |

---

## 5. `property_assessments`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Assessment identifier |
| `customer_id` | UUID | NO | - | FK -> `customers.id` (RESTRICT) | Property owner |
| `lead_id` | UUID | YES | NULL | FK -> `leads.id` (SET NULL) | Linked lead |
| `project_id` | UUID | YES | NULL | FK -> `projects.id` (SET NULL) | Linked project |
| `property_address`| TEXT | NO | - | Street address | Site location address |
| `city` | VARCHAR(100) | NO | - | City name | Site city |
| `state` | VARCHAR(100) | NO | - | State name | Site state |
| `postal_code` | VARCHAR(10) | NO | - | PIN | PIN code |
| `latitude` | NUMERIC(10, 7) | YES | NULL | -90 to +90 | Latitude |
| `longitude` | NUMERIC(10, 7) | YES | NULL | -180 to +180 | Longitude |
| `roof_length` | NUMERIC(10, 2) | YES | NULL | >= 0 | Length (in measurement_unit) |
| `roof_width` | NUMERIC(10, 2) | YES | NULL | >= 0 | Width (in measurement_unit) |
| `roof_area` | NUMERIC(12, 2) | YES | NULL | >= 0 | Total roof area |
| `usable_roof_area`| NUMERIC(12, 2) | YES | NULL | <= roof_area | Unshaded area available |
| `measurement_unit`| VARCHAR(20) | YES | 'sq_meters' | `sq_meters`, `sq_feet`, `sq_yards` | Area dimension unit |
| `roof_type` | VARCHAR(50) | YES | NULL | `flat_concrete`, `tin_shed`, `tiled`, `pitched_metal`, `other` | Roof surface classification |
| `roof_orientation`| VARCHAR(30) | YES | NULL | `south`, `south_west`, `south_east`, `east`, `west`, `north` | Facing azimuth orientation |
| `roof_tilt` | NUMERIC(6, 2) | YES | NULL | 0 to 90 degrees | Roof slope pitch |
| `number_of_roof_sections` | INTEGER | YES | 1 | >= 1 | Separate roof planes |
| `grid_availability` | BOOLEAN | YES | TRUE | TRUE / FALSE | Discom supply stability |
| `monthly_bill` | NUMERIC(12, 2) | YES | NULL | >= 0 | Current monthly bill (INR) |
| `monthly_consumption_kwh` | NUMERIC(12, 2) | YES | NULL | >= 0 | Electricity usage (kWh) |
| `connection_phase` | VARCHAR(30) | YES | NULL | `single_phase`, `three_phase` | Discom sanction phase |
| `preferred_solar_type` | VARCHAR(30) | YES | NULL | `on_grid`, `off_grid`, `hybrid` | System architecture preference |
| `budget` | NUMERIC(14, 2) | YES | NULL | >= 0 | Customer budget (INR) |
| `assessment_status` | VARCHAR(40) | NO | 'draft' | `draft`, `submitted`, `ai_analyzed`, `verified`, `superseded` | Assessment status |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Submission date |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Modification date |

---

## 6. `assessment_images`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Image primary key |
| `assessment_id` | UUID | NO | - | FK -> `property_assessments.id` (CASCADE) | Linked assessment |
| `file_path` | TEXT | NO | - | Supabase Storage path | S3/Supabase bucket relative path |
| `file_name` | VARCHAR(255) | NO | - | Filename with ext | Original uploaded filename |
| `mime_type` | VARCHAR(100) | NO | - | MIME string | `image/jpeg`, `image/png`, `application/pdf` |
| `file_size_bytes` | BIGINT | NO | - | > 0 | File size in bytes |
| `image_type` | VARCHAR(50) | NO | - | `rooftop_full_view`, `rooftop_angle`, `obstacles`, `shaded_area`, `electricity_bill`, `switchboard_meter`, `other` | Photograph classification |
| `uploaded_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Upload timestamp |

---

## 7. `ai_analysis_results`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | AI result record identifier |
| `assessment_id` | UUID | NO | - | FK -> `property_assessments.id` (CASCADE) | Evaluated assessment |
| `model_name` | VARCHAR(100) | NO | - | AI model identifier | e.g. `SolarVision-YOLOv8-Rooftop` |
| `model_version` | VARCHAR(100) | NO | - | SemVer version | e.g. `v1.2.0` |
| `analysis_status` | VARCHAR(40) | NO | 'completed' | `pending`, `processing`, `completed`, `failed` | Model run status |
| `detected_obstacles` | JSONB | YES | `'[]'::jsonb` | JSON array | Obstacle bounding boxes, labels, areas |
| `detected_shading_regions`| JSONB | YES | `'[]'::jsonb` | JSON array | Shaded polygon vertices and azimuth |
| `estimated_usable_area` | NUMERIC(12, 2)| YES | NULL | >= 0 | Usable rooftop area ($m^2$) |
| `proposed_panel_layout` | JSONB | YES | `'{}'::jsonb` | JSON object | Panel placement grid & string layout |
| `confidence` | NUMERIC(5, 4) | YES | NULL | 0.0000 to 1.0000 | Overall model confidence |
| `missing_information` | JSONB | YES | `'[]'::jsonb` | JSON array | Missing inputs detected |
| `raw_result_json` | JSONB | YES | `'{}'::jsonb` | JSON object | Full raw inference dictionary |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Inference completion timestamp |

---

## 8. `site_surveys`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Survey primary key |
| `project_id` | UUID | NO | - | FK -> `projects.id` (RESTRICT) | Target project |
| `assessment_id` | UUID | YES | NULL | FK -> `property_assessments.id` (SET NULL) | Baseline assessment |
| `surveyor_id` | UUID | NO | - | FK -> `users.id` (RESTRICT) | Assigned field surveyor |
| `scheduled_date` | TIMESTAMPTZ | NO | - | Future timestamp | Audit scheduled date & time |
| `actual_survey_date` | TIMESTAMPTZ | YES | NULL | Valid timestamp | Physical visit date & time |
| `verified_roof_area` | NUMERIC(12, 2)| YES | NULL | >= 0 | On-site laser measured area ($m^2$) |
| `verified_roof_orientation` | VARCHAR(30)| YES | NULL | `south`, `south_west`, etc. | Verified orientation |
| `verified_roof_tilt` | NUMERIC(6, 2) | YES | NULL | 0 to 90 degrees | Verified tilt degrees |
| `structural_observations` | TEXT | YES | NULL | - | Slab thickness, load stability |
| `shading_observations` | TEXT | YES | NULL | - | Shadow sources and path notes |
| `cable_distance` | NUMERIC(10, 2)| YES | NULL | >= 0 | Cable route length in meters |
| `electrical_observations` | TEXT | YES | NULL | - | DB board, sanction load, earthing |
| `safety_observations` | TEXT | YES | NULL | - | Working at heights safety check |
| `approval_status` | VARCHAR(30) | NO | 'pending' | `pending`, `approved`, `rejected`, `revision_required` | Engineering signoff status |
| `rejection_reason` | TEXT | YES | NULL | - | Details if survey is rejected |
| `approved_by` | UUID | YES | NULL | FK -> `users.id` (SET NULL) | Reviewing senior engineer |
| `approved_at` | TIMESTAMPTZ | YES | NULL | Valid timestamp | Approval timestamp |
| `remarks` | TEXT | YES | NULL | - | Surveyor general remarks |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Survey schedule creation |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Survey report submission |

---

## 9. `products`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Product primary identifier |
| `sku` | VARCHAR(80) | NO | - | UNIQUE | Stock Keeping Unit |
| `product_name` | VARCHAR(200) | NO | - | 1-200 chars | Commercial equipment name |
| `brand` | VARCHAR(100) | NO | - | 1-100 chars | Brand / Manufacturer |
| `model` | VARCHAR(100) | NO | - | 1-100 chars | Model number |
| `category` | VARCHAR(60) | NO | - | `solar_panel`, `inverter`, `battery`, `charge_controller`, `mounting_structure`, `cable`, `protection_device`, `accessory` | Equipment category |
| `rated_power_w` | NUMERIC(10, 2)| YES | NULL | >= 0 | Wattage rating (W) |
| `voltage` | NUMERIC(10, 2)| YES | NULL | >= 0 | Rated DC/AC voltage (V) |
| `current` | NUMERIC(10, 2)| YES | NULL | >= 0 | Rated DC/AC current (A) |
| `technical_specifications` | JSONB | YES | `'{}'::jsonb` | JSON object | Datasheet technical specs |
| `purchase_price` | NUMERIC(14, 2)| NO | - | >= 0 | Procurement cost (INR) |
| `selling_price` | NUMERIC(14, 2)| NO | - | >= 0 | Catalog price (INR) |
| `warranty_months` | INTEGER | NO | 60 | >= 0 | Standard warranty (Months) |
| `is_active` | BOOLEAN | NO | TRUE | TRUE / FALSE | Active in catalog |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Creation date |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Price / spec update date |

---

## 10. `solar_recommendations`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Recommendation identifier |
| `assessment_id` | UUID | NO | - | FK -> `property_assessments.id` (CASCADE) | Evaluated assessment |
| `project_id` | UUID | YES | NULL | FK -> `projects.id` (SET NULL) | Linked project |
| `system_capacity_kw` | NUMERIC(10, 2)| NO | - | >= 0 | Recommended DC capacity (kW) |
| `estimated_generation_kwh`| NUMERIC(12, 2)| NO | - | >= 0 | Annual generation yield (kWh) |
| `estimated_monthly_savings`| NUMERIC(12, 2)| NO | - | >= 0 | Monthly power bill savings (INR) |
| `estimated_payback_years` | NUMERIC(8, 2) | NO | - | >= 0 | Estimated ROI period (Years) |
| `recommendation_source` | VARCHAR(30) | NO | 'engineering' | `engineering`, `ai_model`, `hybrid`, `customer_custom` | Recommendation generator |
| `assumptions` | JSONB | YES | `'{}'::jsonb` | JSON object | Tariffs, sun-hours, degradation |
| `warnings` | JSONB | YES | `'[]'::jsonb` | JSON array | Structural or electrical cautions |
| `configuration` | JSONB | YES | `'{}'::jsonb` | JSON object | Inverter & module configuration |
| `bom` | JSONB | YES | `'[]'::jsonb` | JSON array | Bill of materials line items |
| `approval_status` | VARCHAR(30) | NO | 'draft' | `draft`, `accepted`, `rejected`, `superseded` | Customer / engineer review |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Sizing date |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Revision date |

---

## 11. `quotations`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Quotation primary identifier |
| `quotation_number` | VARCHAR(50) | NO | - | UNIQUE | Format: `QT-YYYY-XXXX` |
| `project_id` | UUID | NO | - | FK -> `projects.id` (RESTRICT) | Target project |
| `customer_id` | UUID | NO | - | FK -> `customers.id` (RESTRICT) | Customer billed |
| `system_capacity_kw` | NUMERIC(10, 2)| NO | - | >= 0 | Quoted DC capacity (kW) |
| `subtotal` | NUMERIC(14, 2)| NO | - | >= 0 | Hardware & labor subtotal (INR) |
| `discount` | NUMERIC(14, 2)| NO | 0.00 | >= 0 AND <= subtotal | Promotional discount (INR) |
| `gst_amount` | NUMERIC(14, 2)| NO | 0.00 | >= 0 | GST tax amount (INR) |
| `installation_charges`| NUMERIC(14, 2)| NO | 0.00 | >= 0 | Freight, EPC & commissioning |
| `total_amount` | NUMERIC(14, 2)| NO | - | >= 0 | Net payable quotation total |
| `quotation_status` | VARCHAR(30) | NO | 'draft' | `draft`, `sent`, `approved`, `rejected`, `expired` | Commercial contract status |
| `valid_until` | DATE | NO | - | Future date | Quotation validity expiration |
| `approved_at` | TIMESTAMPTZ | YES | NULL | Valid timestamp | Customer signoff timestamp |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Proposal drafting time |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Proposal update time |

---

## 12. `quotation_items`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Item primary identifier |
| `quotation_id` | UUID | NO | - | FK -> `quotations.id` (CASCADE) | Parent quotation |
| `product_id` | UUID | NO | - | FK -> `products.id` (RESTRICT) | Quoted product |
| `description` | TEXT | NO | - | Item description | Line item text |
| `quantity` | NUMERIC(12, 2)| NO | - | > 0 | Units ordered |
| `unit_price` | NUMERIC(14, 2)| NO | - | >= 0 | Unit sale price (INR) |
| `total_price` | NUMERIC(14, 2)| NO | - | >= 0 | Line total (`qty * unit_price`) |

---

## 13. `payments`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Payment transaction ID |
| `project_id` | UUID | NO | - | FK -> `projects.id` (RESTRICT) | Associated project |
| `quotation_id` | UUID | YES | NULL | FK -> `quotations.id` (SET NULL) | Associated quotation |
| `amount` | NUMERIC(14, 2)| NO | - | > 0 | Remittance amount (INR) |
| `payment_method` | VARCHAR(40) | NO | - | `neft`, `rtgs`, `upi`, `cheque`, `net_banking`, `cash`, `bank_transfer`, `credit_line` | Payment rail |
| `transaction_reference` | VARCHAR(150)| NO | - | 1-150 chars | Bank UTR / UPI Ref ID / Cheque # |
| `payment_status` | VARCHAR(30) | NO | 'pending' | `pending`, `completed`, `failed`, `refunded` | Transaction clearance status |
| `payment_date` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Remittance value date |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Accounting entry time |

---

## 14. `inventory`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Inventory balance ID |
| `product_id` | UUID | NO | - | FK -> `products.id` (RESTRICT) | Hardware product |
| `warehouse_name` | VARCHAR(150)| NO | - | Warehouse identifier | Storage facility name |
| `quantity_on_hand`| NUMERIC(12, 2)| NO | 0.00 | >= 0 | Physical balance in stock |
| `quantity_reserved`| NUMERIC(12, 2)| NO | 0.00 | >= 0 AND <= quantity_on_hand | Allocated to active projects |
| `reorder_level` | NUMERIC(12, 2)| NO | 5.00 | >= 0 | Reorder trigger threshold |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Last balance modification |

---

## 15. `inventory_movements`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Movement transaction ID |
| `product_id` | UUID | NO | - | FK -> `products.id` (RESTRICT) | Product moved |
| `inventory_id` | UUID | NO | - | FK -> `inventory.id` (RESTRICT) | Warehouse inventory row |
| `movement_type` | VARCHAR(30) | NO | - | `purchase`, `reservation`, `release`, `dispatch`, `return`, `adjustment` | Inventory movement code |
| `quantity` | NUMERIC(12, 2)| NO | - | > 0 | Units transferred / allocated |
| `reference_type` | VARCHAR(50) | YES | NULL | `project`, `quotation`, `purchase_order`, `return_note`, `adjustment_audit` | Context entity type |
| `reference_id` | UUID | YES | NULL | Valid UUID | Context entity primary key |
| `performed_by` | UUID | YES | NULL | FK -> `users.id` (SET NULL) | Acting warehouse operator |
| `notes` | TEXT | YES | NULL | - | Logistics remarks |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Movement ledger entry time |

---

## 16. `equipment`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Physical unit primary key |
| `product_id` | UUID | NO | - | FK -> `products.id` (RESTRICT) | Product catalog link |
| `serial_number` | VARCHAR(150)| NO | - | UNIQUE | Manufacturer barcode / serial |
| `supplier` | VARCHAR(150)| NO | - | Supplier company name | Equipment distributor / vendor |
| `purchase_date` | DATE | NO | - | Valid date | Procurement invoice date |
| `warranty_start_date` | DATE | YES | NULL | Valid date | Factory warranty commencement |
| `warranty_end_date` | DATE | YES | NULL | >= warranty_start_date | Factory warranty expiration |
| `equipment_status`| VARCHAR(40) | NO | 'in_stock' | `in_stock`, `reserved`, `dispatched`, `installed`, `under_service`, `decommissioned` | Unit physical state |
| `project_id` | UUID | YES | NULL | FK -> `projects.id` (SET NULL) | Associated project |
| `installation_id`| UUID | YES | NULL | FK -> `installations.id` (SET NULL) | Associated installation site |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Serial entry time |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Status update time |

---

## 17. `installations`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Installation primary key |
| `project_id` | UUID | NO | - | FK -> `projects.id` (RESTRICT) | Target project |
| `installation_number`| VARCHAR(50) | NO | - | UNIQUE | Format: `INST-YYYY-XXXX` |
| `assigned_technician_id`| UUID | YES | NULL | FK -> `users.id` (SET NULL) | Lead technician / electrician |
| `scheduled_date` | TIMESTAMPTZ | NO | - | Valid timestamp | Planned site arrival |
| `start_time` | TIMESTAMPTZ | YES | NULL | Valid timestamp | Physical work started |
| `completion_time`| TIMESTAMPTZ | YES | NULL | >= start_time | Commissioning completed |
| `installation_status`| VARCHAR(40) | NO | 'scheduled' | `scheduled`, `in_progress`, `testing`, `completed`, `on_hold`, `cancelled` | Execution milestone |
| `progress_percentage`| NUMERIC(5, 2)| NO | 0.00 | 0.00 to 100.00 | Completion percentage |
| `system_capacity_kw` | NUMERIC(10, 2)| NO | - | >= 0 | Installed DC capacity |
| `testing_results` | JSONB | YES | `'{}'::jsonb` | JSON object | Commissioning test readings |
| `customer_confirmation`| BOOLEAN | YES | FALSE | TRUE / FALSE | Customer handover signoff |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Installation order creation |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated via trigger | Work log update time |

---

## 18. `installation_checklist`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Checklist item primary key |
| `installation_id` | UUID | NO | - | FK -> `installations.id` (CASCADE) | Target installation |
| `task_name` | VARCHAR(200)| NO | - | Task title | Standard operating procedure step |
| `is_completed` | BOOLEAN | NO | FALSE | TRUE / FALSE | Verification checkbox |
| `completed_by` | UUID | YES | NULL | FK -> `users.id` (SET NULL) | Signoff technician |
| `completed_at` | TIMESTAMPTZ | YES | NULL | Valid timestamp | Signoff time |
| `remarks` | TEXT | YES | NULL | - | Inspection notes |

---

## 19. `warranties`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Warranty certificate ID |
| `equipment_id` | UUID | NO | - | FK -> `equipment.id` (RESTRICT) | Covered serial hardware unit |
| `customer_id` | UUID | NO | - | FK -> `customers.id` (RESTRICT) | Policy beneficiary customer |
| `warranty_start_date`| DATE | NO | - | Valid date | Warranty commencement date |
| `warranty_end_date` | DATE | NO | - | >= warranty_start_date | Warranty expiration date |
| `warranty_status` | VARCHAR(30) | NO | 'active' | `active`, `expired`, `claimed`, `void` | Policy status |
| `warranty_document_path`| TEXT | YES | NULL | Supabase Storage path | Certificate PDF document path |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Policy activation timestamp |

---

## 20. `telemetry`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Telemetry event ID |
| `equipment_id` | UUID | NO | - | FK -> `equipment.id` (CASCADE) | Inverter unit transmitting |
| `timestamp` | TIMESTAMPTZ | NO | `NOW()` | Measurement timestamp | Sensor reading timestamp |
| `voltage` | NUMERIC(12, 3)| YES | NULL | >= 0 | AC output voltage (V) |
| `current` | NUMERIC(12, 3)| YES | NULL | >= 0 | AC output current (A) |
| `power` | NUMERIC(12, 3)| YES | NULL | >= 0 | Instantaneous power (W) |
| `temperature` | NUMERIC(8, 2) | YES | NULL | - | Inverter heatsink temperature (°C) |
| `energy_generated_kwh`| NUMERIC(12, 3)| YES | NULL | >= 0 | Cumulative daily energy (kWh) |
| `source` | VARCHAR(50) | YES | 'iot_gateway' | `iot_gateway`, `modbus_dongle`, `api_sync` | Transmitting sensor channel |

---

## 21. `service_tickets`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Service ticket ID |
| `ticket_number` | VARCHAR(50) | NO | - | UNIQUE | Format: `TKT-YYYY-XXXX` |
| `customer_id` | UUID | NO | - | FK -> `customers.id` (RESTRICT) | Reporting customer |
| `project_id` | UUID | YES | NULL | FK -> `projects.id` (SET NULL) | Affected plant |
| `equipment_id` | UUID | YES | NULL | FK -> `equipment.id` (SET NULL) | Faulty hardware |
| `issue_description` | TEXT | NO | - | Detailed description | Problem report |
| `issue_category` | VARCHAR(50) | NO | - | `inverter_fault`, `panel_damage`, `generation_drop`, `wiring_issue`, `physical_damage`, `routine_maintenance`, `other` | Issue classification |
| `priority` | VARCHAR(20) | NO | 'medium' | `low`, `medium`, `high`, `critical` | SLA severity |
| `assigned_technician_id`| UUID | YES | NULL | FK -> `users.id` (SET NULL) | Assigned technician |
| `ticket_status` | VARCHAR(40) | NO | 'open' | `open`, `assigned`, `in_progress`, `pending_parts`, `resolved`, `closed` | Ticket lifecycle |
| `resolution_notes` | TEXT | YES | NULL | - | Technical resolution narrative |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Ticket opening timestamp |
| `resolved_at` | TIMESTAMPTZ | YES | NULL | >= created_at | Ticket closure timestamp |

---

## 22. `audit_logs`
| Field Name | Type | Nullable | Default | Constraints / Allowed Values | Description |
|---|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Primary Key | Audit entry ID |
| `user_id` | UUID | YES | NULL | FK -> `users.id` (SET NULL) | Acting staff member |
| `action` | VARCHAR(100)| NO | - | Action name | Operational verb (e.g. `quotation_approved`) |
| `entity_type` | VARCHAR(100)| NO | - | Table name | Affected target table |
| `entity_id` | UUID | NO | - | Valid UUID | Target row primary key |
| `metadata` | JSONB | YES | `'{}'::jsonb` | JSON object | Change diff / audit context |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Valid timestamp | Event timestamp |
