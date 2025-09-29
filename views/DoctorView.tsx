import React, { useState } from 'react';
import Layout, { DoctorViewType } from './Layout';
import DoctorDashboard from './doctor/DoctorDashboard';
import ScanViewer from './doctor/ScanViewer';
import Research from './doctor/Research';
import EducationStudio from './doctor/EducationStudio';
import CephalometricAnalysisView from './doctor/CephalometricAnalysisView';
import BreastCancerAnalysisView from './doctor/BreastCancerAnalysisView';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

interface DoctorViewProps {
  onUploadClick: () => void;
  onSwitchMode: () => void;
}

const DoctorView: React.FC<DoctorViewProps> = ({ onUploadClick, onSwitchMode }) => {
  const [currentView, setCurrentView] = useState<DoctorViewType | 'scanViewer'>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const selectedCase = useLiveQuery(() => 
    selectedCaseId ? db.cases.get(selectedCaseId) : Promise.resolve(undefined),
    [selectedCaseId]
  );
  
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentView('scanViewer');
  };
  
  const handleNavigate = (view: DoctorViewType) => {
      setSelectedCaseId(null);
      setCurrentView(view);
  }

  const handleBack = () => {
    setSelectedCaseId(null);
    setCurrentView('dashboard');
  };
  
  const renderContent = () => {
      switch(currentView) {
          case 'dashboard':
            return <DoctorDashboard onSelectCase={handleSelectCase} />;
          case 'scanViewer':
            return selectedCase && <ScanViewer caseData={selectedCase} onBack={handleBack} />;
          case 'research':
            return <Research />;
          case 'education':
            return <EducationStudio />;
          case 'cephalometric':
            return <CephalometricAnalysisView />;
          case 'breast-cancer-analysis':
            return <BreastCancerAnalysisView />;
          default:
            return <DoctorDashboard onSelectCase={handleSelectCase} />;
      }
  }

  const getViewTitle = () => {
      if(currentView === 'scanViewer') return `Case Review: ${selectedCaseId?.substring(0,8) || ''}`;
      if(currentView === 'research') return 'AI Research Assistant';
      if(currentView === 'education') return 'Education Studio';
      if(currentView === 'cephalometric') return 'Cephalometric Analysis Tool';
      if(currentView === 'breast-cancer-analysis') return 'Breast Cancer Analysis Tool';
      return 'Triage Dashboard';
  }

  return (
    <Layout
      mode="doctor"
      onUploadClick={onUploadClick}
      onSwitchMode={onSwitchMode}
      onNavigate={handleNavigate}
      viewTitle={getViewTitle()}
    >
      {renderContent()}
    </Layout>
  );
};

export default DoctorView;