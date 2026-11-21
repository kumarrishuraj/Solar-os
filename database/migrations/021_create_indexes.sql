-- ==============================================================================
-- Migration: 021_create_indexes.sql
-- Description: Create targeted indexes for high-traffic query performance
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- 2. Customers
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_city_state ON customers(city, state);

-- 3. Leads
CREATE INDEX IF NOT EXISTS idx_leads_lead_number ON leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_salesperson ON leads(assigned_salesperson_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 4. Projects
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(project_status);

-- 5. Property Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_customer ON property_assessments(customer_id);
CREATE INDEX IF NOT EXISTS idx_assessments_lead ON property_assessments(lead_id);
CREATE INDEX IF NOT EXISTS idx_assessments_project ON property_assessments(project_id);
CREATE INDEX IF NOT EXISTS idx_assessments_location ON property_assessments(city, state, postal_code);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON property_assessments(assessment_status);

-- 6. Assessment Images
CREATE INDEX IF NOT EXISTS idx_assessment_images_assessment ON assessment_images(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_images_type ON assessment_images(image_type);

-- 7. AI Analysis Results
CREATE INDEX IF NOT EXISTS idx_ai_analysis_assessment ON ai_analysis_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_status ON ai_analysis_results(analysis_status);

-- 8. Site Surveys
CREATE INDEX IF NOT EXISTS idx_surveys_project ON site_surveys(project_id);
CREATE INDEX IF NOT EXISTS idx_surveys_surveyor ON site_surveys(surveyor_id);
CREATE INDEX IF NOT EXISTS idx_surveys_approval ON site_surveys(approval_status);

-- 9. Products Catalog
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- 10. Solar Recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_assessment ON solar_recommendations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_project ON solar_recommendations(project_id);

-- 11. Quotations & Items
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_project ON quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(quotation_status);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_product ON quotation_items(product_id);

-- 12. Payments
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_quotation ON payments(quotation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);

-- 13. Inventory & Movements
CREATE INDEX IF NOT EXISTS idx_inventory_product_warehouse ON inventory(product_id, warehouse_name);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_movements(created_at DESC);

-- 14. Equipment
CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_product ON equipment(product_id);
CREATE INDEX IF NOT EXISTS idx_equipment_project ON equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_equipment_installation ON equipment(installation_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(equipment_status);

-- 15. Installations & Checklist
CREATE INDEX IF NOT EXISTS idx_installations_number ON installations(installation_number);
CREATE INDEX IF NOT EXISTS idx_installations_project ON installations(project_id);
CREATE INDEX IF NOT EXISTS idx_installations_technician ON installations(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(installation_status);
CREATE INDEX IF NOT EXISTS idx_installations_scheduled ON installations(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_checklist_installation ON installation_checklist(installation_id);

-- 16. Warranties
CREATE INDEX IF NOT EXISTS idx_warranties_equipment ON warranties(equipment_id);
CREATE INDEX IF NOT EXISTS idx_warranties_customer ON warranties(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(warranty_status);

-- 17. Telemetry (Time-series composite index)
CREATE INDEX IF NOT EXISTS idx_telemetry_equipment_time ON telemetry(equipment_id, timestamp DESC);

-- 18. Service Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_number ON service_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON service_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project ON service_tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_equipment ON service_tickets(equipment_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON service_tickets(ticket_status);
CREATE INDEX IF NOT EXISTS idx_tickets_technician ON service_tickets(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON service_tickets(priority);

-- 19. Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
