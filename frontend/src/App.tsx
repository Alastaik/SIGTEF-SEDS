import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './features/admin/dashboard/AdminDashboard';
import { DelayedEntitiesPage } from './features/admin/dashboard/DelayedEntitiesPage';
import { UsersPage } from './features/admin/UsersPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { AcceptInvitation } from './features/auth/AcceptInvitation';

import { SettingsLayout } from './pages/settings/SettingsLayout';
import { SettingsGeneralPage } from './pages/settings/SettingsGeneralPage';
import { SettingsCompetencesPage } from './pages/settings/SettingsCompetencesPage';
import { SettingsTemplatesPage } from './pages/settings/SettingsTemplatesPage';
import { SettingsFlagsPage } from './pages/settings/SettingsFlagsPage';
import { RolesPage } from './pages/settings/RolesPage';

import { BaseRegistriesLayout } from './pages/base-registries/BaseRegistriesLayout';
import { BaseRegistriesDashboard } from './pages/base-registries/BaseRegistriesDashboard';
import { DocumentTypesPage } from './pages/base-registries/DocumentTypesPage';
import { ProgramsPage } from './pages/base-registries/ProgramsPage';
import { RegionsCitiesPage } from './pages/base-registries/RegionsCitiesPage';
import { ProgramValuesPage } from './pages/base-registries/ProgramValuesPage';
import { DomainDataPage } from './pages/base-registries/DomainDataPage';

import { EntityList } from './features/entities/pages/EntityList';
import { EntityForm } from './features/entities/pages/EntityForm';
import { EntityDetailsLayout } from './features/entities/pages/EntityDetailsLayout';


import { AgreementsList } from './features/agreements/pages/AgreementsList';
import { AgreementForm } from './features/agreements/pages/AgreementForm';
import { AgreementDetailsLayout } from './features/agreements/pages/AgreementDetailsLayout';

import { MonthlyExecutionsPage } from './pages/executions/MonthlyExecutionsPage';
import { AccountabilityAnalysisList } from './pages/executions/AccountabilityAnalysisList';

import { NotificationsPage } from './features/admin/notifications/NotificationsPage';
import { ReportsPage } from './features/admin/dashboard/ReportsPage';
import { AuditPage } from './features/admin/AuditPage';
import { InspectionsPage } from './features/admin/InspectionsPage';
import { ImportsPage } from './features/admin/ImportsPage';
import { Toaster } from 'react-hot-toast';

import { PortalLayout } from './features/portal/components/PortalLayout';
import { PortalDashboard } from './features/portal/pages/PortalDashboard';
import { PortalEntitySelector } from './features/portal/pages/PortalEntitySelector';
import { PortalCompetences } from './features/portal/pages/PortalCompetences';
import { PortalAccountabilities } from './features/portal/pages/PortalAccountabilities';
import { GuidedAccountabilityFlow } from './features/portal/pages/GuidedAccountabilityFlow';

import { PortalAccountabilityDetails } from './features/portal/pages/PortalAccountabilityDetails';
import { PortalAgreements } from './features/portal/pages/PortalAgreements';
import { PortalIssues } from './features/portal/pages/PortalIssues';
import { PortalNotifications } from './features/portal/pages/PortalNotifications';

const queryClient = new QueryClient();

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.userType === 'EXTERNO' ? '/portal' : '/admin'} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/convite/:token" element={<AcceptInvitation />} />
            
            {/* Rotas protegidas (Admin Interno) */}
            <Route element={<ProtectedRoute allowedType="INTERNO" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="atrasos" element={<DelayedEntitiesPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="audit" element={<AuditPage />} />
                <Route path="inspections" element={<InspectionsPage />} />
                <Route path="imports" element={<ImportsPage />} />
                <Route path="settings" element={<SettingsLayout />}>
                  <Route path="general" element={<SettingsGeneralPage />} />
                  <Route path="competences" element={<SettingsCompetencesPage />} />
                  <Route path="templates" element={<SettingsTemplatesPage />} />
                  <Route path="flags" element={<SettingsFlagsPage />} />
                  <Route path="roles" element={<RolesPage />} />
                  <Route index element={<SettingsGeneralPage />} />
                </Route>
                <Route path="base-registries" element={<BaseRegistriesLayout />}>
                  <Route index element={<BaseRegistriesDashboard />} />
                  <Route path="documents" element={<DocumentTypesPage />} />
                  <Route path="programs" element={<ProgramsPage />} />
                  <Route path="program-values" element={<ProgramValuesPage />} />
                  <Route path="regions-cities" element={<RegionsCitiesPage />} />
                  <Route path="domain/:type" element={<DomainDataPage />} />
                </Route>
                <Route path="entities">
                  <Route index element={<EntityList />} />
                  <Route path="new" element={<EntityForm />} />
                  <Route path=":id/*" element={<EntityDetailsLayout />} />
                </Route>
                <Route path="agreements">
                  <Route index element={<AgreementsList />} />
                  <Route path="new" element={<AgreementForm />} />
                  <Route path=":id/*" element={<AgreementDetailsLayout />} />
                </Route>
                <Route path="executions" element={<MonthlyExecutionsPage />} />
                <Route path="analysis" element={<AccountabilityAnalysisList />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>
            </Route>

            {/* Rotas protegidas (Portal Externo) */}
            <Route element={<ProtectedRoute allowedType="EXTERNO" />}>
              <Route path="/portal" element={<PortalLayout />}>
                <Route index element={<PortalDashboard />} />
                <Route path="select-entity" element={<PortalEntitySelector />} />
                <Route path="agreements" element={<PortalAgreements />} />
                <Route path="competences" element={<PortalCompetences />} />
                <Route path="accountabilities" element={<PortalAccountabilities />} />
                <Route path="accountabilities/:id" element={<PortalAccountabilityDetails />} />
                <Route path="issues" element={<PortalIssues />} />
                <Route path="notifications" element={<PortalNotifications />} />
                <Route path="accountabilities/:id/wizard" element={<GuidedAccountabilityFlow />} />
              </Route>
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
