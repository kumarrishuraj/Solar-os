"""Solar Recommendation Engine.

Rule-based sizing, irradiance calculation, panel layout estimation,
and financial payback modeling based on customer consumption and roof metrics.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SolarSystemRecommendation(BaseModel):
    """Recommended solar installation configuration and financial metrics."""

    recommended_capacity_kw: float = Field(..., description="Recommended DC system capacity in kW")
    estimated_panel_count: int = Field(..., description="Estimated number of solar panels required")
    panel_wattage_rating: int = Field(default=450, description="Rated wattage per panel (W)")
    estimated_annual_generation_kwh: float = Field(..., description="Projected first-year energy output in kWh")
    offset_percentage: float = Field(..., description="Percentage of customer electricity consumption offset by solar")
    estimated_total_cost: float = Field(..., description="Gross installation turnkey cost")
    estimated_net_cost: float = Field(..., description="Net cost after incentives and tax credits")
    simple_payback_years: float = Field(..., description="Estimated payback timeline in years")
    estimated_co2_offset_tons_per_year: float = Field(..., description="Estimated metric tons of CO2 offset annually")


class SolarRecommendationEngine:
    """Rules engine for sizing residential and light commercial solar PV installations."""

    AVERAGE_PANEL_AREA_SQM: float = 2.15  # Approximate footprint of a standard 450W module
    DEFAULT_PERFORMANCE_RATIO: float = 0.82  # System losses (wiring, inverter efficiency, dust)
    DEFAULT_PEAK_SUN_HOURS_PER_DAY: float = 4.5  # Normalized daily solar irradiance benchmark

    def __init__(self, cost_per_watt: float = 2.80, tax_credit_rate: float = 0.30):
        """Initialize engine with baseline regional economic constants."""
        self.cost_per_watt = cost_per_watt
        self.tax_credit_rate = tax_credit_rate

    def calculate_recommendation(
        self,
        usable_roof_area_sqm: float,
        annual_kwh_consumption: float,
        peak_sun_hours_per_day: Optional[float] = None,
        electricity_rate_per_kwh: float = 0.18,
    ) -> SolarSystemRecommendation:
        """Calculate system specifications and financial returns.

        Args:
            usable_roof_area_sqm: Clear roof surface available for modules.
            annual_kwh_consumption: Past 12-month electricity usage.
            peak_sun_hours_per_day: Local solar insolation (defaults to regional average).
            electricity_rate_per_kwh: Utility rate for avoided cost calculation.

        Returns:
            SolarSystemRecommendation with sizing and financial metrics.
        """
        # Placeholder: Rule logic will be expanded during feature implementation.
        # Max panels constrained by roof geometry
        max_panels_by_area = int(usable_roof_area_sqm // self.AVERAGE_PANEL_AREA_SQM)

        # Target system size based on 100% offset of electricity consumption
        psh = peak_sun_hours_per_day or self.DEFAULT_PEAK_SUN_HOURS_PER_DAY
        target_capacity_kw = annual_kwh_consumption / (365 * psh * self.DEFAULT_PERFORMANCE_RATIO)

        # Panel count based on 450W panels
        target_panels = int(round((target_capacity_kw * 1000) / 450))
        final_panels = min(target_panels, max_panels_by_area)
        final_capacity_kw = round((final_panels * 450) / 1000.0, 2)

        annual_generation = round(final_capacity_kw * 365 * psh * self.DEFAULT_PERFORMANCE_RATIO, 2)
        offset_pct = min(100.0, round((annual_generation / annual_kwh_consumption) * 100, 1)) if annual_kwh_consumption > 0 else 100.0

        gross_cost = round(final_capacity_kw * 1000 * self.cost_per_watt, 2)
        net_cost = round(gross_cost * (1.0 - self.tax_credit_rate), 2)
        annual_bill_savings = annual_generation * electricity_rate_per_kwh
        payback_years = round(net_cost / annual_bill_savings, 1) if annual_bill_savings > 0 else 0.0

        # Environmental impact (approx 0.85 lbs CO2 per kWh = 0.0003855 metric tons)
        co2_tons = round(annual_generation * 0.0003855, 2)

        return SolarSystemRecommendation(
            recommended_capacity_kw=final_capacity_kw,
            estimated_panel_count=final_panels,
            panel_wattage_rating=450,
            estimated_annual_generation_kwh=annual_generation,
            offset_percentage=offset_pct,
            estimated_total_cost=gross_cost,
            estimated_net_cost=net_cost,
            simple_payback_years=payback_years,
            estimated_co2_offset_tons_per_year=co2_tons,
        )
