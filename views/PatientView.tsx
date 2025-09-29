import React, { useState } from 'react';
import Layout, { PatientViewType } from './Layout';
import PatientDashboard from './patient/PatientDashboard';
import MyReportsView from './patient/MyReportsView';
import PatientReportViewer from './patient/PatientReportViewer';
import { HealthDomain } from '../types';

// New Bento Grid Modules
import MenstrualTrackerModule from './patient/MenstrualTrackerModule';
import PregnancyTrackerModule from './patient/PregnancyTrackerModule';
import TelemedicineModule from './patient/TelemedicineModule';
import PersonalizedEducationModule from './patient/PersonalizedEducationModule';
import MedicationHelperModule from './patient/MedicationHelperModule';
import ScanAnnotatorModule from './patient/ScanAnnotatorModule';
import HealthPlanModule from './patient/HealthPlanModule';


interface PatientViewProps {
  onUploadClick: () => void;
  onSwitchMode: () => void;
}

const PatientView: React.FC<PatientViewProps> = ({ onUploadClick, onSwitchMode }) => {
  const [currentView, setCurrentView] = useState<PatientViewType>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleNavigate = (view: PatientViewType, caseId?: string) => {
      setCurrentView(view);
      setSelectedCaseId(caseId || null);
  }

  const handleBackToDashboard = () => {
      setCurrentView('dashboard');
      setSelectedCaseId(null);
  }
  
  const handleBackToReports = () => {
      setCurrentView('my-reports');
      setSelectedCaseId(null);
  }
  
  const renderContent = () => {
      switch(currentView) {
          case 'dashboard':
            return <PatientDashboard onNavigate={handleNavigate} />;
          case 'my-reports':
            return <MyReportsView onSelectCase={(caseId) => handleNavigate('report-viewer', caseId)} />;
          case 'report-viewer':
            return selectedCaseId && <PatientReportViewer caseId={selectedCaseId} onBack={handleBackToReports} />;
          
          // Bento Grid Modules
          case 'menstrual-tracker':
            return <MenstrualTrackerModule onBack={handleBackToDashboard} />;
          case 'pregnancy-tracker':
            return <PregnancyTrackerModule onBack={handleBackToDashboard} />;
          case 'symptom-checker':
            return <TelemedicineModule onBack={handleBackToDashboard} />;
          case 'health-education':
              return <PersonalizedEducationModule onBack={handleBackToDashboard} />;
          case 'medication-helper':
              return <MedicationHelperModule onBack={handleBackToDashboard} />;
          case 'scan-annotator':
              return <ScanAnnotatorModule onBack={handleBackToDashboard} />;
          case 'health-plan':
              return <HealthPlanModule onBack={handleBackToDashboard} />;

          default:
             return <PatientDashboard onNavigate={handleNavigate} />;
      }
  }

  const getTitle = () => {
      if(currentView === 'dashboard') return 'Your Health Hub';
      if(currentView === 'my-reports') return 'My Reports';
      if(currentView === 'report-viewer') return `Report for Case ${selectedCaseId?.substring(0,8) || ''}`;
      
      const titleMap: Record<string, string> = {
          'menstrual-tracker': 'Menstrual & Reproductive Health',
          'pregnancy-tracker': 'Pregnancy & Postpartum',
          'symptom-checker': 'AI Symptom Checker',
          'health-education': 'Personalized Health Education',
          'medication-helper': 'AI Medication Helper',
          'scan-annotator': 'Annotate My Scan',
          'health-plan': 'My AI Health Plan',
      }
      if(titleMap[currentView]) return titleMap[currentView];
      
      return 'Patient Portal';
  }

  return (
    <Layout
      mode="patient"
      onUploadClick={onUploadClick}
      onSwitchMode={onSwitchMode}
      onNavigate={handleNavigate}
      viewTitle={getTitle()}
    >
        {renderContent()}
    </Layout>
  );
};

export default PatientView;