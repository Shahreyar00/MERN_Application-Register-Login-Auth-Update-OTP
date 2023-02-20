import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthorizeUser, ProtectRoute } from "./middleware/auth";
import { Username, Reset, Register, Recovery, Profile, Password, PageNotFound } from "./components";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Username />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/password",
        element: <ProtectRoute><Password /></ProtectRoute>
    },
    {
        path: "/profile",
        element: <AuthorizeUser><Profile /></AuthorizeUser>
    },
    {
        path: "/recovery",
        element: <Recovery />
    },
    {
        path: "/reset",
        element: <Reset />
    },
    {
        path: "*",
        element: <PageNotFound />
    },
])

const App = () => {
    return (
        <main>
            <RouterProvider router={router} />
        </main>
    )
}

export default App