-- ====================================================================
-- AquaVeris ActionIQ: Seed Reference Standards & Treatment Compatibility (Phase 2)
-- Standards: WHO Guidelines for Drinking-water Quality (4th Edition) & BIS IS 10500:2012
-- ====================================================================

-- 1. SEED REFERENCE STANDARDS
-- 9 Core Parameters: pH, Turbidity, TDS, Lead, Arsenic, Nitrates, Fluoride, Chlorine, Bacterial Count

INSERT INTO public.reference_standards 
  (standard_name, parameter_code, unit, acceptable_min, acceptable_max, qualitative_req, standard_version, source_url)
VALUES
  -- WHO Guidelines
  ('WHO Guidelines', 'ph', 'pH units', 6.5, 8.5, NULL, '4th Ed (2022)', 'https://www.who.int/publications/i/item/9789240045064'),
  ('WHO Guidelines', 'turbidity', 'NTU', NULL, 4.0, 'Preferably < 1 NTU for effective disinfection', '4th Ed (2022)', 'https://www.who.int'),
  ('WHO Guidelines', 'tds', 'mg/L', NULL, 600.0, 'Palatability decreases significantly above 1000 mg/L', '4th Ed (2022)', 'https://www.who.int'),
  ('WHO Guidelines', 'lead', 'mg/L', NULL, 0.01, NULL, '4th Ed (2022)', 'https://www.who.int'),
  ('WHO Guidelines', 'arsenic', 'mg/L', NULL, 0.01, 'Provisional guideline value', '4th Ed (2022)', 'https://www.who.int'),
  ('WHO Guidelines', 'nitrates', 'mg/L', NULL, 50.0, 'Expressed as nitrate (NO3)', '4th Ed (2022)', 'https://www.who.int'),
  ('WHO Guidelines', 'fluoride', 'mg/L', NULL, 1.5, NULL, '4th Ed (2022)', 'https://www.who.int'),
  ('WHO Guidelines', 'chlorine', 'mg/L', 0.2, 5.0, 'Residual free chlorine', '4th Ed (2022)', 'https://www.who.int'),
  ('WHO Guidelines', 'bacteria', 'CFU/100mL', NULL, 0.0, 'Must not be detectable in any 100 ml sample (E. coli)', '4th Ed (2022)', 'https://www.who.int'),

  -- BIS IS 10500:2012 (Bureau of Indian Standards)
  ('BIS IS 10500', 'ph', 'pH units', 6.5, 8.5, 'Permissible limit without alternate source: 6.5 - 8.5', 'IS 10500:2012', 'https://www.services.bis.gov.in'),
  ('BIS IS 10500', 'turbidity', 'NTU', NULL, 1.0, 'Permissible limit in absence of alternate source: 5 NTU', 'IS 10500:2012', 'https://www.services.bis.gov.in'),
  ('BIS IS 10500', 'tds', 'mg/L', NULL, 500.0, 'Permissible limit in absence of alternate source: 2000 mg/L', 'IS 10500:2012', 'https://www.services.bis.gov.in'),
  ('BIS IS 10500', 'lead', 'mg/L', NULL, 0.01, 'No relaxation', 'IS 10500:2012', 'https://www.services.bis.gov.in'),
  ('BIS IS 10500', 'arsenic', 'mg/L', NULL, 0.01, 'Permissible limit in absence of alternate source: 0.05 mg/L', 'IS 10500:2012', 'https://www.services.bis.gov.in'),
  ('BIS IS 10500', 'nitrates', 'mg/L', NULL, 45.0, 'No relaxation', 'IS 10500:2012', 'https://www.services.bis.gov.in'),
  ('BIS IS 10500', 'fluoride', 'mg/L', NULL, 1.0, 'Permissible limit in absence of alternate source: 1.5 mg/L', 'IS 10500:2012', 'https://www.services.bis.gov.in'),
  ('BIS IS 10500', 'chlorine', 'mg/L', 0.2, 1.0, 'Residual free chlorine minimum 0.2 mg/L', 'IS 10500:2012', 'https://www.services.bis.gov.in'),
  ('BIS IS 10500', 'bacteria', 'CFU/100mL', NULL, 0.0, 'Shall not be detectable in 100 ml sample (E. coli / Coliform)', 'IS 10500:2012', 'https://www.services.bis.gov.in')
ON CONFLICT DO NOTHING;

-- 2. SEED TREATMENT COMPATIBILITY
-- Matrix evaluating methods vs contaminants

INSERT INTO public.treatment_compatibility 
  (treatment_method, parameter_code, effectiveness_level, effectiveness_summary, limitations, validation_source)
VALUES
  -- Boiling
  ('boiling', 'bacteria', 'effective', 'Kills bacteria, viruses, and microbial protozoa when brought to a rolling boil for at least 1-3 minutes.', 'Does not remove heavy metals, chemical pollutants, or salts.', 'CDC / WHO Water Disinfection Protocols'),
  ('boiling', 'nitrates', 'ineffective', 'Boiling does NOT eliminate nitrates. In fact, prolonged boiling evaporates water and CONCENTRATES nitrate levels, worsening exposure risk.', 'Can concentrate dissolved inorganic contaminants.', 'EPA / WHO Drinking Water Advice'),
  ('boiling', 'lead', 'ineffective', 'Boiling does not remove lead or any other heavy metal. Water volume evaporation will concentrate lead.', 'Never boil water to remove heavy metals.', 'EPA Lead in Drinking Water Guide'),
  ('boiling', 'arsenic', 'ineffective', 'Boiling does not evaporate or degrade arsenic and may increase concentration.', 'Ineffective against dissolved minerals and metalloids.', 'WHO Arsenic Technical Guidelines'),
  ('boiling', 'fluoride', 'ineffective', 'Boiling does not eliminate fluoride and can concentrate fluoride ions.', 'No chemical or physical removal occurs.', 'CDC Community Fluoridation Guidelines'),
  ('boiling', 'turbidity', 'partial', 'Boiling may cause some suspended solids to coagulate, but leaves high particulate matter unless preceded by filtration.', 'Leaves suspended matter and silt.', 'WHO Household Water Treatment'),
  ('boiling', 'tds', 'ineffective', 'Boiling has no effect on total dissolved solids and will slightly elevate TDS as water evaporates.', 'Cannot remove dissolved mineral salts.', 'WHO Guidelines'),
  ('boiling', 'chlorine', 'effective', 'Boiling rapidly aerates and drives off volatile free chlorine from municipal treated water.', 'Leaves behind non-volatile chloramines partially.', 'Water Quality Association (WQA)'),

  -- Reverse Osmosis (RO)
  ('ro', 'bacteria', 'effective', 'RO semi-permeable membranes (pore size ~0.0001 microns) physically reject bacteria and viruses.', 'Requires intact membrane and pre-filters; biological fouling can degrade membrane over time.', 'NSF/ANSI Standard 58'),
  ('ro', 'lead', 'effective', 'RO membranes consistently remove 95-99% of dissolved lead ions.', 'Requires regular filter and membrane replacements.', 'EPA Drinking Water Treatability Database'),
  ('ro', 'arsenic', 'effective', 'Highly effective for Arsenic (V). Arsenic (III) must be oxidized to Arsenic (V) for maximum rejection.', 'Requires pre-oxidation if water has high Arsenic (III).', 'EPA / NSF 58'),
  ('ro', 'nitrates', 'effective', 'RO membranes reduce nitrate concentrations by 80% to 92%.', 'Rejection rate depends on membrane quality and operating water pressure.', 'Water Quality Association'),
  ('ro', 'fluoride', 'effective', 'RO achieves 85-95% reduction in fluoride levels.', 'Post-remineralization may be needed for drinking palatability if TDS drops excessively.', 'CDC / NSF International'),
  ('ro', 'tds', 'effective', 'RO is the gold standard for reducing high dissolved mineral content and salinity.', 'Wastes a proportion of reject water (brine).', 'NSF/ANSI 58'),
  ('ro', 'turbidity', 'effective', 'Pre-filtration stages and membrane block all suspended matter.', 'High turbidity source water requires frequent sediment pre-filter replacement.', 'WQA'),
  ('ro', 'chlorine', 'effective', 'Standard RO units incorporate activated carbon pre-filters to capture chlorine and protect the polyamide membrane.', 'Direct chlorine contact can damage thin-film composite membranes.', 'WQA / NSF'),

  -- Ultraviolet Purification (UV)
  ('uv', 'bacteria', 'effective', 'UV irradiation scrambles microorganism DNA, disabling bacterial and viral replication.', 'Requires minimum UV dose; ineffective if water has high turbidity or suspended particles shielding microbes.', 'NSF/ANSI Standard 55 Class A'),
  ('uv', 'lead', 'ineffective', 'UV light has zero impact on heavy metals, dissolved minerals, or physical particles.', 'Microbiological disinfection only.', 'EPA Drinking Water Disinfection Guide'),
  ('uv', 'nitrates', 'ineffective', 'UV does not filter, alter, or remove inorganic ions like nitrate.', 'No chemical removal capability.', 'NSF International'),
  ('uv', 'arsenic', 'ineffective', 'UV does not remove heavy metals or metalloids.', 'No reduction in arsenic.', 'EPA'),
  ('uv', 'fluoride', 'ineffective', 'UV light cannot remove dissolved fluoride.', 'No chemical reduction.', 'CDC'),
  ('uv', 'turbidity', 'ineffective', 'UV does not clear turbidity. High turbidity shields microbes from UV rays (turbidity must be < 1 NTU for reliable UV kill).', 'Fails when turbidity is elevated.', 'WHO Water Treatment Guide'),
  ('uv', 'tds', 'ineffective', 'UV leaves dissolved mineral counts unchanged.', 'Zero effect on dissolved solids.', 'NSF'),
  ('uv', 'chlorine', 'ineffective', 'Standard residential UV systems do not reduce free chlorine levels significantly.', 'Requires carbon filtration for chlorine.', 'WQA'),

  -- Activated Carbon Filter
  ('activated_carbon', 'chlorine', 'effective', 'Adsorption on porous carbon structure rapidly captures free chlorine and improves taste/odour.', 'Filters become saturated and require scheduled replacement.', 'NSF/ANSI Standard 42'),
  ('activated_carbon', 'bacteria', 'ineffective', 'Standard carbon blocks cannot reliably remove or kill bacteria and can become breeding grounds if not maintained.', 'Not rated for microbiologically unsafe water without added UV/RO.', 'EPA Home Water Filtration Guide'),
  ('activated_carbon', 'lead', 'partial', 'Specialized solid-block carbon filters impregnated with lead-selective media can reduce lead, but standard granular carbon has low efficiency.', 'Verify NSF 53 certification for lead specifically.', 'NSF/ANSI Standard 53'),
  ('activated_carbon', 'arsenic', 'ineffective', 'Standard activated carbon does not remove dissolved arsenic.', 'Requires specialized activated alumina or iron-oxide media.', 'EPA'),
  ('activated_carbon', 'nitrates', 'ineffective', 'Carbon media does not adsorb inorganic nitrate ions.', 'Ineffective for nitrates.', 'WQA'),
  ('activated_carbon', 'fluoride', 'ineffective', 'Standard carbon filters do not remove fluoride.', 'Requires bone char or activated alumina.', 'CDC'),
  ('activated_carbon', 'turbidity', 'partial', 'Carbon blocks can trap larger particulate sediment, though they may clog quickly.', 'High silt rapidly reduces filter lifespan.', 'NSF'),
  ('activated_carbon', 'tds', 'ineffective', 'Does not remove dissolved minerals or inorganic salts.', 'TDS level remains largely unchanged.', 'WQA'),

  -- Chlorination
  ('chlorination', 'bacteria', 'effective', 'Powerful, well-proven disinfectant that destroys pathogenic bacteria and most viruses.', 'Requires adequate contact time (typically 30 mins) and sufficient free chlorine residual.', 'WHO Disinfection Guidelines'),
  ('chlorination', 'lead', 'ineffective', 'Chlorination cannot remove dissolved heavy metals.', 'No physical or chemical extraction of lead.', 'EPA'),
  ('chlorination', 'nitrates', 'ineffective', 'Chlorination does not reduce nitrates.', 'Chemical oxidation does not degrade nitrate.', 'EPA'),
  ('chlorination', 'turbidity', 'ineffective', 'Chlorine does not filter or clarify particulate matter.', 'High turbidity interferes with chlorination efficiency.', 'WHO'),
  ('chlorination', 'fluoride', 'ineffective', 'Chlorination does not affect fluoride.', 'No impact on fluoride.', 'CDC'),

  -- No Treatment (Raw)
  ('none', 'bacteria', 'ineffective', 'No barrier against microbial contamination.', 'Full risk of waterborne pathogens.', 'WHO'),
  ('none', 'lead', 'ineffective', 'No reduction of heavy metal hazards.', 'Direct exposure to dissolved lead.', 'EPA'),
  ('none', 'nitrates', 'ineffective', 'No reduction in agricultural or wastewater nitrate contamination.', 'Risk of methemoglobinemia in infants.', 'EPA'),
  ('none', 'arsenic', 'ineffective', 'No removal of toxic metalloids.', 'Long-term chronic toxicity risk.', 'WHO'),
  ('none', 'fluoride', 'ineffective', 'No regulation of natural or industrial fluoride.', 'Risk of dental or skeletal fluorosis.', 'WHO')
ON CONFLICT DO NOTHING;

