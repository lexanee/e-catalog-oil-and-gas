import React from "react";
import { Route, Routes } from "react-router-dom";
import { AssetProvider } from "./context/AssetContext";
import { AuthProvider } from "./context/AuthContext";
import { LogisticsProvider } from "./context/LogisticsContext";
import { MasterDataProvider } from "./context/MasterDataContext";
import { ProcurementProvider } from "./context/ProcurementContext";
import { ThemeProvider } from "./context/ThemeContext";

// Core Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";

// Feature: Dashboard
import Overview from "./features/dashboard/pages/Overview";

// Feature: Auth
import ActivateAccount from "./features/auth/pages/ActivateAccount";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";

// Feature: Core
import NotFound from "./features/core/pages/NotFound";

// Feature: Settings
import Settings from "./features/settings/pages/Settings";

// Feature: Assets
import AssetDetail from "./features/assets/pages/AssetDetail";
import AssetRegistry from "./features/assets/pages/AssetRegistry";
import AssetVerificationBoard from "./features/assets/pages/AssetVerificationBoard";
import CompareAssets from "./features/assets/pages/CompareAssets";
import MaintenanceManager from "./features/assets/pages/MaintenanceManager";
import OperationsMap from "./features/assets/pages/OperationsMap";

// Feature: Master Data (New)
import TechnicalParameters from "./features/master-data/pages/TechnicalParameters";

// Feature: Procurement
import ContractTracking from "./features/procurement/pages/ContractTracking";
import CreateEnquiry from "./features/procurement/pages/CreateEnquiry";
import EnquiryList from "./features/procurement/pages/EnquiryList";
import MarketAssessment from "./features/procurement/pages/MarketAssessment";
import TenderManagement from "./features/procurement/pages/TenderManagement";
import ReportCenter from "./features/reports/pages/ReportCenter";

// Feature: Logistics
import ShorebaseHub from "./features/logistics/pages/ShorebaseHub";

// Feature: Vendor
import TKDNCalculator from "./features/vendor/pages/TKDNCalculator";
import VendorDashboard from "./features/vendor/pages/VendorDashboard";
import VendorList from "./features/vendor/pages/VendorList";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate" element={<ActivateAccount />} />

        {/* --- SCM & TECHNICAL (Shared Dashboard) --- */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["scm", "technical"]}>
              <Layout>
                <Overview />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* --- TECHNICAL ONLY --- */}
        <Route
          path="/master-data"
          element={
            <ProtectedRoute allowedRoles={["technical"]}>
              <Layout>
                <AssetRegistry />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-data/parameters"
          element={
            <ProtectedRoute allowedRoles={["technical"]}>
              <Layout>
                <TechnicalParameters />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/governance"
          element={
            <ProtectedRoute allowedRoles={["technical"]}>
              <Layout>
                <AssetVerificationBoard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedRoles={["technical"]}>
              <Layout>
                <MaintenanceManager />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* --- SCM & VENDOR (Asset Catalog) --- */}
        <Route
          path="/asset-catalog"
          element={
            <ProtectedRoute allowedRoles={["scm", "vendor"]}>
              <Layout>
                <AssetRegistry />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* --- SHARED ASSET DETAILS --- */}
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute allowedRoles={["scm", "technical", "vendor"]}>
              <Layout>
                <AssetDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-map"
          element={
            <ProtectedRoute allowedRoles={["scm", "technical"]}>
              <Layout>
                <OperationsMap />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute allowedRoles={["scm", "technical"]}>
              <Layout>
                <CompareAssets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-list"
          element={
            <ProtectedRoute allowedRoles={["scm", "technical"]}>
              <Layout>
                <EnquiryList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/logistics"
          element={
            <ProtectedRoute allowedRoles={["scm", "technical"]}>
              <Layout>
                <ShorebaseHub />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["scm", "technical"]}>
              <Layout>
                <ReportCenter />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* --- SCM ONLY (Commercial) --- */}
        <Route
          path="/market-assessment"
          element={
            <ProtectedRoute allowedRoles={["scm"]}>
              <Layout>
                <MarketAssessment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/request/:id"
          element={
            <ProtectedRoute allowedRoles={["scm"]}>
              <Layout>
                <CreateEnquiry />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenders"
          element={
            <ProtectedRoute allowedRoles={["scm"]}>
              <Layout>
                <TenderManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts"
          element={
            <ProtectedRoute allowedRoles={["scm"]}>
              <Layout>
                <ContractTracking />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <ProtectedRoute allowedRoles={["scm"]}>
              <Layout>
                <VendorList />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* --- VENDOR PORTAL --- */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <Layout>
                <VendorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Hide TKDN Calculator by commenting out the route*/}
        {/* <Route
                      path="/tkdn-calc"
                      element={
                        <ProtectedRoute allowedRoles={["vendor"]}>
                          <Layout>
                            <TKDNCalculator />
                          </Layout>
                        </ProtectedRoute>
                      }
                    /> */}

        {/* --- SHARED SETTINGS --- */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["scm", "vendor", "technical"]}>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
