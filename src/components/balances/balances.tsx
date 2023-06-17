import React, { useState, useEffect } from "react";
import { Totals } from "./totals";
import { Box, Grid } from "@mui/material";
import axios from "axios";
import { GetUsername, isLoggedIn } from "../login";
import { useNavigate } from "react-router-dom";
import { NetWorthTimeGraph } from "./time-graph";
import { PageLayout } from "../../page-layout";

export interface TypedBalance {
    type: string,
    total: number
}

export interface DatedNetWorth {
    date: string,
    Total: number
}

export const Balances = () => {
    const [currentBalances, setCurrentBalances] = useState<TypedBalance[] | null>(null);
    const [recentNetWorthData, setRecentNetWorthData] = useState<DatedNetWorth[] | null>(null);

    const navigate = useNavigate();

    const getCurrentBalances = () => {
        axios.get(`http://localhost:8000/api/balances/current/${GetUsername()}`)
        .then(res => {
            setCurrentBalances(res.data);
        })
        .catch(error => {
            console.error(error);
        });
    };

    const getRecentNetWorthData = () => {
        axios.get(`http://localhost:8000/api/balances/history/${GetUsername()}`)
        .then(res => {
            setRecentNetWorthData(res.data);
        })
        .catch(error => {
            console.error(error);
        });
    };

    useEffect(() => {
        if(!isLoggedIn())
            navigate('/');

            const fetchData = async () => {
                await getCurrentBalances();
                await getRecentNetWorthData();
              };

            fetchData();
    }, []);

    const Content = () => {
        return (
            <>
                <Totals data={currentBalances} />
                <Box sx={{height: '43vh', marginLeft: '3vw', marginRight: '3vw'}}>
                    <NetWorthTimeGraph data={recentNetWorthData} />
                </Box>
            </>
        )
    }
    
    return <PageLayout page={'Balances'} isLinked={true} ContentComponent={Content} />
}