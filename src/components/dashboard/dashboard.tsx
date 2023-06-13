import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../login";
import { Grid } from "@mui/material";
import { DashboardCards } from "./cards";

export const Dashboard = () => {
    const navigate = useNavigate();

    // execute only on mount: if user is not logged in redirect to signin
    useEffect(() => {
        if(!isLoggedIn())
            navigate('/');
    }, []);

    return (
        <>
            <DashboardCards />
        </>
    )
};