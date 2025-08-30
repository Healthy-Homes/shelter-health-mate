// src/data/sdohChecklist.ts - Standar dized Version
import { ChecklistItem } from '../types/checklist';

export const SDOH_QUESTIONS: ChecklistItem[] = [
  // Food Security
  {
    item_id: "SDOH_1",
    category: "food_security",
    section: "Food Security",
    subcategory: "access",
    question_text: "Within the past 12 months, you worried whether your food would run out before you got money to buy more.",
    response_options: [
      { value: "often_true", label: "Often true", weight: 1 },
      { value: "sometimes_true", label: "Sometimes true", weight: 0.5 },
      { value: "never_true", label: "Never true", weight: 0 },
      { value: "not_applicable", label: "Not applicable", weight: 0 }
    ],
    risk_score_yes: 75, // Food insecurity is high risk
    risk_score_no: 0,
    priority: "high",
    explanation: "Food insecurity affects health outcomes and medication adherence",
    response_type: "multiple_choice"
  },
  {
    item_id: "SDOH_2",
    category: "food_security",
    section: "Food Security",
    subcategory: "access",
    question_text: "Within the past 12 months, the food you bought just didn't last and you didn't have money to get more.",
    response_options: [
      { value: "often_true", label: "Often true", weight: 1 },
      { value: "sometimes_true", label: "Sometimes true", weight: 0.5 },
      { value: "never_true", label: "Never true", weight: 0 },
      { value: "not_applicable", label: "Not applicable", weight: 0 }
    ],
    risk_score_yes: 80, // Severe food insecurity
    risk_score_no: 0,
    priority: "high",
    explanation: "Indicates severe food insecurity requiring immediate intervention",
    response_type: "multiple_choice"
  },
  // Housing Security
  {
    item_id: "SDOH_3",
    category: "housing",
    section: "Housing Security",
    subcategory: "stability",
    question_text: "What is your housing situation today?",
    response_options: [
      { value: "own", label: "I have housing", weight: 0 },
      { value: "temporary", label: "I have housing, but I am worried about losing it in the future", weight: 0.6 },
      { value: "transitional", label: "I do not have housing (staying with others, in a hotel, in a shelter, living outside on the street, on a beach, in a car, or in a park)", weight: 1 },
      { value: "not_applicable", label: "Not applicable", weight: 0 }
    ],
    risk_score_yes: 90, // Homelessness is critical
    risk_score_no: 0,
    priority: "critical",
    explanation: "Housing instability significantly impacts health and safety",
    response_type: "multiple_choice"
  },
  // Transportation
  {
    item_id: "SDOH_4",
    category: "transportation",
    section: "Transportation",
    subcategory: "access",
    question_text: "In the past 12 months, has lack of reliable transportation kept you from medical appointments, meetings, work, or from getting things needed for daily living?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "not_applicable", label: "Not applicable", weight: 0 }
    ],
    risk_score_yes: 60, // Transportation barriers moderate risk
    risk_score_no: 0,
    priority: "medium",
    explanation: "Transportation barriers can prevent access to healthcare and essential services",
    response_type: "binary"
  },
  // Social Integration
  {
    item_id: "SDOH_5",
    category: "social_integration",
    section: "Social Support",
    subcategory: "isolation",
    question_text: "How often do you see or talk to people that you care about and feel close to? (For example: talking to friends on the phone, visiting friends or family, going to church or club meetings)",
    response_options: [
      { value: "less_than_once_week", label: "Less than once a week", weight: 1 },
      { value: "1_2_times_week", label: "1 or 2 times a week", weight: 0.5 },
      { value: "3_5_times_week", label: "3 to 5 times a week", weight: 0.2 },
      { value: "5_or_more_times_week", label: "5 or more times a week", weight: 0 },
      { value: "not_applicable", label: "Not applicable", weight: 0 }
    ],
    risk_score_yes: 55, // Social isolation moderate-high risk
    risk_score_no: 0,
    priority: "medium",
    explanation: "Social isolation linked to depression, anxiety, and poor health outcomes",
    response_type: "multiple_choice"
  },
  // Stress
  {
    item_id: "SDOH_6",
    category: "stress",
    section: "Stress and Safety",
    subcategory: "stress_level",
    question_text: "Stress is when someone feels tense, nervous, anxious or can't sleep at night because their mind is troubled. How stressed are you?",
    response_options: [
      { value: "not_at_all", label: "Not at all", weight: 0 },
      { value: "a_little_bit", label: "A little bit", weight: 0.3 },
      { value: "somewhat", label: "Somewhat", weight: 0.6 },
      { value: "quite_a_bit", label: "Quite a bit", weight: 0.8 },
      { value: "very_much", label: "Very much", weight: 1 },
      { value: "not_applicable", label: "Not applicable", weight: 0 }
    ],
    risk_score_yes: 65, // High stress is significant risk
    risk_score_no: 0,
    priority: "medium",
    explanation: "Chronic stress contributes to multiple health conditions",
    response_type: "multiple_choice"
  },
  // Safety
  {
    item_id: "SDOH_7",
    category: "safety",
    section: "Stress and Safety",
    subcategory: "personal_safety",
    question_text: "Do you feel safe in your home?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "Not applicable", weight: 0 }
    ],
    risk_score_yes: 85, // Safety concerns are high priority
    risk_score_no: 0,
    priority: "high",
    explanation: "Personal safety concerns require immediate attention and resources",
    response_type: "binary"
  },
  // Domestic Violence
  {
    item_id: "SDOH_8",
    category: "safety",
    section: "Stress and Safety",
    subcategory: "domestic_violence",
    question_text: "Do you feel safe in your neighborhood?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "Not applicable", weight: 0 }
    ],
    risk_score_yes: 70, // Neighborhood safety concerns
    risk_score_no: 0,
    priority: "high",
    explanation: "Neighborhood safety affects mental health and ability to access services",
    response_type: "binary"
  }
];
