import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "./login";
import { DashboardCards } from "../dashboard-cards";
import { PageLayout } from "../page-layout";

export const Dashboard = () => {
    const navigate = useNavigate();

    // execute only on mount: if user is not logged in redirect to signin
    useEffect(() => {
        if(!isLoggedIn())
            navigate('/');
    }, []);

    const Content = () => {
        return (
            // <Typography variant='h5' color={'#878fa0'}>
            //     Link an account to learn detailed insights about your transactions and balances, powered by Plaid.
            //   </Typography>
            <DashboardCards />
        )
    }

    return <PageLayout page={'Dashboard'} isLinked={true} ContentComponent={Content} />
};