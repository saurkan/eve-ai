# EVE AI: Advanced Clinical Support & Personalized Patient Care

EVE AI is a cutting-edge application designed to revolutionize women's health by providing intelligent, AI-driven tools for both medical professionals and patients. It streamlines workflows for clinicians through automated analysis and report generation, while empowering patients with accessible health information and personalized tracking tools.

## Problem Solved

EVE AI addresses critical challenges in medical imaging analysis, comprehensive report generation, and effective patient education, particularly within the domain of breast health. It bridges the gap between complex medical data and understandable patient information, enhancing efficiency for healthcare providers and improving health literacy for patients.

## Key Features

### AI-Powered Clinical Analysis (for Medical Professionals)

*   **Breast Scan Analysis:** Utilizes AI to highlight suspicious regions, provide BI-RADS scores, generate clinical summaries, and assess risk levels.
*   **Cephalometric Analysis:** Accurately identifies precise anatomical landmarks on X-rays, crucial for orthodontic imaging and planning.
*   **Skin Photo Analysis:** Identifies lesions, assesses their characteristics (asymmetry, border, color, diameter, evolution), and provides malignancy risk scores.
*   **Differential Diagnosis Generation:** Suggests the most likely differential diagnoses based on provided clinical summaries.
*   **Longitudinal Summary Generation:** Compares current and prior medical scans to summarize changes in findings over time.
*   **Clinical Note Drafting:** Automates the generation of structured clinical notes (e.g., SOAP format) based on AI analysis.
*   **Second Opinion Generation:** Offers AI-powered second opinions on medical scans and initial AI analyses for enhanced diagnostic confidence.
*   **Clinical and Patient Report Generation:** Creates detailed clinical reports for healthcare providers and simplified, patient-friendly reports for better patient understanding.

### Patient-Facing AI Tools (for Patients)

*   **Menstrual & Reproductive Health Tracking:** Enables tracking of menstrual cycles, prediction of ovulation, and AI-powered insights into symptoms.
*   **Pregnancy & Postpartum Tracking:** Monitors fetal development, common maternal symptoms, and provides tailored health recommendations.
*   **AI Symptom Checker:** Offers preliminary AI analysis and suggests next steps based on reported symptoms.
*   **Personalized Health Education:** Provides clear, illustrated answers to health questions, making complex medical information accessible.
*   **Medication Helper:** Explains prescription information in simple, easy-to-understand terms.
*   **Scan Annotator:** Identifies and labels anatomical structures on medical scans for educational purposes, helping patients understand their own imaging.
*   **AI Health Plan Coach:** Assists users in creating and tracking personalized wellness plans to achieve their health goals.
*   **Journal Entry Analysis:** Summarizes journal entries, identifies overall sentiment, and offers gentle, encouraging suggestions for reflection.

### RAG Knowledge Box (Progress Nuclia Integration)

*   **Interactive Chat Interface:** Provides a chat-based interface for users to ask breast cancer-related questions.
*   **Contextual Answers:** Powered by **Progress Nuclia**, it offers Retrieval-Augmented Generation (RAG) to deliver grounded answers with relevant citations and context.
*   **Direct Widget Integration:** Seamlessly integrated using the official Nuclia widget for robust and reliable knowledge retrieval.

### Multi-Modal AI Tools

*   **Image Editing with Text:** Allows for editing and annotating images based on natural language text prompts.
*   **Educational Image Generation:** Generates minimalist, medically accurate illustrations for various educational content needs.

## Tech Stack

EVE AI is built with a modern and robust technology stack:

*   **Frontend:** React, TypeScript, Vite
*   **UI Framework:** Material UI (MUI) for a consistent and responsive user interface.
*   **AI Integration:** Google Gemini API (`@google/genai`) for advanced AI capabilities across various features.
*   **Database:** Dexie.js, a powerful IndexedDB wrapper, for efficient client-side data storage.
*   **UI Components:** Leverages a comprehensive suite of **KendoReact** components from Progress for rich and interactive UI elements, including:
    *   `PanelBar`, `PanelBarItem`: For collapsible and organized content sections.
    *   `Scheduler`: For appointment management and display.
    *   `DatePicker`: For intuitive date input.
    *   `Notification`: For displaying timely alerts and messages.
    *   `Chart`, `ChartSeries`, `ChartSeriesItem`, `ChartCategoryAxis`, `ChartCategoryAxisItem`, `ChartValueAxis`, `ChartValueAxisItem`: For visualizing health analytics data.
    *   `Button`: For interactive actions.
    *   `Input`: For text input fields.
    *   `DropDownList`: For selection of options from a list.
    *   `Upload`: For handling file uploads.
    *   `TreeView`: For hierarchical navigation in the sidebar.
    *   `Splitter`, `SplitterPane`: For flexible layout management, especially in analysis views.
    *   `ProgressBar`: For indicating loading and processing status.
    *   `TabStrip`, `TabStripTab`: For organizing content into tabbed interfaces.
    *   `Tooltip`: For providing additional information on hover.
    *   `ListView`: For displaying lists of items with custom rendering.
*   **RAG (Retrieval-Augmented Generation):** Progress Nuclia, integrated via its official widget, for intelligent knowledge retrieval.

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    `npm install`
2.  Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3.  Run the app:
    `npm run dev`
