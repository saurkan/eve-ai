import { useState, useCallback } from 'react';
import { db } from '../services/db';
import { analyzeScan, getCasePriority } from '../services/geminiService';
import { Case, CaseStatus, HealthDomain, ScanType, CasePriority } from '../types';

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const useCaseProcessor = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processCaseAnalysis = useCallback(async (caseId: string) => {
        const caseToProcess = await db.cases.get(caseId);
        if (!caseToProcess) return;

        try {
            const result = await analyzeScan(caseToProcess);
            const priority = getCasePriority(result);

            await db.cases.update(caseId, {
                analysisResult: result,
                status: CaseStatus.REVIEW_PENDING,
                priority: priority,
            });
        } catch (error) {
            console.error('Analysis failed:', error);
            await db.cases.update(caseId, { status: CaseStatus.ANALYSIS_FAILED });
            throw error;
        }
    }, []);

    const processNewCase = useCallback(async (file: File, domain: HealthDomain, scanType: ScanType) => {
        setIsProcessing(true);
        setError(null);
        try {
            const dataUrl = await fileToDataUrl(file);
            const newCase: Case = {
                id: crypto.randomUUID(),
                patientId: `P${Date.now()}`,
                createdAt: new Date(),
                status: CaseStatus.PENDING_ANALYSIS,
                priority: CasePriority.LOW,
                healthDomain: domain,
                scanType: scanType,
                image: { dataUrl, name: file.name, type: file.type },
            };
            await db.cases.add(newCase);
            await processCaseAnalysis(newCase.id);
        } catch (err: any) {
            console.error('Failed to create new case:', err);
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsProcessing(false);
        }
    }, [processCaseAnalysis]);

    return { isProcessing, error, processNewCase };
};