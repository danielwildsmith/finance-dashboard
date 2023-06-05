import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../login";
import { ExampleChart } from "../transactions/distribution-chart";
import { Grid } from "@mui/material";

export const Dashboard = () => {
    const navigate = useNavigate();

    // execute only on mount: if user is not logged in redirect to signin
    useEffect(() => {
        if(!isLoggedIn())
            navigate('/');
    }, []);

    return (
        <>
            <p>Welcome to your dashboard.</p>
        </>
    )
};