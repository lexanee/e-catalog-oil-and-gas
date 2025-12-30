import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { CurrencyProvider } from "./context/CurrencyContext";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext"; // Assuming this import based on the provided code edit
import { AuthProvider } from "./context/AuthContext"; // Assuming this import based on the provided code edit
import { AssetProvider } from "./context/AssetContext"; // Assuming this import based on the provided code edit
import { ProcurementProvider } from "./context/ProcurementContext"; // Assuming this import based on the provided code edit
import { LogisticsProvider } from "./context/LogisticsContext"; // Assuming this import based on the provided code edit

import { MasterDataProvider } from "./context/MasterDataContext";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <AssetProvider>
              <ProcurementProvider>
                <LogisticsProvider>
                  <MasterDataProvider>
                    <App />
                  </MasterDataProvider>
                </LogisticsProvider>
              </ProcurementProvider>
            </AssetProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
