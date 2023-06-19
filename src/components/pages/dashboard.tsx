import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetUsername, isAccountLinked, isLoggedIn } from "./auth";
import { DashboardCards } from "../dashboard-cards";
import { PageLayout } from "../page-layout";

export const Dashboard = () => {
    const navigate = useNavigate();
    const [accountLinked, setAccountLinked] = useState(false);
    
    // execute only on mount: if user is not logged in redirect to signin
    useEffect(() => {
        const authenticate = () => {
            if (!isLoggedIn()) {
              navigate('/');
            } else {
                const linked = isAccountLinked();
                setAccountLinked(linked);
            }
        };
        
        authenticate();
    }, []);

    const Content = () => {
        return (
            <DashboardCards accountLinked={accountLinked || GetUsername() === 'sample'} />
        )
    }

    return <PageLayout page={'Dashboard'} isLinked={accountLinked || GetUsername() === 'sample'} ContentComponent={Content} />
};