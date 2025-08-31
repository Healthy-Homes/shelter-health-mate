// src/data/taiwanHalstChecklist.ts - Complete with all 97 items
import { ChecklistItem } from '../types/checklist';

export const TAIWAN_HALST_QUESTIONS: ChecklistItem[] = [
  // Layout Section (10 items)
  {
    item_id: "A1a",
    section: "Layout",
    question_text: "What type of building is this residence?",
    response_type: "multiple_choice",
    response_options: [
      { value: "townhouse", label: "Townhouse" },
      { value: "detached_house", label: "Detached house" },
      { value: "apartment", label: "Apartment" },
      { value: "rooftop_addition", label: "Rooftop addition" }
    ],
    priority: "medium"
  },
  {
    item_id: "A1a_elevator",
    section: "Layout",
    question_text: "Is there an elevator?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    conditional: { question_id: "A1a", value: "apartment" },
    priority: "low"
  },
  {
    item_id: "A1b",
    section: "Layout",
    question_text: "What part of the building does the respondent occupy?",
    response_type: "multiple_choice",
    response_options: [
      { value: "entire_building", label: "Occupies the entire building" },
      { value: "entire_floor", label: "Occupies an entire floor" },
      { value: "shares_floor", label: "Shares a floor with others" }
    ],
    priority: "low"
  },
  {
    item_id: "A2a",
    section: "Layout",
    question_text: "How many floors does this building have aboveground (inclusive of rooftop additions)?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "A2b",
    section: "Layout",
    question_text: "Does this building have any basement floors (including a parking garage)?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },
  {
    item_id: "A3a",
    section: "Layout",
    question_text: "On which floor of the building is the participant's bedroom?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "A3b",
    section: "Layout",
    question_text: "Does this home have a living room?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },
  {
    item_id: "A3e",
    section: "Layout",
    question_text: "What type of doorway does the bedroom have?",
    response_type: "multiple_choice",
    response_options: [
      { value: "closable_door", label: "Closable door" },
      { value: "open_doorway", label: "Open doorway" },
      { value: "open_wall", label: "Open wall" }
    ],
    priority: "low"
  },
  {
    item_id: "A4a",
    section: "Layout",
    question_text: "Does this home have a kitchen?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "medium"
  },
  {
    item_id: "A5",
    section: "Layout",
    question_text: "Is there a bathroom inside the participant's bedroom?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },

  // Bedroom (Day 1) Section (17 items)
  {
    item_id: "B1",
    section: "Bedroom (Day 1)",
    question_text: "What is the level of mold odor in the bedroom?",
    response_type: "multiple_choice",
    response_options: [
      { value: "none", label: "None" },
      { value: "weak_or_slight", label: "Weak or slight" },
      { value: "strong", label: "Strong" }
    ],
    priority: "high"
  },
  {
    item_id: "B2",
    section: "Bedroom (Day 1)",
    question_text: "What material is the bedroom ceiling composed of?",
    response_type: "multiple_choice",
    response_options: [
      { value: "concrete", label: "Concrete" },
      { value: "wallpaper", label: "Wallpaper" },
      { value: "natural_wood", label: "Natural wood" },
      { value: "plastic_material", label: "Plastic material" },
      { value: "fiberboard", label: "Fiberboard" },
      { value: "gypsum_ceiling_tile", label: "Gypsum ceiling tile" },
      { value: "other", label: "Other" }
    ],
    other_specify: true,
    priority: "low"
  },
  {
    item_id: "B3",
    section: "Bedroom (Day 1)",
    question_text: "What material is the bedroom walls composed of?",
    response_type: "multiple_choice",
    response_options: [
      { value: "concrete", label: "Concrete" },
      { value: "wallpaper", label: "Wallpaper" },
      { value: "natural_wood", label: "Natural wood" },
      { value: "plastic_material", label: "Plastic material" },
      { value: "fiberboard", label: "Fiberboard" },
      { value: "drywall", label: "Drywall" },
      { value: "other", label: "Other" }
    ],
    other_specify: true,
    priority: "low"
  },
  {
    item_id: "B4",
    section: "Bedroom (Day 1)",
    question_text: "What material is the bedroom floor composed of?",
    response_type: "multiple_choice",
    response_options: [
      { value: "stone_or_tile", label: "Stone or tile" },
      { value: "concrete", label: "Concrete" },
      { value: "artificial_wood", label: "Artificial wood" },
      { value: "hardwood", label: "Hardwood" },
      { value: "carpet", label: "Carpet" },
      { value: "other", label: "Other" }
    ],
    other_specify: true,
    priority: "low"
  },
  {
    item_id: "B5",
    section: "Bedroom (Day 1)",
    question_text: "What is the combined area of water stains?",
    response_type: "multiple_choice",
    response_options: [
      { value: "none", label: "None" },
      { value: "less_than_a4_paper", label: "Less than A4 paper" },
      { value: "more_than_a4_paper_and_less_than_standard_door", label: "More than A4 paper and less than a standard door" },
      { value: "more_than_standard_door", label: "More than a standard door" }
    ],
    priority: "medium"
  },
  {
    item_id: "B7",
    section: "Bedroom (Day 1)",
    question_text: "What is the combined area of wall cancer (bì ái)?",
    response_type: "multiple_choice",
    response_options: [
      { value: "none", label: "None" },
      { value: "less_than_a4_paper", label: "Less than A4 paper" },
      { value: "more_than_a4_paper_and_less_than_standard_door", label: "More than A4 paper and less than a standard door" },
      { value: "more_than_standard_door", label: "More than a standard door" }
    ],
    priority: "high"
  },
  {
    item_id: "B6a",
    section: "Bedroom (Day 1)",
    question_text: "What is the combined area of visible mold?",
    response_type: "multiple_choice",
    response_options: [
      { value: "none", label: "None" },
      { value: "less_than_a4_paper", label: "Less than A4 paper" },
      { value: "more_than_a4_paper_and_less_than_standard_door", label: "More than A4 paper and less than a standard door" },
      { value: "more_than_standard_door", label: "More than a standard door" }
    ],
    priority: "critical"
  },
  {
    item_id: "B8",
    section: "Bedroom (Day 1)",
    question_text: "Are there any walls that could not be fully inspected?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },
  {
    item_id: "B9",
    section: "Bedroom (Day 1)",
    question_text: "How many potted plants are in the bedroom?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "B10a",
    section: "Bedroom (Day 1)",
    question_text: "Is the mattress placed directly on the floor?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "medium"
  },
  {
    item_id: "B10b",
    section: "Bedroom (Day 1)",
    question_text: "What is covering the mattress?",
    response_type: "multiple_choice",
    response_options: [
      { value: "nothing", label: "Nothing" },
      { value: "cotton_bedsheet", label: "Cotton bedsheet" },
      { value: "blanket", label: "Blanket" },
      { value: "other", label: "Other" }
    ],
    other_specify: true,
    priority: "low"
  },
  {
    item_id: "B10c",
    section: "Bedroom (Day 1)",
    question_text: "What is used as a blanket?",
    response_type: "multiple_choice",
    response_options: [
      { value: "nothing", label: "Nothing" },
      { value: "duvet_or_comforter", label: "Duvet or comforter" },
      { value: "blanket", label: "Blanket" },
      { value: "other", label: "Other" }
    ],
    other_specify: true,
    priority: "low"
  },
  {
    item_id: "B10d",
    section: "Bedroom (Day 1)",
    question_text: "What is covering the pillow?",
    response_type: "multiple_choice",
    response_options: [
      { value: "nothing", label: "Nothing" },
      { value: "cotton_pillow_case", label: "Cotton pillow case" },
      { value: "hand_towel", label: "Hand towel" },
      { value: "other", label: "Other" }
    ],
    other_specify: true,
    priority: "low"
  },
  {
    item_id: "E1_height",
    section: "Bedroom (Day 1)",
    question_text: "Measure the room height (meters)",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "E1_width",
    section: "Bedroom (Day 1)",
    question_text: "Measure the room width (meters)",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "E1_length",
    section: "Bedroom (Day 1)",
    question_text: "Measure the room length (meters)",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "E4a",
    section: "Bedroom (Day 1)",
    question_text: "Does this room have any interior openings?",
    response_type: "multiple_choice",
    response_options: [
      { value: "no", label: "No" },
      { value: "yes_less_than_door", label: "Yes (less than a standard door)" },
      { value: "yes_more_than_door", label: "Yes (more than a standard door)" }
    ],
    priority: "low"
  },

  // Bedroom (Day 8) Section (18 items)
  {
    item_id: "E2a",
    section: "Bedroom (Day 8)",
    question_text: "Is there a balcony door inside this room?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },
  {
    item_id: "E2c",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, when did you normally open the balcony door or balcony door window?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening_or_during_sleep", label: "Evening/during sleep" }
    ],
    conditional: { question_id: "E2a", value: "yes" },
    priority: "medium"
  },
  {
    item_id: "E3a",
    section: "Bedroom (Day 8)",
    question_text: "Does this room have any exterior windows?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "medium"
  },
  {
    item_id: "E3c",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, when did you normally open the window?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening_or_during_sleep", label: "Evening/during sleep" }
    ],
    conditional: { question_id: "E3a", value: "yes" },
    priority: "medium"
  },
  {
    item_id: "E5",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, when did you normally use the air conditioning?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening_or_during_sleep", label: "Evening/during sleep" },
      { value: "na", label: "N/A" }
    ],
    priority: "low"
  },
  {
    item_id: "E6",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, when did you normally use the dehumidifier?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening_or_during_sleep", label: "Evening/during sleep" },
      { value: "na", label: "N/A" }
    ],
    priority: "medium"
  },
  {
    item_id: "E7",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, when did you normally use an electric heater?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening_or_during_sleep", label: "Evening/during sleep" },
      { value: "na", label: "N/A" }
    ],
    priority: "low"
  },
  {
    item_id: "E8",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, when did you normally use an air purifier?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening_or_during_sleep", label: "Evening/during sleep" },
      { value: "na", label: "N/A" }
    ],
    priority: "low"
  },
  {
    item_id: "E9a",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, when did you normally use an electric fan?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening_or_during_sleep", label: "Evening/during sleep" },
      { value: "na", label: "N/A" }
    ],
    priority: "low"
  },
  {
    item_id: "E9b",
    section: "Bedroom (Day 8)",
    question_text: "What type of fan was used?",
    response_type: "multiple_choice",
    response_options: [
      { value: "standing_fan", label: "Standing fan" },
      { value: "floor_circulating_fan_box_fan", label: "Floor circulating fan/box fan" },
      { value: "ceiling_fan", label: "Ceiling fan" },
      { value: "wall_fan", label: "Wall fan" },
      { value: "other", label: "Other" }
    ],
    conditional: { question_id: "E9a", value_not: ["never", "na"] },
    other_specify: true,
    priority: "low"
  },
  {
    item_id: "E10",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, how many people regularly slept in this room?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "E12",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, how did you clean your bedroom floor?",
    response_type: "multiple_choice",
    response_options: [
      { value: "did_not_clean", label: "Did not clean" },
      { value: "vacuum", label: "Vacuum" },
      { value: "broom", label: "Broom" },
      { value: "dry_mop", label: "Dry mop (swiffer)" },
      { value: "wet_mop", label: "Wet mop" },
      { value: "robot_vacuum", label: "Robot vacuum" },
      { value: "other", label: "Other" }
    ],
    other_specify: true,
    priority: "low"
  },
  {
    item_id: "E13",
    section: "Bedroom (Day 8)",
    question_text: "In which of the past three months did you wash your bedding?",
    response_type: "multiple_choice",
    response_options: [
      { value: "last_month", label: "Last month" },
      { value: "two_months_ago", label: "Two months ago" },
      { value: "three_months_ago", label: "Three months ago" },
      { value: "not_washed_in_past_three_months", label: "Not washed in the past three months" }
    ],
    priority: "medium"
  },
  {
    item_id: "E14a",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, did you cook food or boil water in the bedroom?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "high"
  },
  {
    item_id: "I2e",
    section: "Bedroom (Day 8)",
    question_text: "Is it easy to turn the lights on and off from the bed?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },
  {
    item_id: "I5a",
    section: "Bedroom (Day 8)",
    question_text: "Is it easy for you to get in and out of bed?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "medium"
  },
  {
    item_id: "I5b",
    section: "Bedroom (Day 8)",
    question_text: "Is there a bedside rail or place for a walker or cane for easy access when getting out of bed?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (does not use a cane or walker)" }
    ],
    priority: "medium"
  },
  {
    item_id: "E15a",
    section: "Bedroom (Day 8)",
    question_text: "In the past week, were there any sources of indoor pollution in your bedroom?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "medium"
  },

  // General Section (30 items)
  {
    item_id: "D1",
    section: "General",
    question_text: "How old is this building?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "D2",
    section: "General",
    question_text: "How many people reside in this home?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "D3",
    section: "General",
    question_text: "Do you have any indoor pets? (excluding fish)",
    response_type: "multiple_choice",
    response_options: [
      { value: "none", label: "None" },
      { value: "dog", label: "Dog" },
      { value: "cat", label: "Cat" },
      { value: "other", label: "Other" }
    ],
    other_specify: true,
    priority: "low"
  },
  {
    item_id: "D4a",
    section: "General",
    question_text: "In the past week, did you burn incense indoors?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "medium"
  },
  {
    item_id: "D5a",
    section: "General",
    question_text: "In the past week, were there any sources of smoke indoors apart from incense burning and cooking?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "high"
  },
  {
    item_id: "D5b_count",
    section: "General",
    question_text: "How many times was this source of smoke burned?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    conditional: { question_id: "D5a", value: "yes" },
    priority: "medium"
  },
  {
    item_id: "D5c_floors",
    section: "General",
    question_text: "On which floor was this source of smoke burned?",
    response_type: "multi_select",
    response_options: [
      { value: "groundfloor", label: "Ground floor" },
      { value: "1st3rdfloor", label: "1st-3rd floor" },
      { value: "4th6thfloor", label: "4th-6th floor" },
      { value: "7thfloorabove", label: "7th floor and above" }
    ],
    conditional: { question_id: "D5a", value: "yes" },
    priority: "medium"
  },
  {
    item_id: "D6a",
    section: "General",
    question_text: "Does this home have an indoor gas water heater?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "high"
  },
  {
    item_id: "D6b",
    section: "General",
    question_text: "Which floor is the indoor gas water heater located?",
    response_type: "multiple_choice",
    response_options: [
      { value: "groundfloor", label: "Ground floor" },
      { value: "1st3rdfloor", label: "1st-3rd floor" },
      { value: "4th6thfloor", label: "4th-6th floor" },
      { value: "7thfloorabove", label: "7th floor and above" }
    ],
    conditional: { question_id: "D6a", value: "yes" },
    priority: "high"
  },
  {
    item_id: "D6c",
    section: "General",
    question_text: "Does this gas water heater have a vent to the outdoors?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    conditional: { question_id: "D6a", value: "yes" },
    priority: "critical"
  },
  {
    item_id: "D7",
    section: "General",
    question_text: "Does this home have a functional smoke detector?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" }
    ],
    priority: "high"
  },
  {
    item_id: "D8",
    section: "General",
    question_text: "Does this home have a functional carbon monoxide detector?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" }
    ],
    priority: "critical"
  },
  {
    item_id: "I1a",
    section: "General",
    question_text: "Are rugs and floor mats without rolled-up edges?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (no floor mats)" }
    ],
    priority: "medium"
  },
  {
    item_id: "I1b",
    section: "General",
    question_text: "Are non-slip mats placed under floor mats?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (no floor mats)" }
    ],
    priority: "medium"
  },
  {
    item_id: "I1c",
    section: "General",
    question_text: "Are all cords and furniture clear of walkways and neatly stowed away to avoid tripping?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "high"
  },
  {
    item_id: "I2a",
    section: "General",
    question_text: "Are the indoor lights bright?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "medium"
  },
  {
    item_id: "I2d",
    section: "General",
    question_text: "Are the light switches near doors and easy to reach?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (no stairs)" }
    ],
    priority: "low"
  },
  {
    item_id: "I2b",
    section: "General",
    question_text: "Are the stairs adequately lit?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (no stairs)" }
    ],
    priority: "high"
  },
  {
    item_id: "I3a",
    section: "General",
    question_text: "Is there a light switch on the upper and lower floors of the stairs?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (no stairs)" }
    ],
    priority: "medium"
  },
  {
    item_id: "I3b",
    section: "General",
    question_text: "Are there luminous anti-slip strips on the front edges of stairs?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (no stairs)" }
    ],
    priority: "medium"
  },
  {
    item_id: "I3c",
    section: "General",
    question_text: "Are there sturdy handrails alongside the stairs?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (no stairs)" }
    ],
    priority: "high"
  },
  {
    item_id: "I6a",
    section: "General",
    question_text: "Are the floors cleared of clutter?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "high"
  },
  {
    item_id: "I6c",
    section: "General",
    question_text: "Do you wipe up spilled water immediately?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "high"
  },
  {
    item_id: "I6d",
    section: "General",
    question_text: "Is the phone easily accessible?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },
  {
    item_id: "I6e",
    section: "General",
    question_text: "Do you wear shoes with non-slip soles?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "medium"
  },
  {
    item_id: "I6f",
    section: "General",
    question_text: "Are loose-fitting clothes or long pants easy to trip over? Please check that your clothes fit properly",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (clothes fit well)" }
    ],
    priority: "low"
  },
  {
    item_id: "I7a",
    section: "General",
    question_text: "Can you easily maintain your balance when walking with a cane or walker?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (does not use a cane or walker)" }
    ],
    priority: "medium"
  },
  {
    item_id: "I7b",
    section: "General",
    question_text: "Does your cane or walker make you feel comfortable?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (does not use a cane or walker)" }
    ],
    priority: "low"
  },
  {
    item_id: "I7c",
    section: "General",
    question_text: "Can you use your cane and walker in your home without obstruction from furniture?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (does not use a cane or walker)" }
    ],
    priority: "medium"
  },

  // Kitchen Section (13 items)
  {
    item_id: "G1a",
    section: "Kitchen",
    question_text: "In the past week, how many times did anyone in the household use a gas stove?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "medium"
  },
  {
    item_id: "G1b",
    section: "Kitchen",
    question_text: "In the past week, how many times did anyone in the household use an electric/induction cooker?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "G1c",
    section: "Kitchen",
    question_text: "In the past week, how many times did anyone in the household use a rice cooker?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "G1d",
    section: "Kitchen",
    question_text: "In the past week, how many times did anyone in the household use an air fryer?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "G1e",
    section: "Kitchen",
    question_text: "In the past week, how many times did anyone in the household use a microwave?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "G1f",
    section: "Kitchen",
    question_text: "In the past week, how many times did anyone in the household use an oven?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "G1g",
    section: "Kitchen",
    question_text: "In the past week, did anyone in the household use any other cooking appliances?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },
  {
    item_id: "G2",
    section: "Kitchen",
    question_text: "In the past week, how many times did anyone cook with frying, stir-frying, or deep-frying?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "medium"
  },
  {
    item_id: "G3",
    section: "Kitchen",
    question_text: "In the past week, how often was the range hood used when cooking with the gas stove?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "sometimes", label: "Sometimes" },
      { value: "every_time", label: "Every time" },
      { value: "na", label: "N/A (no range hood)" }
    ],
    priority: "high"
  },
  {
    item_id: "G4",
    section: "Kitchen",
    question_text: "In the past week, when did you normally open exterior windows or doors?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "during_after_cooking", label: "During/after cooking" },
      { value: "always", label: "Always" },
      { value: "na", label: "N/A (no exterior openings)" }
    ],
    priority: "medium"
  },
  {
    item_id: "G5a",
    section: "Kitchen",
    question_text: "In the past week, how many times did you use a commercial cleaner to clean the kitchen?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "G5c",
    section: "Kitchen",
    question_text: "In the past week, have you used anything else to clean the kitchen?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },
  {
    item_id: "I2c",
    section: "Kitchen",
    question_text: "Are the kitchen and kitchen countertops well-lit?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "na", label: "N/A (no kitchen)" }
    ],
    priority: "medium"
  },

  // Bathroom Section (6 items)
  {
    item_id: "H1",
    section: "Bathroom",
    question_text: "What is the combined area of visible mold?",
    response_type: "multiple_choice",
    response_options: [
      { value: "none", label: "None" },
      { value: "less_than_a4_paper", label: "Less than A4 paper" },
      { value: "more_than_a4_paper_and_less_than_standard_door", label: "More than A4 paper and less than a standard door" },
      { value: "more_than_standard_door", label: "More than a standard door" }
    ],
    priority: "critical"
  },
  {
    item_id: "H2",
    section: "Bathroom",
    question_text: "In the past week, when did you normally open the bathroom window?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "during_after_bathing", label: "During/after bathing" },
      { value: "always", label: "Always" },
      { value: "na", label: "N/A (no window)" }
    ],
    priority: "medium"
  },
  {
    item_id: "H3",
    section: "Bathroom",
    question_text: "In the past week, when not in use, when was the bathroom door open?",
    response_type: "multiple_choice",
    response_options: [
      { value: "never", label: "Never" },
      { value: "sometimes", label: "Sometimes" },
      { value: "always", label: "Always (including no door)" }
    ],
    priority: "low"
  },
  {
    item_id: "H4",
    section: "Bathroom",
    question_text: "Is there a bath tub?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },
  {
    item_id: "H5a",
    section: "Bathroom",
    question_text: "In the past week, how many times did you use a commercial cleaner to clean the bathroom?",
    response_type: "numeric",
    response_options: "",
    min: 0,
    priority: "low"
  },
  {
    item_id: "H5c",
    section: "Bathroom",
    question_text: "In the past week, have you used anything else to clean the bathroom?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "low"
  },

  // Safe Section (3 items)
  {
    item_id: "I4a",
    section: "Safe",
    question_text: "Does the bathroom floor have anti-slip protection?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "high"
  },
  {
    item_id: "I4b",
    section: "Safe",
    question_text: "Are there grab bars installed next to the shower or toilet?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "high"
  },
  {
    item_id: "I6b",
    section: "Safe",
    question_text: "Are bathing supplies and towels within reach without having to bend down?",
    response_type: "multiple_choice",
    response_options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
    priority: "medium"
  }
];
