
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { 
    AnalysisResult, Case, CasePriority, Recommendation, HealthDomain, Finding, ChatMessage, 
    CephalometricLandmark, BreastAnalysisResult, MenstrualData, PregnancyData, WellnessData, 
    SymptomCheckerResult, ConditionData, JournalAnalysis, MenstrualInsights, PregnancyUpdate,
    MedicationInfo, AnatomicalAnnotation, EditedImageResponse
} from '../types';
import { BI_RADS_CATEGORIES } from "../constants";

// --- DYNAMIC AI INITIALIZATION ---
let ai: GoogleGenAI | undefined;

export const initializeAi = () => {
    const userKey = localStorage.getItem('gemini_api_key');
    // @ts-ignore
    const envKey = process.env.API_KEY;
    const apiKey = userKey || envKey;

    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    } else {
        ai = undefined;
    }
};

initializeAi(); // Initial call

const useMock = (): boolean => !ai;
// --- END DYNAMIC AI INITIALIZATION ---


const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        risk_score: { type: Type.NUMBER, description: "Overall risk score from 0 to 100." },
        recommendation: { type: Type.STRING, enum: Object.values(Recommendation) },
        clinical_summary: { type: Type.STRING, description: "Detailed summary for a clinician." },
        patient_summary: { type: Type.STRING, description: "Simplified summary for a patient." },
        findings: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    description: { type: Type.STRING },
                    bounding_box: { 
                        type: Type.OBJECT, 
                        properties: { x_min: {type: Type.NUMBER}, y_min: {type: Type.NUMBER}, x_max: {type: Type.NUMBER}, y_max: {type: Type.NUMBER} },
                        required: ["x_min", "y_min", "x_max", "y_max"]
                    },
                    confidence: { type: Type.NUMBER },
                },
                required: ["id", "label", "description", "bounding_box", "confidence"]
            }
        },
        bi_rads: { type: Type.INTEGER, description: "BI-RADS score (0-6) for breast scans only." },
    },
    required: ["risk_score", "recommendation", "clinical_summary", "patient_summary", "findings"]
};

// --- Analysis Dispatcher ---
export const analyzeScan = async (caseData: Case): Promise<AnalysisResult> => {
    switch (caseData.healthDomain) {
        case HealthDomain.BREAST_HEALTH:
             return analyzeBreastScan(caseData);
        case HealthDomain.BREAST_CANCER_ANALYSIS:
            // This is a simplified bridge. The new tool uses a different flow.
            // We'll generate a basic AnalysisResult from the more detailed BreastAnalysisResult.
            const breastResult = await analyzeBreastImage(caseData.image.dataUrl, caseData.image.type);
            return {
                risk_score: breastResult.findings.reduce((acc, f) => Math.max(acc, f.malignancy_probability * 100), 0),
                recommendation: breastResult.bi_rads_score >= 4 ? Recommendation.BIOPSY : Recommendation.ROUTINE,
                clinical_summary: breastResult.clinical_summary,
                patient_summary: `The analysis identified ${breastResult.findings.length} area(s) of interest. The overall assessment category is BI-RADS ${breastResult.bi_rads_score}. Please discuss the detailed findings with your doctor.`,
                findings: breastResult.findings.map(f => ({
                    id: f.id,
                    label: f.label,
                    description: f.description,
                    bounding_box: f.bounding_box,
                    confidence: f.malignancy_probability
                })),
                bi_rads: breastResult.bi_rads_score
            };
        case HealthDomain.SKIN_HEALTH:
            return analyzeSkinPhoto(caseData);
        default:
            console.warn(`Analysis for domain ${caseData.healthDomain} is not implemented. Using mock data.`);
            return generateMockAnalysis(caseData);
    }
};

const analyzeBreastScan = async (caseData: Case): Promise<AnalysisResult> => {
    if (useMock()) return generateMockAnalysis(caseData);

    const base64Image = caseData.image.dataUrl.split(',')[1];
    const imagePart = { inlineData: { mimeType: caseData.image.type, data: base64Image } };
    const prompt = `You are a world-class AI radiology assistant specializing in breast imaging. Analyze the provided ${caseData.scanType}, identify findings, provide a BI-RADS score, a risk score (0-100), summaries, and a recommendation.`;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: analysisSchema },
    });
    return JSON.parse(response.text) as AnalysisResult;
};

const analyzeSkinPhoto = async (caseData: Case): Promise<AnalysisResult> => {
    if (useMock()) return generateMockAnalysis(caseData);
    
    const base64Image = caseData.image.dataUrl.split(',')[1];
    const imagePart = { inlineData: { mimeType: caseData.image.type, data: base64Image } };
    const prompt = `You are an expert AI dermatology assistant. Analyze the provided skin photo. Identify any lesions, assess their characteristics (asymmetry, border, color, diameter, evolution), provide a risk score (0-100) for malignancy, a clear recommendation (e.g., 'Routine Monitoring', 'Referral to Specialist'), and summaries for clinicians and patients. The patient summary should be reassuring but clear.`;
    
    const modifiedSchema = {...analysisSchema.properties};
    delete (modifiedSchema as any).bi_rads; // BI-RADS is not applicable to skin

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { 
            responseMimeType: "application/json", 
            responseSchema: { type: Type.OBJECT, properties: modifiedSchema, required: ["risk_score", "recommendation", "clinical_summary", "patient_summary", "findings"] }
        },
    });
    return JSON.parse(response.text) as AnalysisResult;
};

// --- NEW BREAST CANCER ANALYSIS TOOLS ---

export const analyzeBreastImage = async (imageDataUrl: string, mimeType: string): Promise<BreastAnalysisResult> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 2000));
        return {
            bi_rads_score: 4,
            findings: [
                { id: 'm1', label: 'Mass', description: 'Irregular, spiculated mass in the upper outer quadrant.', bounding_box: { x_min: 0.25, y_min: 0.3, x_max: 0.45, y_max: 0.5 }, malignancy_probability: 0.85 },
                { id: 'c1', label: 'Calcification', description: 'Pleomorphic microcalcifications cluster.', bounding_box: { x_min: 0.6, y_min: 0.65, x_max: 0.7, y_max: 0.75 }, malignancy_probability: 0.60 }
            ],
            clinical_summary: "Suspicious findings noted. An irregular mass and a cluster of pleomorphic microcalcifications are identified, warranting further investigation."
        };
    }

    const base64Image = imageDataUrl.split(',')[1];
    const imagePart = { inlineData: { mimeType, data: base64Image } };
    const prompt = "You are an AI radiology assistant. Analyze this breast imaging scan (mammogram, ultrasound, or MRI). Identify all suspicious regions such as masses, calcifications, asymmetries, or architectural distortions. For each finding, provide a label, a short description, a bounding box, and a malignancy probability score (0.0 to 1.0). Finally, provide an overall BI-RADS assessment score and a clinical summary of your findings.";
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            bi_rads_score: { type: Type.INTEGER },
            findings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING, enum: ['Mass', 'Calcification', 'Asymmetry', 'Architectural Distortion'] },
                        description: { type: Type.STRING },
                        bounding_box: { 
                            type: Type.OBJECT, 
                            properties: { x_min: { type: Type.NUMBER }, y_min: { type: Type.NUMBER }, x_max: { type: Type.NUMBER }, y_max: { type: Type.NUMBER } },
                            required: ["x_min", "y_min", "x_max", "y_max"]
                        },
                        malignancy_probability: { type: Type.NUMBER }
                    },
                    required: ["id", "label", "description", "bounding_box", "malignancy_probability"]
                }
            },
            clinical_summary: { type: Type.STRING }
        },
        required: ["bi_rads_score", "findings", "clinical_summary"]
    };

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text) as BreastAnalysisResult;
};

export const generateBreastReport = async (analysis: BreastAnalysisResult, patientId: string): Promise<string> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1000));
        return `**PATIENT ID:** ${patientId}\n**EXAMINATION:** Bilateral Mammogram\n\n**FINDINGS:**\n${analysis.clinical_summary}\n\n**IMPRESSION:**\n${analysis.findings.length > 0 ? analysis.findings.map(f => `- ${f.label}: ${f.description}`).join('\n') : 'No significant findings.'}\n\n**BI-RADS CATEGORY:** ${analysis.bi_rads_score} - ${BI_RADS_CATEGORIES[analysis.bi_rads_score].name}\n\n**RECOMMENDATION:**\n${analysis.bi_rads_score >= 4 ? 'Biopsy is recommended.' : 'Follow-up as per standard protocol.'}`;
    }

    const prompt = `Generate a structured radiological report based on the following AI analysis for patient ID ${patientId}. The report should include Findings, Impression, BI-RADS Category, and Recommendation sections. \n\nAI Analysis:\n${JSON.stringify(analysis, null, 2)}`;
    const response = await ai!.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};


// --- Advanced Clinical AI Tools ---

export const detectCephalometricLandmarks = async (imageDataUrl: string, mimeType: string, landmarkNames: string[]): Promise<CephalometricLandmark[]> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1500));
        return landmarkNames.map(name => ({
            name,
            point: {
                x: 0.5 + (Math.random() - 0.5) * 0.4,
                y: 0.5 + (Math.random() - 0.5) * 0.4,
            }
        }));
    }

    const base64Image = imageDataUrl.split(',')[1];
    const imagePart = { inlineData: { mimeType, data: base64Image } };
    const prompt = `You are a specialist in orthodontic imaging. Analyze this cephalometric X-ray and identify the precise coordinates for the following landmarks: ${landmarkNames.join(', ')}. The image dimensions are normalized from 0 to 1. Provide the coordinates for each landmark.`;

    const landmarkSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            point: {
                type: Type.OBJECT,
                properties: {
                    x: { type: Type.NUMBER, description: "X-coordinate, normalized between 0 and 1." },
                    y: { type: Type.NUMBER, description: "Y-coordinate, normalized between 0 and 1." },
                },
                required: ["x", "y"]
            }
        },
        required: ["name", "point"]
    };

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: landmarkSchema,
            },
        },
    });

    return JSON.parse(response.text) as CephalometricLandmark[];
};


export const generateDifferentialDiagnosis = async (analysis: AnalysisResult): Promise<string[]> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 800));
        return ["Fibroadenoma", "Ductal Carcinoma In Situ (DCIS)", "Invasive Ductal Carcinoma", "Cyst"];
    }
    const prompt = `Based on the following clinical summary, list the most likely differential diagnoses:\n\n${analysis.clinical_summary}`;
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a medical expert providing differential diagnoses based on clinical summaries. Provide a list of potential diagnoses as a JSON array of strings.",
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
    return JSON.parse(response.text) as string[];
};

export const generateLongitudinalSummary = async (currentCase: Case, previousCase: Case): Promise<string> => {
     if (useMock()) {
        await new Promise(res => setTimeout(res, 1200));
        return "Mock Summary: The suspicious mass has increased in size from 12mm to 15mm over the 6-month period. Margins appear more spiculated. No new masses are identified.";
    }

    const currentImage = { inlineData: { mimeType: currentCase.image.type, data: currentCase.image.dataUrl.split(',')[1] } };
    const previousImage = { inlineData: { mimeType: previousCase.image.type, data: previousCase.image.dataUrl.split(',')[1] } };

    const prompt = `Compare the two provided medical scans. The first is the most recent, and the second is the prior scan from ${previousCase.createdAt.toLocaleDateString()}. Summarize any changes in findings, such as size, shape, or characteristics of masses or lesions.
    - Recent Summary: ${currentCase.analysisResult?.clinical_summary}
    - Prior Summary: ${previousCase.analysisResult?.clinical_summary}`;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [ {text: "This is the recent scan:"}, currentImage, {text: "This is the prior scan:"}, previousImage, { text: prompt } ] },
    });
    return response.text;
};

export const draftClinicalNote = async (caseData: Case): Promise<string> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 900));
        return `**Patient:** ${caseData.patientId}\n**Date:** ${new Date().toLocaleDateString()}\n**Indication:** Screening ${caseData.scanType}\n\n**Findings:**\n${caseData.analysisResult?.clinical_summary}\n\n**Assessment:** BI-RADS ${caseData.analysisResult?.bi_rads || 'N/A'}. ${caseData.priority} risk.\n\n**Recommendation:** ${caseData.analysisResult?.recommendation}.`;
    }
    const prompt = `Generate a structured clinical note (SOAP format if possible) for Patient ID ${caseData.patientId} based on the following AI analysis of their ${caseData.scanType}:\n\n${JSON.stringify(caseData.analysisResult, null, 2)}`;
    const response = await ai!.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const getSecondOpinion = async (caseData: Case, firstOpinion: AnalysisResult): Promise<string> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1500));
        return "Concur with initial findings. The irregular mass is highly suspicious (BI-RADS 4). Recommend biopsy as per initial AI analysis. No additional findings noted.";
    }

    const base64Image = caseData.image.dataUrl.split(',')[1];
    const imagePart = { inlineData: { mimeType: caseData.image.type, data: base64Image } };
    
    const prompt = `You are a senior specialist providing a second opinion on a medical scan. Review the provided image and the initial AI's analysis. State whether you concur or dissent, and provide your reasoning. Be concise and professional.
    
    **Initial AI Analysis:**
    ${JSON.stringify(firstOpinion, null, 2)}
    `;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            systemInstruction: "Provide a professional second opinion on a medical imaging case.",
        }
    });
    return response.text;
};

// FIX: Implement and export generateReports function.
export const generateClinicalReport = async (analysis: AnalysisResult): Promise<string> => {
    const prompt = `Generate a structured clinical report for a medical professional based on the following AI analysis:\n\n${JSON.stringify(analysis, null, 2)}`;
    const response = await ai!.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generatePatientReport = async (analysis: AnalysisResult): Promise<string> => {
    const prompt = `Generate a simplified patient-friendly report based on the following AI analysis. Use simple language, avoid jargon, and be reassuring but clear. Explain the findings and recommendation. \n\nAI Analysis:\n${JSON.stringify(analysis, null, 2)}`;
    const response = await ai!.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateReports = async (analysis: AnalysisResult): Promise<{clinicalReport: string, patientReport: string}> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1000));
        return {
            clinicalReport: `**Mock Clinical Report**\n${analysis.clinical_summary}`,
            patientReport: `**Mock Patient Summary**\n${analysis.patient_summary}`
        };
    }
    const [clinicalReport, patientReport] = await Promise.all([
        generateClinicalReport(analysis),
        generatePatientReport(analysis)
    ]);
    return { clinicalReport, patientReport };
}

// --- Multi-Modal AI Tools ---

export const editImageWithText = async (
    baseImageDataUrl: string,
    mimeType: string,
    prompt: string
): Promise<EditedImageResponse> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 2000));
        return {
            imageDataUrl: baseImageDataUrl, // In mock, just return original
            text: `This is a mock response to your request: "${prompt}". I have highlighted the requested area.`,
        };
    }

    const base64ImageData = baseImageDataUrl.split(',')[1];

    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let newImageDataUrl = '';
    let responseText = '';
    const parts = response.candidates?.[0]?.content?.parts;

    if (parts) {
        for (const part of parts) {
          if (part.text) {
            responseText = part.text;
          } else if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const newMimeType = part.inlineData.mimeType || 'image/png';
            newImageDataUrl = `data:${newMimeType};base64,${base64ImageBytes}`;
          }
        }
    }
    
    if (!newImageDataUrl) {
        // If the AI doesn't return an image, it may have returned a text-only explanation.
        // Instead of throwing an error, we can return the original image and the text response.
        const fallbackText = response.text || "The model could not edit the image and did not provide an explanation.";
        return { imageDataUrl: baseImageDataUrl, text: responseText || fallbackText };
    }

    return { imageDataUrl: newImageDataUrl, text: responseText };
};


// --- Patient-Facing AI Tools ---

export const analyzePrescription = async (inputText: string | null, imageFile?: { dataUrl: string, mimeType: string }): Promise<MedicationInfo> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1500));
        return {
            medication_name: "Lisinopril 10mg",
            purpose: "Used to treat high blood pressure (hypertension).",
            dosage_instructions: "Take one tablet by mouth once daily.",
            common_side_effects: ["Dizziness", "Cough", "Headache"],
            important_notes: ["Monitor blood pressure regularly.", "Stay hydrated.", "Rise slowly from a sitting position to avoid dizziness."]
        };
    }

    const prompt = `You are a patient-friendly AI pharmacy assistant. Analyze the following prescription information and explain it in simple terms. Provide the medication name, its primary purpose, clear dosage instructions, a list of common side effects, and any important notes for the patient. THIS IS NOT MEDICAL ADVICE.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            medication_name: { type: Type.STRING, description: "The name and strength of the medication (e.g., 'Lisinopril 10mg')." },
            purpose: { type: Type.STRING, description: "The primary reason the medication is prescribed." },
            dosage_instructions: { type: Type.STRING, description: "Simple, clear instructions on how to take the medication." },
            common_side_effects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-4 common side effects." },
            important_notes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 important, non-urgent notes for the patient." },
        },
        required: ["medication_name", "purpose", "dosage_instructions", "common_side_effects", "important_notes"],
    };
    
    let contents;
    if (imageFile) {
        const base64Image = imageFile.dataUrl.split(',')[1];
        const imagePart = { inlineData: { mimeType: imageFile.mimeType, data: base64Image } };
        contents = { parts: [imagePart, { text: prompt }] };
    } else {
        contents = `${prompt}\n\nPrescription Text: "${inputText}"`;
    }

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: { responseMimeType: "application/json", responseSchema: schema },
    });

    return JSON.parse(response.text) as MedicationInfo;
};

export const annotateScanAnatomy = async (imageDataUrl: string, mimeType: string): Promise<AnatomicalAnnotation[]> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 2000));
        return [
            { label: 'Rib Cage', description: 'The bony framework that protects the heart and lungs.', bounding_box: { x_min: 0.2, y_min: 0.3, x_max: 0.8, y_max: 0.7 } },
            { label: 'Clavicle (Collarbone)', description: 'The bone that connects the shoulder blade to the breastbone.', bounding_box: { x_min: 0.25, y_min: 0.15, x_max: 0.75, y_max: 0.25 } }
        ];
    }
    const base64Image = imageDataUrl.split(',')[1];
    const imagePart = { inlineData: { mimeType, data: base64Image } };
    const prompt = `You are an AI anatomy educator. Analyze this medical scan (like an X-ray) and identify the major, clearly visible anatomical structures. Do NOT look for diseases or abnormalities. For each structure, provide a label, a simple one-sentence description for a patient, and a bounding box.`;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                bounding_box: {
                    type: Type.OBJECT,
                    properties: { x_min: { type: Type.NUMBER }, y_min: { type: Type.NUMBER }, x_max: { type: Type.NUMBER }, y_max: { type: Type.NUMBER } },
                    required: ["x_min", "y_min", "x_max", "y_max"]
                }
            },
            required: ["label", "description", "bounding_box"]
        }
    };
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: schema },
    });
    return JSON.parse(response.text) as AnatomicalAnnotation[];
};


export const startPatientReportChat = async (reportSummary: string, conversationHistory: ChatMessage[]): Promise<string> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1000));
        const lastUserMessage = conversationHistory.find(m => m.role === 'user')?.text.toLowerCase() || "";
        if(lastUserMessage.includes("benign")) return "Benign means that something is not cancerous. In your case, the finding is a non-cancerous cyst, which is very common and usually not a cause for concern.";
        return "I am an AI assistant here to help you understand your report. Please ask me any questions you have about the terms or findings.";
    }

    const chat = ai!.chats.create({
        model: 'gemini-2.5-flash',
        config: {
             systemInstruction: `You are a friendly, empathetic AI health assistant. Your role is to explain a patient's medical report in simple, easy-to-understand terms. Do not provide medical advice, diagnose, or suggest treatments. Your knowledge is strictly limited to the provided report summary. If asked anything outside this scope, politely decline. Report Summary: "${reportSummary}"`,
        },
    });
    
    const lastUserMessage = [...conversationHistory].reverse().find(m => m.role === 'user')?.text;
    if (!lastUserMessage) return "How can I help you understand your report?";

    const result = await chat.sendMessage({ message: lastUserMessage });
    return result.text;
};


export const generateHealthTips = async (reportSummary: string): Promise<string[]> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 800));
        return ["Maintain a balanced diet rich in fruits and vegetables.", "Engage in regular physical activity, like walking for 30 minutes a day.", "Ensure you get adequate sleep (7-9 hours per night)."];
    }
    const prompt = `Based on a patient's health report summary, generate 3-4 simple, actionable, and encouraging health and wellness tips. The summary is: "${reportSummary}"`;
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
    return JSON.parse(response.text) as string[];
};


// --- Educational Image Generation ---
export const generateEducationalImage = async (prompt: string): Promise<string> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 2000));
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAfLSURBVHhe7d3Nbhw5FAXg/z89e6dZkCRSoGzT0oA0U+vprqYv0fU03//8/AFe+d0/f/33T/7mD//5+z/8/PfvH/7v798//N/fP/yn//z9w//9/fP/f/7nf/6d//z9w//9/QMA/oMWAQAYCFoEAGAgqIkWq6q8X1V1XfXNquqHVT/m+L+qup3sJ/d5v/sJAEAGgiYB5vnvf/7z/z+9DgwA/19TEwIAMBC0CAAgI+i1CAAgIWgRAICBoEUAAAZCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCFgEA+ClCF...';
    }
    
    const response = await ai!.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Create a step-by-step visual guide for a breast self-exam. Generate one clear, annotated image that illustrates the key steps. The style should be minimalist, using line art and highlighted areas. The image should be inclusive and easy to understand. Prompt: ${prompt}`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// --- Research Assistant ---
export const getResearchAnswer = async (query: string): Promise<string> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1200));
        return `Mock response for: "${query}". Based on recent studies, the approach involves...`;
    }

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
            systemInstruction: "You are a medical research assistant. Provide concise, accurate, and evidence-based answers to clinical questions. Cite sources when possible.",
        },
    });
    return response.text;
};

// --- RAG Knowledge Base ---
// RAG Knowledge Base functionality will be handled by the Nuclia widget directly.


// --- MOCK DATA GENERATION ---
const generateMockAnalysis = (caseData: Case): Promise<AnalysisResult> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let mockResult: AnalysisResult;
            const seed = Math.random();

            if (caseData.healthDomain === HealthDomain.SKIN_HEALTH) {
                mockResult = {
                    risk_score: seed > 0.6 ? 78 : 15,
                    recommendation: seed > 0.6 ? Recommendation.REFERRAL : Recommendation.ROUTINE,
                    clinical_summary: seed > 0.6 ? "Asymmetric lesion with color variegation, suspicious for melanoma." : "Benign nevus, no atypical features noted.",
                    patient_summary: seed > 0.6 ? "We noticed a spot that has some concerning features. It's best to have a dermatologist look at it." : "The spot on your skin appears to be a common mole and doesn't look concerning.",
                    findings: [{ id: 's1', label: 'Lesion', description: '7mm macule', bounding_box: { x_min: 0.4, y_min: 0.4, x_max: 0.6, y_max: 0.6}, confidence: 0.9 }]
                };
            } else { // Default to Breast Health mock
                 if (seed < 0.3) {
                    mockResult = { risk_score: 5, recommendation: Recommendation.ROUTINE, clinical_summary: "No suspicious findings.", patient_summary: "Your screening results appear normal.", findings: [], bi_rads: 1 };
                } else if (seed < 0.7) {
                    mockResult = { risk_score: 10, recommendation: Recommendation.ROUTINE, clinical_summary: "Benign cyst identified.", patient_summary: "We found a non-cancerous cyst.", findings: [{ id: 'f1', label: 'Benign Mass', description: '8mm oval mass.', bounding_box: { x_min: 0.4, y_min: 0.5, x_max: 0.5, y_max: 0.6 }, confidence: 0.95 }], bi_rads: 2 };
                } else {
                    mockResult = { risk_score: 82, recommendation: Recommendation.BIOPSY, clinical_summary: "Suspicious mass with irregular margins.", patient_summary: "Your scan shows a concerning area that needs a closer look.", findings: [{ id: 'f2', label: 'Suspicious Mass', description: '15mm irregular mass.', bounding_box: { x_min: 0.65, y_min: 0.3, x_max: 0.78, y_max: 0.42 }, confidence: 0.88 }], bi_rads: 4 };
                }
            }
            resolve(mockResult);
        }, 1500);
    });
};

export const getCasePriority = (result: AnalysisResult): CasePriority => {
    if (result.risk_score > 75 || (result.bi_rads && result.bi_rads >= 4)) {
        return CasePriority.HIGH;
    }
    if (result.risk_score > 40) {
        return CasePriority.MEDIUM;
    }
    return CasePriority.LOW;
};

// --- NEW PATIENT MODE AI ---
// Bento Grid Feature Functions

export const getMenstrualInsights = async (data: MenstrualData): Promise<MenstrualInsights> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 800));
        const phase = data.cycleDay < 14 ? "Follicular Phase (Pre-Ovulation)" : "Luteal Phase (Post-Ovulation)";
        return {
            cycle_phase: phase,
            fertile_window_prediction: data.cycleDay > 8 && data.cycleDay < 18 ? "You are likely in your fertile window." : "You are likely outside your fertile window.",
            symptom_explanations: [`- ${data.symptoms}: This is a common symptom during the ${phase.split(' ')[0]} phase.`],
            wellness_tips: ["- Stay hydrated and consider gentle exercise.", "- Ensure you are getting adequate sleep."]
        };
    }
    
    const prompt = `Analyze the user's menstrual cycle data. The user is on day ${data.cycleDay} of their cycle and experiencing the following symptoms: "${data.symptoms}". Provide an analysis including the likely cycle phase, a prediction for their fertile window, simple explanations for their symptoms, and two general wellness tips.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            cycle_phase: { type: Type.STRING, description: "The likely phase of the menstrual cycle (e.g., Follicular, Luteal)." },
            fertile_window_prediction: { type: Type.STRING, description: "A prediction of whether the user is in their fertile window." },
            symptom_explanations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Simple explanations for the reported symptoms." },
            wellness_tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Two general wellness tips relevant to their cycle phase." }
        },
        required: ["cycle_phase", "fertile_window_prediction", "symptom_explanations", "wellness_tips"]
    };

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    return JSON.parse(response.text) as MenstrualInsights;
};

export const getPregnancyUpdate = async (data: PregnancyData): Promise<PregnancyUpdate> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1200));
        const imageUrl = await generateEducationalImage(`A minimalist illustration of a fetus at 20 weeks gestation.`);
        return {
            week: 20,
            fetal_development_summary: "At 20 weeks, your baby is about the size of a banana. They are developing sensory perceptions, and you may begin to feel their movements more distinctly.",
            common_symptoms: ["Increased energy", "Visible baby bump", "Possible backaches"],
            health_recommendations: ["Continue with prenatal vitamins", "Attend your mid-pregnancy ultrasound"],
            imageUrl: imageUrl
        };
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const prompt = `A user's estimated due date is ${data.dueDate}. Today's date is ${today}. First, calculate the current week of pregnancy (gestational age). Then, for that week, provide a concise fetal development summary, a list of 2-3 common symptoms the mother might experience, and 2 health recommendations.`;
    
    const textSchema = {
        type: Type.OBJECT,
        properties: {
            week: { type: Type.INTEGER, description: "The calculated current week of pregnancy." },
            fetal_development_summary: { type: Type.STRING, description: "A summary of what is happening with the fetus this week." },
            common_symptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 common symptoms for the mother." },
            health_recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Two health recommendations for this week." },
        },
        required: ["week", "fetal_development_summary", "common_symptoms", "health_recommendations"]
    };

    const textResponse = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: textSchema }
    });

    const textResult = JSON.parse(textResponse.text);

    const imageResponse = await ai!.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A minimalist, medically accurate illustration of a human fetus at ${textResult.week} weeks gestation.`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    return { ...textResult, imageUrl };
};

export const runSymptomChecker = async (symptoms: string): Promise<SymptomCheckerResult> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1000));
        return {
            possible_conditions: [
                { name: "Common Cold", likelihood: "High" },
                { name: "Allergies", likelihood: "Medium" },
                { name: "Sinusitis", likelihood: "Low" }
            ],
            suggested_next_steps: ["Rest and stay hydrated.", "Use over-the-counter decongestants if needed.", "Monitor for fever."],
            disclaimer: "This AI Symptom Checker is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."
        };
    }
    
    const prompt = `You are an AI symptom checker. A user reports the following symptoms: "${symptoms}". Based ONLY on this information, provide a list of possible conditions with their likelihood (High, Medium, or Low), a list of suggested next steps, and a standard medical disclaimer. This is for informational purposes only and is not a medical diagnosis. The disclaimer should explicitly state to consult a healthcare professional.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            possible_conditions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        likelihood: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                    },
                    required: ["name", "likelihood"]
                }
            },
            suggested_next_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            disclaimer: { type: Type.STRING }
        },
        required: ["possible_conditions", "suggested_next_steps", "disclaimer"]
    };
    
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    return JSON.parse(response.text) as SymptomCheckerResult;
};

export const getWellnessSummary = async (data: WellnessData): Promise<string> => {
     if (useMock()) {
        await new Promise(res => setTimeout(res, 500));
        return `It's great that you're tracking your wellness. A mood of ${data.mood}/5 and ${data.sleep} hours of sleep is a good baseline. Keep up the consistent effort!`;
    }
    // Real Gemini implementation would go here
}

export const getAIHealthCoachTip = async (): Promise<string> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 600));
        return "Today's Tip: Remember to take a few minutes for deep breathing. Even 60 seconds of focused breath can help reduce stress and improve focus.";
    }
    // Real Gemini implementation would go here
}

export const getConditionInsights = async (data: ConditionData): Promise<string> => {
     if (useMock()) {
        await new Promise(res => setTimeout(res, 900));
        return `Thank you for logging your symptoms. Tracking a pain level of ${data.painLevel}/10 helps in identifying patterns. Consistent tracking can be very helpful for discussions with your doctor.`;
    }
    // Real Gemini implementation would go here
}

// FIX: Add missing functions and types
export interface ReproHealthInsights {
    cycle_phase: string;
    symptom_explanations: string[];
    wellness_tips: string[];
}
export const analyzeReproductiveHealth = async (cycleDay: number, symptoms: string): Promise<ReproHealthInsights> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 800));
        const phase = cycleDay < 14 ? "Follicular Phase (Pre-Ovulation)" : "Luteal Phase (Post-Ovulation)";
        return {
            cycle_phase: phase,
            symptom_explanations: [`- ${symptoms}: This is a common symptom during the ${phase.split(' ')[0]} phase.`],
            wellness_tips: ["- Stay hydrated and consider gentle exercise.", "- Ensure you are getting adequate sleep."]
        };
    }
    const prompt = `A patient is on day ${cycleDay} of their menstrual cycle and reports the following symptoms: "${symptoms}". Provide an analysis including the likely cycle phase, explanations for the symptoms, and general wellness tips.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            cycle_phase: { type: Type.STRING },
            symptom_explanations: { type: Type.ARRAY, items: { type: Type.STRING } },
            wellness_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["cycle_phase", "symptom_explanations", "wellness_tips"],
    };
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });
    return JSON.parse(response.text) as ReproHealthInsights;
};

export interface EducationalContent {
    text: string;
    imageUrl?: string;
}

export const getEducationalContent = async (domain: HealthDomain | string, query: string): Promise<EducationalContent> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1500));
        const imageUrl = await generateEducationalImage(`A visual for ${query} related to ${domain}`);
        return {
            text: `This is a mock educational summary about "${query}" in the context of ${domain}. It explains the key concepts and provides helpful information.`,
            imageUrl: imageUrl,
        };
    }
    const textPrompt = `Generate a concise, easy-to-understand educational explanation for a patient about "${query}" in the context of ${domain}.`;
    const imagePrompt = `Create a simple, clear educational illustration about "${query}" related to ${domain}. The style should be minimalist and informative.`;
    
    const [textResponse, imageResponse] = await Promise.all([
        ai!.models.generateContent({ model: 'gemini-2.5-flash', contents: textPrompt }),
        ai!.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
        })
    ]);
    
    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    return { text: textResponse.text, imageUrl };
};

export interface NutritionInfo {
    estimated_calories: number;
    macronutrients: {
        protein_g: number;
        carbohydrates_g: number;
        fat_g: number;
    };
    suggestions: string[];
}

export const analyzeNutrition = async (imageDataUrl: string, mimeType: string): Promise<NutritionInfo> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1800));
        return {
            estimated_calories: 450,
            macronutrients: { protein_g: 25, carbohydrates_g: 50, fat_g: 15 },
            suggestions: ["Good source of protein.", "Consider adding more green vegetables for fiber."]
        };
    }
    const base64Image = imageDataUrl.split(',')[1];
    const imagePart = { inlineData: { mimeType, data: base64Image } };
    const prompt = "Analyze the provided image of a meal. Estimate the total calories, breakdown of macronutrients (protein, carbohydrates, fat in grams), and provide two simple health suggestions based on the meal.";
    const schema = {
        type: Type.OBJECT,
        properties: {
            estimated_calories: { type: Type.INTEGER },
            macronutrients: {
                type: Type.OBJECT,
                properties: {
                    protein_g: { type: Type.INTEGER },
                    carbohydrates_g: { type: Type.INTEGER },
                    fat_g: { type: Type.INTEGER },
                },
                required: ["protein_g", "carbohydrates_g", "fat_g"]
            },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["estimated_calories", "macronutrients", "suggestions"]
    };
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: schema },
    });
    return JSON.parse(response.text) as NutritionInfo;
};

export const analyzeJournalEntry = async (entry: string): Promise<JournalAnalysis> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1000));
        const hasPositive = entry.toLowerCase().includes('good') || entry.toLowerCase().includes('great');
        return {
            summary: "This is a mock summary of your journal entry. It seems you are reflecting on your day.",
            sentiment: hasPositive ? "Positive" : "Neutral",
            suggestions: [
                "Consider what you are grateful for today.",
                "Take a few deep breaths to center yourself."
            ]
        };
    }

    const prompt = `You are a compassionate AI wellness assistant. Analyze the following journal entry. Do not give medical advice. Provide a brief summary of the key themes, identify the overall sentiment (e.g., Positive, Neutral, Negative, Mixed), and offer 2-3 gentle, encouraging suggestions or affirmations for reflection. The user is looking for reflection, not diagnosis. Here is the entry: "${entry}"`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A brief summary of the key themes in the journal entry." },
            sentiment: { type: Type.STRING, description: "The overall sentiment of the entry (e.g., Positive, Neutral, Negative, Mixed)." },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 gentle, encouraging suggestions or affirmations." }
        },
        required: ["summary", "sentiment", "suggestions"]
    };

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    
    return JSON.parse(response.text) as JournalAnalysis;
}

export const startHealthPlanChat = async (conversation: ChatMessage[], userGoal: string): Promise<ChatMessage> => {
    if (useMock()) {
        await new Promise(res => setTimeout(res, 1500));
        const lastUserMessage = [...conversation].reverse().find(m => m.role === 'user')?.text.toLowerCase() || "";
        let imageUrl: string | undefined = undefined;
        let text = "That's a great goal! Let's break it down. We can start by focusing on consistent sleep and adding some light activity. How does that sound?";
        
        if(lastUserMessage.includes("show me") || lastUserMessage.includes("diagram")) {
            imageUrl = await generateEducationalImage("foods rich in magnesium");
            text = "Certainly. Here is a visual guide to foods rich in magnesium, which can help with sleep and energy."
        }
        
        return {
            id: crypto.randomUUID(),
            role: 'model',
            text,
            timestamp: new Date(),
            imageUrl,
        };
    }

    const lastUserMessage = [...conversation].reverse().find(m => m.role === 'user')?.text;
    if (!lastUserMessage) {
         return { id: crypto.randomUUID(), role: 'model', text: "What health goal are you focusing on today?", timestamp: new Date() };
    }
    
    const systemInstruction = `You are an AI Health Coach. Your role is to help users create simple, actionable health plans based on their goals. Be encouraging and supportive. The user's primary goal is: "${userGoal}". If the user asks for a visual or a diagram (e.g., 'show me a diagram of...'), start your response with the special token "[GENERATE_IMAGE]" followed by a concise prompt for an image generation model. For example: "[GENERATE_IMAGE] A diagram of the Mediterranean diet pyramid." Then, continue with your text response. Otherwise, just provide a helpful text response.`;

    const chat = ai!.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
    });

    const result = await chat.sendMessage({ message: lastUserMessage });
    let textResponse = result.text;
    let imageUrl: string | undefined = undefined;

    if (textResponse.startsWith("[GENERATE_IMAGE]")) {
        const imagePromptMatch = textResponse.match(/\[GENERATE_IMAGE\](.*)/);
        const imagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : "A general health and wellness visual.";
        // Remove the token from the text response
        textResponse = textResponse.replace(/\[GENERATE_IMAGE\][^.]*\.?/, '').trim();

        try {
            imageUrl = await generateEducationalImage(imagePrompt);
        } catch (e) {
            console.error("Image generation failed in chat:", e);
            textResponse += "\n\n(I was unable to generate a visual for this, but I can describe it.)";
        }
    }
    
    return {
        id: crypto.randomUUID(),
        role: 'model',
        text: textResponse,
        timestamp: new Date(),
        imageUrl,
    };
};
