
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AssetProvider } from './context/AssetContext';
import { ProcurementProvider } from './context/ProcurementContext';
import { LogisticsProvider } from './context/LogisticsContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Core Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Feature: Dashboard
import Overview from './features/dashboard/pages/Overview';

// Feature: Auth
import Login from './features/auth/pages/Login';

// Feature: Core
import NotFound from './features/core/pages/NotFound';

// Feature: Settings
import Settings from './features/settings/pages/Settings';

// Feature: Assets
import AssetRegistry from './features/assets/pages/AssetRegistry';
import AssetDetail from './features/assets/pages/AssetDetail';
import OperationsMap from './features/assets/pages/OperationsMap';
import CompareAssets from './features/assets/pages/CompareAssets';

// Feature: Procurement
import CreateEnquiry from './features/procurement/pages/CreateEnquiry';
import EnquiryList from './features/procurement/pages/EnquiryList';
import TenderManagement from './features/procurement/pages/TenderManagement';
import ContractTracking from './features/procurement/pages/ContractTracking';
import MarketAssessment from './features/procurement/pages/MarketAssessment';

// Feature: Logistics
import ShorebaseHub from './features/logistics/pages/ShorebaseHub';

// Feature: Vendor
import VendorList from './features/vendor/pages/VendorList';
import VendorDashboard from './features/vendor/pages/VendorDashboard';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AssetProvider>
          <ProcurementProvider>
            <LogisticsProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  
                  {/* --- SCM & TECHNICAL (Shared Dashboard) --- */}
                  <Route path="/" element={
                    <ProtectedRoute allowedRoles={['scm', 'technical']}>
                      <Layout><Overview /></Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* --- TECHNICAL ONLY (Strict Master Data) --- */}
                  <Route path="/master-data" element={
                    <ProtectedRoute allowedRoles={['technical']}>
                      <Layout><AssetRegistry /></Layout>
                    </ProtectedRoute>
                  } />

                  {/* --- SCM & VENDOR (Asset Catalog) --- */}
                  <Route path="/asset-catalog" element={
                    <ProtectedRoute allowedRoles={['scm', 'vendor']}>
                      <Layout><AssetRegistry /></Layout>
                    </ProtectedRoute>
                  } />

                  {/* --- SHARED ASSET DETAILS --- */}
                  <Route path="/product/:id" element={
                    <ProtectedRoute allowedRoles={['scm', 'technical', 'vendor']}>
                      <Layout><AssetDetail /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/live-map" element={
                    <ProtectedRoute allowedRoles={['scm', 'technical']}>
                      <Layout><OperationsMap /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/compare" element={
                    <ProtectedRoute allowedRoles={['scm', 'technical']}>
                      <Layout><CompareAssets /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/request-list" element={
                    <ProtectedRoute allowedRoles={['scm', 'technical']}>
                      <Layout><EnquiryList /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/logistics" element={
                    <ProtectedRoute allowedRoles={['scm', 'technical']}>
                      <Layout><ShorebaseHub /></Layout>
                    </ProtectedRoute>
                  } />

                  {/* --- SCM ONLY (Commercial) --- */}
                  <Route path="/market-assessment" element={
                    <ProtectedRoute allowedRoles={['scm']}>
                      <Layout><MarketAssessment /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/request/:id" element={
                    <ProtectedRoute allowedRoles={['scm']}>
                      <Layout><CreateEnquiry /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/tenders" element={
                    <ProtectedRoute allowedRoles={['scm']}>
                      <Layout><TenderManagement /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/contracts" element={
                    <ProtectedRoute allowedRoles={['scm']}>
                      <Layout><ContractTracking /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/vendors" element={
                    <ProtectedRoute allowedRoles={['scm']}>
                      <Layout><VendorList /></Layout>
                    </ProtectedRoute>
                  } />

                  {/* --- VENDOR PORTAL --- */}
                  <Route path="/vendor" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <Layout><VendorDashboard /></Layout>
                    </ProtectedRoute>
                  } />

                  {/* --- SHARED SETTINGS --- */}
                  <Route path="/settings" element={
                    <ProtectedRoute allowedRoles={['scm', 'vendor', 'technical']}>
                      <Layout><Settings /></Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </LogisticsProvider>
          </ProcurementProvider>
        </AssetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
