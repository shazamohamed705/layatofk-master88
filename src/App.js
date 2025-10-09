import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import "./index.css";

// Create QueryClient instance
const queryClient = new QueryClient();

// Lazy-loaded components
const Layout = lazy(() => import("./components/Layout/Layout"));
const Home = lazy(() => import("./components/Home/Home"));
const Privacy = lazy(() => import("./components/Privacy/Privacy"));
const About = lazy(() => import("./components/About/About"));
const Contact = lazy(() => import("./components/Contact/Contact"));
const ProductDetails = lazy(() => import("./components/ProductDetails/ProductDetails"));
const Advertising = lazy(() => import("./components/Advertising/Advertising"));
const NewAddCat = lazy(() => import("./components/NewAdd/NewAddCat"));
const NewAddShare = lazy(() => import("./components/NewAdd/NewAddShare"));
const NewAddCer = lazy(() => import("./components/NewAdd/NewAddCer"));
const BusinessPackages = lazy(() => import("./components/Packages/BusinessPackages"));
const ShareAdds = lazy(() => import("./components/Share/ShareAdds"));
const CarPages = lazy(() => import("./components/Share/CarPages"));
const ModelsPage = lazy(() => import("./components/Share/ModelsPage"));
const BrandsPage = lazy(() => import("./components/Share/BrandsPage"));
const Packages = lazy(() => import("./components/Packages/Packages"));
const AllPackages = lazy(() => import("./components/Packages/AllPackages"));
const Wallet = lazy(() => import("./components/Packages/Wallet"));
const Login = lazy(() => import("./components/Login/Login"));
const Register = lazy(() => import("./components/Register/Register"));
const Products = lazy(() => import("./components/Products/Products"));
const Categories = lazy(() => import("./components/Categories/Categories"));
const ProfilePages = lazy(() => import("./components/ProfilePages/ProfilePages"));
const ChangePassword = lazy(() => import("./components/ChangePassword/ChangePassword"));
const MySubscriptions = lazy(() => import("./components/MySubscriptions/MySubscriptions"));
const Bills = lazy(() => import("./components/Bills/Bills"));
const Verification = lazy(() => import("./components/Verification/Verification"));
const Chat = lazy(() => import("./components/Chat/Chat"));
const ChatRoom = lazy(() => import("./components/Chat/ChatRoom"));
// const NotFound = lazy(() => import("./components/NotFound/NotFound")); // Uncomment if used

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/", element: <Home /> },
      { path: "privacy", element: <Privacy /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "product-details/:id", element: <ProductDetails /> },
      { path: "product-details", element: <ProductDetails /> },
      { path: "advertising", element: <Advertising /> },
      { path: "new-add-cat", element: <NewAddCat /> },
      { path: "new-add-share", element: <NewAddShare /> },
      { path: "new-add-cer", element: <NewAddCer /> },
      { path: "business-packages", element: <BusinessPackages /> },
      { path: "share-ad", element: <ShareAdds /> },
      { path: "share-car", element: <CarPages /> },
      { path: "share-car-details", element: <ModelsPage /> },
      { path: "share-car-final", element: <BrandsPage /> },
      { path: "all-packages", element: <AllPackages /> },
      { path: "packages", element: <Packages /> },
      { path: "wallet", element: <Wallet /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "products", element: <Products /> },
      { path: "products/:subCatId", element: <Products /> },
      { path: "categories", element: <Categories /> },
      { path: "profile", element: <ProfilePages /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "my-subscriptions", element: <MySubscriptions /> },
      { path: "bills", element: <Bills /> },
      { path: "verify-account", element: <Verification /> },
      { path: "chat", element: <Chat /> },
      { path: "chat/:chatId", element: <ChatRoom /> },
      // { path: "*", element: <NotFound /> }, // Uncomment if using NotFound
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <AppSettingsProvider>
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-[100vh]">
                <span className="loader my-8"></span>
              </div>
            }
          >
            <RouterProvider router={router} />
          </Suspense>
        </AppSettingsProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  );
}

export default App;
