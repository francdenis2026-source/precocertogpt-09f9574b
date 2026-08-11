import "./performance/disableClientImageProcessing";
import "./performance/tolerantDomMutations";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrecoCertoApp from "./PrecoCertoApp";
import { MaxPriceStoreLabels } from "./components/MaxPriceStoreLabels";
import { SearchUxClarity } from "./components/SearchUxClarity";
import { ProductInteractionUx } from "./components/ProductInteractionUx";
import { PublicCatalogUxFixes } from "./components/PublicCatalogUxFixes";
import { PublicOnlineSalesAvailability } from "./components/PublicOnlineSalesAvailability";
import { HomeSearchKeyboardUx } from "./components/HomeSearchKeyboardUx";
import { RebuiltVisualSystem } from "./components/RebuiltVisualSystem";
import { RebuiltInternalUx } from "./components/RebuiltInternalUx";
import { PreferredProductPngUpgrade } from "./components/PreferredProductPngUpgrade";
import { EstablishmentsMarketplacePage } from "./components/EstablishmentsMarketplacePage";
import { EstablishmentsNavBridge } from "./components/EstablishmentsNavBridge";
import { PublicEstablishmentCatalog } from "./components/PublicEstablishmentCatalog";
import { DorinhaAuthorStore } from "./components/DorinhaAuthorStore";
import { DorinhaCommerceEnhancer } from "./components/DorinhaCommerceEnhancer";
import { DorinhaBookCoverPolish } from "./components/DorinhaBookCoverPolish";
import { FremixProductionsPage } from "./components/FremixProductionsPage";
import { FremixDirectoryBridge } from "./components/FremixDirectoryBridge";
import { FremixCuratedVideos } from "./components/FremixCuratedVideos";
import { BasketSessionFlow } from "./components/BasketSessionFlow";
import { AuthorMerchantDashboardWelcome } from "./components/AuthorMerchantDashboardWelcome";
import { AuthorCatalogEditor } from "./components/AuthorCatalogEditor";
import { MerchantDashboard } from "./components/MerchantDashboard";
import { MerchantBusinessSetup } from "./components/MerchantBusinessSetup";
import { MerchantBusinessSetupShortcut } from "./components/MerchantBusinessSetupShortcut";
import { MerchantDemoSwitcher } from "./components/MerchantDemoSwitcher";
import { MerchantCatalogStudio } from "./components/MerchantCatalogStudio";
import { MerchantManagementCenter } from "./components/MerchantManagementCenter";
import { MerchantOnlineSalesControl } from "./components/MerchantOnlineSalesControl";
import { MerchantOnlineStoreRoute } from "./components/MerchantOnlineStoreRoute";
import { MerchantOnboardingPage } from "./components/MerchantOnboardingPage";
import { PlatformAdminDashboard } from "./components/PlatformAdminDashboard";
import { AdminMerchantManagement } from "./components/AdminMerchantManagement";
import { CustomerOrders } from "./components/CustomerOrders";
import { MercadoPagoCallback } from "./components/MercadoPagoCallback";
import { CollaboratePage, ContactPage, PharmaciesPage } from "./components/PublicFooterServicePages";

export default function App() {
  return (
    <BrowserRouter>
      <RebuiltVisualSystem />
      <RebuiltInternalUx />
      <MaxPriceStoreLabels />
      <SearchUxClarity />
      <ProductInteractionUx />
      <PublicCatalogUxFixes />
      <PublicOnlineSalesAvailability />
      <HomeSearchKeyboardUx />
      <PreferredProductPngUpgrade />
      <MerchantBusinessSetupShortcut />
      <MerchantDemoSwitcher />
      <EstablishmentsNavBridge />
      <FremixDirectoryBridge />
      <FremixCuratedVideos />
      <BasketSessionFlow />
      <AuthorMerchantDashboardWelcome />
      <DorinhaCommerceEnhancer />
      <DorinhaBookCoverPolish />
      <Routes>
        <Route path="/estabelecimentos" element={<EstablishmentsMarketplacePage />} />
        <Route path="/estabelecimento/:identifier" element={<PublicEstablishmentCatalog />} />
        <Route path="/cultura/fremix-producoes" element={<FremixProductionsPage />} />
        <Route path="/fremix-producoes" element={<FremixProductionsPage />} />
        <Route path="/autora/dorinha-barroso" element={<DorinhaAuthorStore />} />
        <Route path="/dorinha-barroso" element={<DorinhaAuthorStore />} />
        <Route path="/lojista" element={<MerchantOnboardingPage />} />
        <Route path="/loja/:merchantId" element={<MerchantOnlineStoreRoute />} />
        <Route path="/painel-lojista" element={<MerchantDashboard />} />
        <Route path="/painel-lojista/autora" element={<AuthorCatalogEditor />} />
        <Route path="/painel-lojista/gestao" element={<MerchantManagementCenter />} />
        <Route path="/painel-lojista/catalogo" element={<MerchantCatalogStudio />} />
        <Route path="/painel-lojista/configurar-negocio" element={<MerchantBusinessSetup />} />
        <Route path="/painel-lojista/vendas-online" element={<MerchantOnlineSalesControl />} />
        <Route path="/meus-pedidos" element={<CustomerOrders />} />
        <Route path="/integracoes/mercadopago/callback" element={<MercadoPagoCallback />} />
        <Route path="/admin/plataforma" element={<PlatformAdminDashboard />} />
        <Route path="/admin/comercios" element={<AdminMerchantManagement />} />
        <Route path="/colaborar" element={<CollaboratePage />} />
        <Route path="/fale-conosco" element={<ContactPage />} />
        <Route path="/farmacias" element={<PharmaciesPage />} />
        <Route path="*" element={<PrecoCertoApp />} />
      </Routes>
    </BrowserRouter>
  );
}
