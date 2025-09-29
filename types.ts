export enum HealthDomain {
  BREAST_HEALTH = 'Breast Health',
  REPRODUCTIVE_HEALTH = 'Reproductive Health',
  PREGNANCY = 'Pregnancy & Maternal Care',
  BONE_HEALTH = 'Bone & Joint Health',
  CARDIOVASCULAR = 'Cardiovascular Health',
  SKIN_HEALTH = 'Skin & Hair Health',
  NUTRITION = 'Nutrition & Lifestyle',
  MENTAL_HEALTH = 'Mental Health',
  CERVICAL_HEALTH = 'Cervical & Ovarian Health',
  PREVENTIVE_HEALTH = 'General Preventive Health',
  DENTAL_ORTHODONTICS = 'Dental & Orthodontics',
  BREAST_CANCER_ANALYSIS = 'Breast Cancer Analysis',
}

export enum ScanType {
  MAMMOGRAM = 'Mammogram',
  ULTRASOUND = 'Ultrasound',
  MRI = 'MRI',
  PAP_SMEAR = 'Pap Smear',
  DEXA_SCAN = 'DEXA Scan',
  ECG = 'ECG',
  SKIN_PHOTO = 'Skin Photo',
  MEAL_PHOTO = 'Meal Photo',
  CEPHALOMETRIC_XRAY = 'Cephalometric X-ray',
  BREAST_IMAGE = 'Breast Image',
}

export enum Recommendation {
  BIOPSY = 'Biopsy',
  MRI = 'MRI',
  SHORT_FOLLOW_UP = 'Short-term Follow-up',
  ROUTINE = 'Routine Screening',
  CLINICAL_CORRELATION = 'Clinical Correlation',
  NO_ACTION = 'No Action Required',
  REFERRAL = 'Referral to Specialist',
}

export interface BoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface Finding {
  id: string;
  label: string;
  description: string;
  bounding_box: BoundingBox;
  confidence: number;
}

// A more generic analysis result that can hold different kinds of data
export interface AnalysisResult {
  risk_score: number; // Universal 0-100 score
  recommendation: Recommendation;
  clinical_summary: string;
  patient_summary: string;
  findings: Finding[];
  heatmap_base64?: string;
  // Domain-specific fields
  bi_rads?: number; // For Breast Health
  // other domain specific fields can be added here
}

export enum CaseStatus {
  PENDING_ANALYSIS = 'PENDING_ANALYSIS',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  REVIEW_PENDING = 'REVIEW_PENDING',
  REVIEW_COMPLETED = 'REVIEW_COMPLETED',
}

export enum CasePriority {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

export interface Case {
  id: string; // UUID
  patientId: string;
  createdAt: Date;
  status: CaseStatus;
  priority: CasePriority;
  healthDomain: HealthDomain;
  scanType: ScanType;
  image: {
    dataUrl: string;
    name: string;
    type: string;
  };
  analysisResult?: AnalysisResult;
  clinicianNote?: string;
  clinicianDecision?: 'Accepted' | 'Overridden' | 'Deferred';
  overrideReason?: string;
  // Generated reports
  clinicalReport?: string;
  patientReport?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    imageUrl?: string;
}

export type AppMode = 'landing' | 'doctor' | 'patient' | 'selection';

// --- Cephalometric Analysis Types ---

export type CephalometricPoint = { x: number; y: number };

export interface CephalometricLandmark {
  name: string;
  point: CephalometricPoint;
}

export interface CephalometricMeasurement {
  name: string;
  value: number;
  unit: 'mm' | 'degrees';
  normalRange?: string;
  interpretation?: 'Normal' | 'Protrusive' | 'Retrusive' | 'High Angle' | 'Low Angle' | 'Skeletal Class II' | 'Skeletal Class III';
}

export interface CephalometricAnalysis {
  [analysisName: string]: CephalometricMeasurement[];
}

// --- Breast Cancer Analysis Types ---
export interface BreastFinding {
  id: string;
  label: 'Mass' | 'Calcification' | 'Asymmetry' | 'Architectural Distortion';
  description: string;
  bounding_box: BoundingBox;
  malignancy_probability: number; // 0 to 1
}

export interface BreastAnalysisResult {
  bi_rads_score: number; // 0-6
  findings: BreastFinding[];
  clinical_summary: string;
}

// --- NEW PATIENT MODE TYPES ---
export interface MenstrualData {
  cycleDay: number;
  symptoms: string;
}

export interface PregnancyData {
  dueDate: string; // ISO string
}

export interface WellnessData {
  mood: number; // 1-5
  sleep: number; // hours
  hydration: number; // glasses
}

export interface SymptomCheckerResult {
  possible_conditions: { name: string; likelihood: 'High' | 'Medium' | 'Low' }[];
  suggested_next_steps: string[];
  disclaimer: string;
}

export interface ConditionData {
    painLevel: number; // 1-10
    symptoms: string;
}

export interface MenstrualInsights {
    cycle_phase: string;
    fertile_window_prediction: string;
    symptom_explanations: string[];
    wellness_tips: string[];
}

export interface PregnancyUpdate {
    week: number;
    fetal_development_summary: string;
    common_symptoms: string[];
    health_recommendations: string[];
    imageUrl: string;
}

export interface JournalAnalysis {
  summary: string;
  sentiment: string;
  suggestions: string[];
}

export interface MedicationInfo {
  medication_name: string;
  purpose: string;
  dosage_instructions: string;
  common_side_effects: string[];
  important_notes: string[];
}

export interface AnatomicalAnnotation {
  label: string;
  description: string;
  bounding_box: BoundingBox;
}

export interface EditedImageResponse {
    imageDataUrl: string;
    text: string;
}