// =============================================================================
// SolarOS — Comprehensive Mock Data
// Indian context demo data for all modules
// =============================================================================

import type {
  Lead, Customer, RooftopSurvey, SolarRecommendation, Quotation, Payment,
  InventoryItem, Equipment, Installation, ServiceTicket, Notification,
  ActivityEvent, DashboardStats, PipelineStage, RevenueDataPoint,
  InstallationProgressItem, MonitoringData, User, QuotationLineItem,
  SystemComponent, InstallationChecklistItem, TelemetryReading,
} from '@/types';

// --- Users ---

export const mockUsers: User[] = [
  { id: 'u1', email: 'rajesh@solaros.in', full_name: 'Rajesh Khanna', role: 'admin', phone: '+91 98765 43210', is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-11-20T08:00:00Z' },
  { id: 'u2', email: 'priya@solaros.in', full_name: 'Priya Sharma', role: 'sales_rep', phone: '+91 87654 32109', is_active: true, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-11-20T08:00:00Z' },
  { id: 'u3', email: 'vikram@solaros.in', full_name: 'Vikram Patel', role: 'surveyor', phone: '+91 76543 21098', is_active: true, created_at: '2026-03-10T10:00:00Z', updated_at: '2026-11-20T08:00:00Z' },
  { id: 'u4', email: 'anita@solaros.in', full_name: 'Anita Desai', role: 'engineer', phone: '+91 65432 10987', is_active: true, created_at: '2026-04-05T10:00:00Z', updated_at: '2026-11-20T08:00:00Z' },
  { id: 'u5', email: 'suresh@solaros.in', full_name: 'Suresh Kumar', role: 'technician', phone: '+91 54321 09876', is_active: true, created_at: '2026-05-20T10:00:00Z', updated_at: '2026-11-20T08:00:00Z' },
];

// --- Dashboard Stats ---

export const mockDashboardStats: DashboardStats = {
  total_revenue: 1245000,
  monthly_revenue: 320000,
  outstanding_payments: 210000,
  total_projects: 86,
  total_leads: 142,
  active_installations: 12,
  completed_installations: 68,
  project_completion_percent: 79,
};

// --- Pipeline Stages ---

export const mockPipelineStages: PipelineStage[] = [
  { stage: 'New Leads', count: 24, color: '#A8CE45' },
  { stage: 'Qualified', count: 18, color: '#829B83' },
  { stage: 'Survey', count: 12, color: '#55764D' },
  { stage: 'Design Approval', count: 8, color: '#5B9B64' },
  { stage: 'Quotation', count: 10, color: '#C5D1C5' },
  { stage: 'Installation', count: 8, color: '#3B423A' },
  { stage: 'Completed', count: 6, color: '#292C29' },
];

// --- Revenue Data ---

export const mockRevenueData: RevenueDataPoint[] = [
  { month: 'Jun', revenue: 180000, payments_received: 165000, outstanding: 15000 },
  { month: 'Jul', revenue: 220000, payments_received: 195000, outstanding: 25000 },
  { month: 'Aug', revenue: 195000, payments_received: 180000, outstanding: 15000 },
  { month: 'Sep', revenue: 310000, payments_received: 275000, outstanding: 35000 },
  { month: 'Oct', revenue: 280000, payments_received: 240000, outstanding: 40000 },
  { month: 'Nov', revenue: 320000, payments_received: 240000, outstanding: 80000 },
];

// --- Leads ---

export const mockLeads: Lead[] = [
  { id: 'l1', full_name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 98765 11111', address: '42, Lotus Colony, Baner', city: 'Pune', state: 'Maharashtra', postal_code: '411045', monthly_bill_avg: 4500, estimated_system_kw: 3, status: 'qualified', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Website', created_at: '2026-11-01T10:00:00Z', updated_at: '2026-11-18T08:00:00Z' },
  { id: 'l2', full_name: 'Priya Verma', email: 'priya.verma@outlook.com', phone: '+91 87654 22222', address: '15, Green Park Extension', city: 'New Delhi', state: 'Delhi', postal_code: '110016', monthly_bill_avg: 8500, estimated_system_kw: 5, status: 'survey_scheduled', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Referral', created_at: '2026-11-03T14:00:00Z', updated_at: '2026-11-19T10:00:00Z' },
  { id: 'l3', full_name: 'Aman Singh', email: 'aman.singh@yahoo.in', phone: '+91 76543 33333', address: '78, Sector 62', city: 'Noida', state: 'Uttar Pradesh', postal_code: '201309', monthly_bill_avg: 3200, estimated_system_kw: 2, status: 'new', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Facebook', created_at: '2026-11-10T09:00:00Z', updated_at: '2026-11-10T09:00:00Z' },
  { id: 'l4', full_name: 'Deepika Reddy', email: 'deepika.r@gmail.com', phone: '+91 65432 44444', address: '23, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', postal_code: '500033', monthly_bill_avg: 12000, estimated_system_kw: 8, status: 'quotation_sent', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Google Ads', created_at: '2026-10-25T11:00:00Z', updated_at: '2026-11-15T16:00:00Z' },
  { id: 'l5', full_name: 'Karthik Nair', email: 'karthik.nair@proton.me', phone: '+91 54321 55555', address: '56, Indiranagar', city: 'Bangalore', state: 'Karnataka', postal_code: '560038', monthly_bill_avg: 6800, estimated_system_kw: 4, status: 'contacted', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Website', created_at: '2026-11-08T13:00:00Z', updated_at: '2026-11-12T10:00:00Z' },
  { id: 'l6', full_name: 'Meena Iyer', email: 'meena.iyer@gmail.com', phone: '+91 43210 66666', address: '89, Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', postal_code: '600040', monthly_bill_avg: 5200, estimated_system_kw: 3, status: 'converted', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Referral', created_at: '2026-09-15T10:00:00Z', updated_at: '2026-10-20T14:00:00Z' },
  { id: 'l7', full_name: 'Sunil Joshi', email: 'sunil.joshi@hotmail.com', phone: '+91 32109 77777', address: '34, Aundh Road', city: 'Pune', state: 'Maharashtra', postal_code: '411007', monthly_bill_avg: 7500, estimated_system_kw: 5, status: 'lost', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Cold Call', created_at: '2026-10-01T09:00:00Z', updated_at: '2026-10-30T17:00:00Z' },
  { id: 'l8', full_name: 'Anjali Gupta', email: 'anjali.gupta@gmail.com', phone: '+91 21098 88888', address: '12, Civil Lines', city: 'Jaipur', state: 'Rajasthan', postal_code: '302006', monthly_bill_avg: 9000, estimated_system_kw: 6, status: 'new', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Instagram', created_at: '2026-11-18T15:00:00Z', updated_at: '2026-11-18T15:00:00Z' },
  { id: 'l9', full_name: 'Rohan Mehta', email: 'rohan.m@gmail.com', phone: '+91 10987 99999', address: '67, SG Highway', city: 'Ahmedabad', state: 'Gujarat', postal_code: '380054', monthly_bill_avg: 15000, estimated_system_kw: 10, status: 'qualified', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Website', created_at: '2026-11-05T11:00:00Z', updated_at: '2026-11-14T09:00:00Z' },
  { id: 'l10', full_name: 'Kavita Deshmukh', email: 'kavita.d@outlook.com', phone: '+91 09876 00000', address: '45, Koregaon Park', city: 'Pune', state: 'Maharashtra', postal_code: '411001', monthly_bill_avg: 5800, estimated_system_kw: 4, status: 'contacted', assigned_to: 'u2', assigned_to_name: 'Priya Sharma', source: 'Referral', created_at: '2026-11-12T08:00:00Z', updated_at: '2026-11-16T11:00:00Z' },
];

// --- Installation Progress ---

export const mockInstallationProgress: InstallationProgressItem[] = [
  { id: 'ip1', customer_name: 'Rahul Sharma', system_kw: 3, progress: 80, status: 'in_progress', city: 'Pune' },
  { id: 'ip2', customer_name: 'Priya Verma', system_kw: 5, progress: 45, status: 'in_progress', city: 'New Delhi' },
  { id: 'ip3', customer_name: 'Aman Singh', system_kw: 2, progress: 100, status: 'commissioned', city: 'Noida' },
  { id: 'ip4', customer_name: 'Meena Iyer', system_kw: 3, progress: 20, status: 'scheduled', city: 'Chennai' },
  { id: 'ip5', customer_name: 'Deepika Reddy', system_kw: 8, progress: 60, status: 'in_progress', city: 'Hyderabad' },
];

// --- Notifications ---

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Survey Approval Pending', description: 'Site survey for Priya Verma (New Delhi) requires your approval.', priority: 'warning', category: 'Survey', timestamp: '2026-11-21T08:30:00Z', read: false, link: '/surveys/s1' },
  { id: 'n2', title: 'Quotation Awaiting Response', description: 'Quotation Q-2026-042 sent to Deepika Reddy — no response in 5 days.', priority: 'info', category: 'Sales', timestamp: '2026-11-21T07:00:00Z', read: false, link: '/quotations/q1' },
  { id: 'n3', title: 'Low Stock Detected', description: 'Helios Pro 450W panels stock below reorder level — 8 units remaining.', priority: 'urgent', category: 'Inventory', timestamp: '2026-11-20T18:00:00Z', read: false, link: '/inventory' },
  { id: 'n4', title: 'Installation Scheduled Tomorrow', description: 'Installation for Rahul Sharma (3 kW) scheduled for 22 Nov — team assigned.', priority: 'info', category: 'Installation', timestamp: '2026-11-20T16:00:00Z', read: true, link: '/installations/i1' },
  { id: 'n5', title: 'Warranty Claim Received', description: 'Warranty claim #WC-089 received for inverter at Meena Iyer\'s installation.', priority: 'urgent', category: 'Service', timestamp: '2026-11-20T14:30:00Z', read: false, link: '/service' },
  { id: 'n6', title: 'New Lead from Website', description: 'Anjali Gupta submitted an enquiry from the website — 6 kW estimated.', priority: 'info', category: 'Leads', timestamp: '2026-11-18T15:00:00Z', read: true, link: '/leads/l8' },
  { id: 'n7', title: 'Payment Received', description: 'Payment of ₹1,85,000 received from Meena Iyer for Q-2026-038.', priority: 'info', category: 'Payment', timestamp: '2026-11-18T12:00:00Z', read: true, link: '/payments' },
];

// --- Activity Timeline ---

export const mockActivityEvents: ActivityEvent[] = [
  { id: 'a1', event: 'New Lead', description: 'Anjali Gupta submitted an enquiry from the website', user: 'System', timestamp: '2026-11-18T15:00:00Z', icon_type: 'customer' },
  { id: 'a2', event: 'Survey Submitted', description: 'Site survey completed for Priya Verma in New Delhi', user: 'Vikram Patel', timestamp: '2026-11-17T16:30:00Z', icon_type: 'survey' },
  { id: 'a3', event: 'AI Recommendation', description: '5 kW system recommended for Priya Verma based on survey data', user: 'SolarOS AI', timestamp: '2026-11-17T17:00:00Z', icon_type: 'recommendation' },
  { id: 'a4', event: 'Quotation Approved', description: 'Rahul Sharma approved quotation Q-2026-041 for ₹2,45,000', user: 'Rahul Sharma', timestamp: '2026-11-16T14:00:00Z', icon_type: 'quotation' },
  { id: 'a5', event: 'Payment Received', description: '₹1,85,000 advance payment from Meena Iyer via bank transfer', user: 'Finance', timestamp: '2026-11-15T11:00:00Z', icon_type: 'payment' },
  { id: 'a6', event: 'Installation Completed', description: '2 kW installation for Aman Singh in Noida successfully commissioned', user: 'Suresh Kumar', timestamp: '2026-11-14T17:00:00Z', icon_type: 'installation' },
  { id: 'a7', event: 'Service Ticket', description: 'Warranty claim raised for inverter issue at Meena Iyer\'s site', user: 'Meena Iyer', timestamp: '2026-11-13T10:00:00Z', icon_type: 'service' },
];

// --- Surveys ---

export const mockSurveys: RooftopSurvey[] = [
  { id: 's1', lead_id: 'l2', lead_name: 'Priya Verma', aerial_image_url: '', total_roof_area_sqm: 85, usable_roof_area_sqm: 62, detected_obstacles: [{ type: 'water_tank', x: 120, y: 80, area_sqm: 4.5 }, { type: 'staircase', x: 240, y: 150, area_sqm: 6.0 }], roof_pitch_deg: 15, azimuth_deg: 180, shading_factor: 0.08, roof_type: 'RCC Flat', roof_direction: 'South', cable_distance_m: 12, structural_notes: 'Strong RCC structure, suitable for panel installation', electrical_notes: 'Three-phase connection, adequate load capacity', surveyor_notes: 'Good site with minimal shading. Water tank can be worked around.', surveyor_id: 'u3', surveyor_name: 'Vikram Patel', status: 'submitted', scheduled_date: '2026-11-15', photos: [], created_at: '2026-11-15T10:00:00Z', updated_at: '2026-11-17T16:30:00Z' },
  { id: 's2', lead_id: 'l1', lead_name: 'Rahul Sharma', aerial_image_url: '', total_roof_area_sqm: 55, usable_roof_area_sqm: 38, detected_obstacles: [{ type: 'satellite_dish', x: 60, y: 45, area_sqm: 1.2 }], roof_pitch_deg: 10, azimuth_deg: 195, shading_factor: 0.05, roof_type: 'RCC Flat', roof_direction: 'South-West', cable_distance_m: 8, structural_notes: 'Well-maintained terrace', electrical_notes: 'Single-phase, may need upgrade for 3kW+ system', surveyor_notes: 'Compact but workable area. Satellite dish can be relocated.', surveyor_id: 'u3', surveyor_name: 'Vikram Patel', status: 'approved', scheduled_date: '2026-11-10', photos: [], created_at: '2026-11-10T10:00:00Z', updated_at: '2026-11-12T14:00:00Z' },
  { id: 's3', lead_id: 'l5', lead_name: 'Karthik Nair', aerial_image_url: '', total_roof_area_sqm: 70, usable_roof_area_sqm: 50, detected_obstacles: [], roof_pitch_deg: 5, azimuth_deg: 175, shading_factor: 0.03, roof_type: 'Metal Sheet', roof_direction: 'South', status: 'pending', scheduled_date: '2026-11-25', photos: [], surveyor_id: 'u3', surveyor_name: 'Vikram Patel', created_at: '2026-11-20T10:00:00Z', updated_at: '2026-11-20T10:00:00Z' },
];

// --- Quotations ---

export const mockQuotations: Quotation[] = [
  {
    id: 'q1', lead_id: 'l4', lead_name: 'Deepika Reddy', quotation_number: 'Q-2026-042', system_capacity_kw: 8, estimated_annual_kwh: 11680,
    line_items: [
      { id: 'li1', product_name: 'Helios Pro 450W Monocrystalline Panel', category: 'Solar Panels', brand: 'SunPeak Energy', quantity: 18, unit_price: 18500, discount_percent: 5, gst_percent: 12, total: 316260 },
      { id: 'li2', product_name: 'SolarWave 10kW Hybrid Inverter', category: 'Inverter', brand: 'VoltWave Tech', quantity: 1, unit_price: 125000, discount_percent: 0, gst_percent: 12, total: 140000 },
      { id: 'li3', product_name: 'Roof Mounting Structure (8kW)', category: 'Mounting', brand: 'RoofTech', quantity: 1, unit_price: 32000, discount_percent: 0, gst_percent: 18, total: 37760 },
      { id: 'li4', product_name: 'DC Cables & Connectors Kit', category: 'Cables', brand: 'SolarCab', quantity: 1, unit_price: 8500, discount_percent: 0, gst_percent: 18, total: 10030 },
    ],
    subtotal: 489800, discount_amount: 16650, gst_amount: 56780, installation_charges: 45000, total_cost: 591580, net_cost: 591580,
    status: 'sent', valid_until: '2026-12-15', notes: 'Price valid for 30 days. Installation within 2 weeks of approval.',
    created_at: '2026-11-10T10:00:00Z', updated_at: '2026-11-10T10:00:00Z'
  },
  {
    id: 'q2', lead_id: 'l1', lead_name: 'Rahul Sharma', quotation_number: 'Q-2026-041', system_capacity_kw: 3, estimated_annual_kwh: 4380,
    line_items: [
      { id: 'li5', product_name: 'Helios Pro 450W Monocrystalline Panel', category: 'Solar Panels', brand: 'SunPeak Energy', quantity: 7, unit_price: 18500, discount_percent: 5, gst_percent: 12, total: 123025 },
      { id: 'li6', product_name: 'SolarWave 3.6kW Grid-Tied Inverter', category: 'Inverter', brand: 'VoltWave Tech', quantity: 1, unit_price: 48000, discount_percent: 0, gst_percent: 12, total: 53760 },
      { id: 'li7', product_name: 'Roof Mounting Structure (3kW)', category: 'Mounting', brand: 'RoofTech', quantity: 1, unit_price: 15000, discount_percent: 0, gst_percent: 18, total: 17700 },
    ],
    subtotal: 181500, discount_amount: 6475, gst_amount: 20085, installation_charges: 25000, total_cost: 245110, net_cost: 245110,
    status: 'approved', valid_until: '2026-12-01',
    created_at: '2026-11-05T10:00:00Z', updated_at: '2026-11-16T14:00:00Z'
  },
  {
    id: 'q3', lead_id: 'l9', lead_name: 'Rohan Mehta', quotation_number: 'Q-2026-043', system_capacity_kw: 10, estimated_annual_kwh: 14600,
    line_items: [
      { id: 'li8', product_name: 'Helios Pro 450W Monocrystalline Panel', category: 'Solar Panels', brand: 'SunPeak Energy', quantity: 22, unit_price: 18500, discount_percent: 8, gst_percent: 12, total: 374136 },
      { id: 'li9', product_name: 'SolarWave 10kW Hybrid Inverter', category: 'Inverter', brand: 'VoltWave Tech', quantity: 1, unit_price: 125000, discount_percent: 5, gst_percent: 12, total: 133000 },
    ],
    subtotal: 507136, discount_amount: 38150, gst_amount: 56300, installation_charges: 55000, total_cost: 618436, net_cost: 618436,
    status: 'draft', valid_until: '2026-12-20',
    created_at: '2026-11-18T10:00:00Z', updated_at: '2026-11-18T10:00:00Z'
  },
];

// --- Payments ---

export const mockPayments: Payment[] = [
  { id: 'p1', quotation_id: 'q2', lead_id: 'l1', customer_name: 'Rahul Sharma', amount: 125000, payment_method: 'bank_transfer', status: 'completed', reference_number: 'TXN-2026-8841', payment_date: '2026-11-16', created_at: '2026-11-16T14:00:00Z', updated_at: '2026-11-16T14:00:00Z' },
  { id: 'p2', quotation_id: 'q2', lead_id: 'l1', customer_name: 'Rahul Sharma', amount: 120110, payment_method: 'upi', status: 'pending', payment_date: '2026-11-28', created_at: '2026-11-16T14:00:00Z', updated_at: '2026-11-16T14:00:00Z' },
  { id: 'p3', quotation_id: 'q1', lead_id: 'l4', customer_name: 'Deepika Reddy', amount: 200000, payment_method: 'bank_transfer', status: 'pending', payment_date: '2026-12-01', created_at: '2026-11-10T10:00:00Z', updated_at: '2026-11-10T10:00:00Z' },
  { id: 'p4', quotation_id: 'q5', lead_id: 'l6', customer_name: 'Meena Iyer', amount: 185000, payment_method: 'bank_transfer', status: 'completed', reference_number: 'TXN-2026-7723', payment_date: '2026-11-15', created_at: '2026-11-15T11:00:00Z', updated_at: '2026-11-15T11:00:00Z' },
];

// --- Inventory ---

export const mockInventory: InventoryItem[] = [
  { id: 'inv1', sku: 'SP-HEL-450', category: 'panel', manufacturer: 'SunPeak Energy', model_name: 'Helios Pro 450W Monocrystalline', rated_capacity_watts: 450, efficiency_pct: 21.8, unit_cost: 18500, quantity_on_hand: 8, reserved_quantity: 7, available_quantity: 1, reorder_level: 20, warranty_years: 25, warehouse: 'Pune Main', specifications: { cell_type: 'Monocrystalline PERC', dimensions: '2094×1038×35 mm', weight: '24.5 kg' }, status: 'low_stock', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-11-20T18:00:00Z' },
  { id: 'inv2', sku: 'INV-VW-76H', category: 'inverter', manufacturer: 'VoltWave Tech', model_name: 'SolarWave 7.6kW Hybrid Inverter', rated_capacity_watts: 7600, efficiency_pct: 97.5, unit_cost: 95000, quantity_on_hand: 15, reserved_quantity: 3, available_quantity: 12, reorder_level: 5, warranty_years: 12, warehouse: 'Pune Main', specifications: { max_efficiency: '98.2%', mppt_channels: 2, nominal_ac_voltage: '240V' }, status: 'in_stock', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-11-18T10:00:00Z' },
  { id: 'inv3', sku: 'BAT-TV-10K', category: 'battery', manufacturer: 'TerraVault', model_name: 'HomeVault 10kWh LFP', rated_capacity_watts: 5000, efficiency_pct: 92, unit_cost: 58000, quantity_on_hand: 6, reserved_quantity: 2, available_quantity: 4, reorder_level: 3, warranty_years: 10, warehouse: 'Mumbai Depot', specifications: { chemistry: 'LiFePO4', usable_capacity: '9.6 kWh', round_trip: '90%' }, status: 'in_stock', created_at: '2026-03-10T10:00:00Z', updated_at: '2026-11-15T10:00:00Z' },
  { id: 'inv4', sku: 'MT-RT-3KW', category: 'racking', manufacturer: 'RoofTech', model_name: 'Universal Roof Mount (3kW Kit)', rated_capacity_watts: undefined, efficiency_pct: undefined, unit_cost: 15000, quantity_on_hand: 22, reserved_quantity: 4, available_quantity: 18, reorder_level: 10, warranty_years: 15, warehouse: 'Pune Main', specifications: { material: 'Hot-dip galvanized steel', wind_rating: '150 km/h' }, status: 'in_stock', created_at: '2026-04-05T10:00:00Z', updated_at: '2026-11-10T10:00:00Z' },
  { id: 'inv5', sku: 'CB-DC-4MM', category: 'cable', manufacturer: 'SolarCab', model_name: 'DC Solar Cable 4mm² (100m roll)', rated_capacity_watts: undefined, efficiency_pct: undefined, unit_cost: 4500, quantity_on_hand: 35, reserved_quantity: 10, available_quantity: 25, reorder_level: 15, warranty_years: 20, warehouse: 'Pune Main', specifications: { gauge: '4 mm²', insulation: 'XLPE', voltage_rating: '1000V DC' }, status: 'in_stock', created_at: '2026-05-01T10:00:00Z', updated_at: '2026-11-01T10:00:00Z' },
  { id: 'inv6', sku: 'INV-VW-36G', category: 'inverter', manufacturer: 'VoltWave Tech', model_name: 'SolarWave 3.6kW Grid-Tied Inverter', rated_capacity_watts: 3600, efficiency_pct: 97.2, unit_cost: 48000, quantity_on_hand: 0, reserved_quantity: 0, available_quantity: 0, reorder_level: 5, warranty_years: 10, warehouse: 'Pune Main', specifications: { max_efficiency: '97.8%', mppt_channels: 1 }, status: 'out_of_stock', created_at: '2026-02-15T10:00:00Z', updated_at: '2026-11-19T10:00:00Z' },
];

// --- Equipment (Individual Units) ---

export const mockEquipment: Equipment[] = [
  { id: 'eq1', serial_number: 'SP-HEL-2026-00142', inventory_item_id: 'inv1', product_name: 'Helios Pro 450W Panel', category: 'panel', brand: 'SunPeak Energy', model: 'Helios Pro 450W', purchase_date: '2026-06-15', warranty_expiry: '2051-06-15', project_id: 'i1', project_name: 'Rahul Sharma - 3kW', dispatch_status: 'installed', created_at: '2026-06-15T10:00:00Z', updated_at: '2026-11-14T10:00:00Z' },
  { id: 'eq2', serial_number: 'INV-VW-2026-00058', inventory_item_id: 'inv2', product_name: 'SolarWave 7.6kW Hybrid', category: 'inverter', brand: 'VoltWave Tech', model: 'SolarWave 7.6kW', purchase_date: '2026-07-01', warranty_expiry: '2038-07-01', project_id: 'i2', project_name: 'Deepika Reddy - 8kW', dispatch_status: 'dispatched', created_at: '2026-07-01T10:00:00Z', updated_at: '2026-11-18T10:00:00Z' },
  { id: 'eq3', serial_number: 'BAT-TV-2026-00023', inventory_item_id: 'inv3', product_name: 'HomeVault 10kWh LFP', category: 'battery', brand: 'TerraVault', model: 'HomeVault 10kWh', purchase_date: '2026-08-10', warranty_expiry: '2036-08-10', dispatch_status: 'in_warehouse', created_at: '2026-08-10T10:00:00Z', updated_at: '2026-08-10T10:00:00Z' },
  { id: 'eq4', serial_number: 'SP-HEL-2026-00178', inventory_item_id: 'inv1', product_name: 'Helios Pro 450W Panel', category: 'panel', brand: 'SunPeak Energy', model: 'Helios Pro 450W', purchase_date: '2026-09-01', warranty_expiry: '2051-09-01', dispatch_status: 'reserved', project_id: 'i3', project_name: 'Priya Verma - 5kW', created_at: '2026-09-01T10:00:00Z', updated_at: '2026-11-15T10:00:00Z' },
];

// --- Installations ---

export const mockInstallations: Installation[] = [
  {
    id: 'i1', quotation_id: 'q2', lead_id: 'l1', customer_name: 'Rahul Sharma', system_capacity_kw: 3, scheduled_date: '2026-11-22', status: 'in_progress', progress_percent: 80,
    lead_technician_id: 'u5', lead_technician_name: 'Suresh Kumar', team_members: ['Suresh Kumar', 'Ramesh Yadav'],
    equipment_serial_numbers: ['SP-HEL-2026-00142', 'SP-HEL-2026-00143', 'SP-HEL-2026-00144', 'SP-HEL-2026-00145', 'SP-HEL-2026-00146', 'SP-HEL-2026-00147', 'SP-HEL-2026-00148'],
    checklist: [
      { id: 'ck1', label: 'Site preparation', completed: true },
      { id: 'ck2', label: 'Mounting structure installed', completed: true },
      { id: 'ck3', label: 'Panels mounted', completed: true },
      { id: 'ck4', label: 'DC wiring completed', completed: true },
      { id: 'ck5', label: 'Inverter installed', completed: false },
      { id: 'ck6', label: 'AC wiring completed', completed: false },
      { id: 'ck7', label: 'Earthing & protection', completed: false },
      { id: 'ck8', label: 'System testing', completed: false },
      { id: 'ck9', label: 'Customer handover', completed: false },
    ],
    photos: [], commissioning_notes: '', address: '42, Lotus Colony, Baner', city: 'Pune',
    created_at: '2026-11-16T10:00:00Z', updated_at: '2026-11-21T08:00:00Z'
  },
  {
    id: 'i2', quotation_id: 'q1', lead_id: 'l4', customer_name: 'Deepika Reddy', system_capacity_kw: 8, scheduled_date: '2026-11-28', status: 'scheduled', progress_percent: 0,
    lead_technician_id: 'u5', lead_technician_name: 'Suresh Kumar', team_members: ['Suresh Kumar', 'Ajay Patil', 'Dinesh Rathod'],
    equipment_serial_numbers: [], checklist: [], photos: [], address: '23, Jubilee Hills', city: 'Hyderabad',
    created_at: '2026-11-18T10:00:00Z', updated_at: '2026-11-18T10:00:00Z'
  },
];

// --- Service Tickets ---

export const mockServiceTickets: ServiceTicket[] = [
  { id: 'st1', ticket_number: 'SVC-2026-089', customer_name: 'Meena Iyer', installation_id: 'i-old-1', equipment_serial_number: 'INV-VW-2026-00041', type: 'warranty_claim', issue_description: 'Inverter displaying error E-023 (DC overvoltage) intermittently during peak hours. System shuts down and auto-restarts.', priority: 'high', status: 'open', assigned_technician_id: 'u5', assigned_technician_name: 'Suresh Kumar', warranty_applicable: true, warranty_status: 'Under Warranty — Valid until 2038', created_at: '2026-11-20T14:30:00Z', updated_at: '2026-11-20T14:30:00Z' },
  { id: 'st2', ticket_number: 'SVC-2026-088', customer_name: 'Aman Singh', installation_id: 'i-old-2', type: 'maintenance', issue_description: 'Routine 6-month maintenance inspection. Customer reported slight decrease in generation output.', priority: 'medium', status: 'in_progress', assigned_technician_id: 'u5', assigned_technician_name: 'Suresh Kumar', warranty_applicable: false, created_at: '2026-11-18T10:00:00Z', updated_at: '2026-11-19T10:00:00Z' },
  { id: 'st3', ticket_number: 'SVC-2026-085', customer_name: 'Vikas Kapoor', type: 'complaint', issue_description: 'Customer reports shadow from newly constructed adjacent building reducing output by ~30%.', priority: 'low', status: 'resolved', assigned_technician_id: 'u4', assigned_technician_name: 'Anita Desai', warranty_applicable: false, resolution: 'Assessed shading impact. Recommended micro-inverter upgrade for affected panels. Customer considering additional panels on unaffected section.', resolved_at: '2026-11-16T14:00:00Z', created_at: '2026-11-12T09:00:00Z', updated_at: '2026-11-16T14:00:00Z' },
];

// --- Monitoring (sample data, clearly marked as requiring real telemetry) ---

export const mockMonitoringData: MonitoringData[] = [
  {
    installation_id: 'i-old-3', customer_name: 'Aman Singh', system_capacity_kw: 2,
    today_generation_kwh: 7.2, monthly_generation_kwh: 198, total_generation_kwh: 1420,
    current_power_watts: 1650, system_health: 'healthy', inverter_status: 'Operating',
    last_updated: '2026-11-21T09:00:00Z',
    readings: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `2026-11-20T${String(i).padStart(2, '0')}:00:00Z`,
      power_output_watts: i >= 6 && i <= 18 ? Math.round(Math.sin((i - 6) / 12 * Math.PI) * 1800 + Math.random() * 200) : 0,
      dc_voltage: i >= 6 && i <= 18 ? 320 + Math.random() * 20 : 0,
      dc_current: i >= 6 && i <= 18 ? 5 + Math.random() * 1.5 : 0,
      inverter_temp_celsius: 25 + (i >= 6 && i <= 18 ? Math.sin((i - 6) / 12 * Math.PI) * 20 : 0),
      is_anomaly: false,
      anomaly_score: 0,
    })),
  },
];

// --- Recommendation (sample) ---

export const mockRecommendation: SolarRecommendation = {
  id: 'rec1',
  lead_id: 'l2',
  lead_name: 'Priya Verma',
  survey_id: 's1',
  input: {
    monthly_bill: 8500,
    state: 'Delhi',
    usable_area_sqm: 62,
    area_source: 'verified_survey',
    system_type: 'hybrid',
  },
  status: 'draft',
  version: 1,
  source: 'demo',
  target_capacity_kw: 5.0,
  recommended_capacity_kw: 5,
  estimated_panel_count: 11,
  panel_wattage_rating: 450,
  required_area_sqm: 28.5,
  estimated_monthly_consumption_kwh: 1050,
  estimated_annual_generation_kwh: 7300,
  monthly_generation_kwh: [540, 580, 680, 720, 740, 640, 520, 510, 590, 640, 590, 550],
  offset_percentage: 95,
  peak_sun_hours: 5.2,
  performance_ratio: 0.78,
  tariff_per_kwh: 8.0,
  annual_savings: 58400,
  installation_cost: 40000,
  estimated_total_cost: 385000,
  subsidy_amount: 40000,
  estimated_net_cost: 345000,
  simple_payback_years: 4.5,
  estimated_co2_offset_tons_per_year: 2.81,
  system_type: 'hybrid',
  inverter_model: 'SolarWave 7.6kW Hybrid Inverter',
  inverter_capacity_kw: 7.6,
  battery_model: 'HomeVault 10kWh LFP',
  battery_capacity_kwh: 9.6,
  mounting_type: 'Flush Mount',
  components: [
    { category: 'panel', label: 'Solar panels', name: 'Helios Pro 450W', brand: 'SunPeak Energy', model: 'Helios Pro 450W Monocrystalline', quantity: 11, unit: 'pcs', unit_price: 18500, specifications: { wattage: 450, efficiency: '21.8%', type: 'Monocrystalline PERC' }, from_catalog: true },
    { category: 'inverter', label: 'Inverter', name: 'SolarWave 7.6kW', brand: 'VoltWave Tech', model: 'SolarWave 7.6kW Hybrid Inverter', quantity: 1, unit: 'pcs', unit_price: 95000, specifications: { capacity: '7.6 kW', mppt: 2, efficiency: '98.2%' }, from_catalog: true },
    { category: 'battery', label: 'Battery', name: 'HomeVault 10kWh', brand: 'TerraVault', model: 'HomeVault 10kWh LFP', quantity: 1, unit: 'pcs', unit_price: 58000, specifications: { capacity: '10 kWh', usable: '9.6 kWh', chemistry: 'LiFePO4' }, from_catalog: true },
    { category: 'racking', label: 'Mounting structure', name: 'Universal Roof Mount', brand: 'RoofTech', model: 'Universal Mount Kit (5kW)', quantity: 1, unit: 'kit', unit_price: 22000, specifications: { material: 'Galvanized Steel', wind: '150 km/h' }, from_catalog: true },
    { category: 'cable_dc', label: 'DC cables', name: 'DC Solar Cable Kit', brand: 'SolarCab', model: '4mm² DC Cable + MC4', quantity: 1, unit: 'kit', unit_price: 8500, specifications: {}, from_catalog: true },
    { category: 'protection', label: 'Protection devices', name: 'DC/AC Protection Kit', brand: 'SafeGrid', model: 'SPD + MCB + MCCB', quantity: 1, unit: 'kit', unit_price: 12000, specifications: {}, from_catalog: true },
    { category: 'earthing', label: 'Earthing & LA', name: 'Solar Earthing Kit', brand: 'SafeGrid', model: 'LA + Earth Pit', quantity: 1, unit: 'kit', unit_price: 6500, specifications: {}, from_catalog: true },
  ],
  checks: [],
  assumptions: ['Estimated based on 1050 kWh monthly consumption and 5.2 PSH.'],
  warnings: [],
  electrical_checks_complete: true,
  created_at: '2026-11-17T17:00:00Z',
  updated_at: '2026-11-17T17:00:00Z',
};
