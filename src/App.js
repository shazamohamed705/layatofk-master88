import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
const Login = lazy(() => import("./components/Login/Login"));
const Register = lazy(() => import("./components/Register/Register"));
const Blog = lazy(() => import("./components/Blog/Blog"));
const BlogDetails = lazy(() => import("./components/Blog/BlogDetails"));
const Products = lazy(() => import("./components/Products/Products"));
const Categories = lazy(() => import("./components/Categories/Categories"));
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
      { path: "product-details", element: <ProductDetails /> },
      { path: "advertising", element: <Advertising /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:id", element: <BlogDetails /> },
      { path: "products", element: <Products /> },
      { path: "categories", element: <Categories /> },
      // { path: "*", element: <NotFound /> }, // Uncomment if using NotFound
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-[100vh]">
            <span className="loader my-8"></span>
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
