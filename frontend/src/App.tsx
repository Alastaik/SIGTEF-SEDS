import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { UsersPage } from './features/admin/UsersPage';
import { RolesPage } from './features/admin/RolesPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import { SettingsLayout } from './pages/settings/SettingsLayout';
import { SettingsGeneralPage } from './pages/settings/SettingsGeneralPage';
import { SettingsCompetencesPage } from './pages/settings/SettingsCompetencesPage';
import { SettingsTemplatesPage } from './pages/settings/SettingsTemplatesPage';
import { SettingsFlagsPage } from './pages/settings/SettingsFlagsPage';

import { BaseRegistriesLayout } from './pages/base-registries/BaseRegistriesLayout';
import { BaseRegistriesDashboard } from './pages/base-registries/BaseRegistriesDashboard';
import { DocumentTypesPage } from './pages/base-registries/DocumentTypesPage';


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Rotas protegidas (Painel) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo ao SIGTEF</h2>
                    <p className="text-slate-600">Selecione uma opção no menu lateral para começar.</p>
                  </div>
                } />
                <Route path="users" element={<UsersPage />} />
                <Route path="roles" element={<RolesPage />} />
                <Route path="settings" element={<SettingsLayout />}>
                  <Route path="general" element={<SettingsGeneralPage />} />
                  <Route path="competences" element={<SettingsCompetencesPage />} />
                  <Route path="templates" element={<SettingsTemplatesPage />} />
                  <Route path="flags" element={<SettingsFlagsPage />} />
                  <Route index element={<SettingsGeneralPage />} />
                </Route>
                <Route path="base-registries" element={<BaseRegistriesLayout />}>
                  <Route index element={<BaseRegistriesDashboard />} />
                  <Route path="documents" element={<DocumentTypesPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="/" element={
              <div className="p-8">
                <h1 className="text-3xl font-bold">Painel do SIGTEF</h1>
                <p>Bem-vindo! A sessão administrativa será construída aqui.</p>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
