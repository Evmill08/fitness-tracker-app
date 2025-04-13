import React from "react";
import {Navigate, Outlet} from 'react-router-dom';
import HeaderComponent from "./Header";

const AuthLayout = () => {
    const isLoggedIn = localStorage.getItem('currentUser') !== null;

    if (!isLoggedIn) {
        return <Navigate to="/"/>
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <HeaderComponent/>
            <Outlet/>
        </div>
    );
};

export default AuthLayout;