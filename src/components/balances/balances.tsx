import React, { useState, useEffect } from "react";
import { Totals } from "./totals";
import { Grid } from "@mui/material";
import axios from "axios";
import { GetUsername, isLoggedIn } from "../login";
import { useNavigate } from "react-router-dom";

export interface TypedBalance {
    type: string,
    total: number
}

export const Balances = () => {
    const [currentBalances, setCurrentBalances] = useState<TypedBalance[] | null>(null);
    const [netWorth, setNetWorth] = useState(0);

    const navigate = useNavigate();

    const getCurrentBalances = () => {
        axios.get(`http://localhost:8000/api/balances/current/${GetUsername()}`)
        .then(res => {
            setCurrentBalances(res.data);
        })
        .catch(error => {
            console.error(error);
        });
    }

    const getNetWorth = () => {
        let total = 0;
        currentBalances?.forEach(balance => {
            total += balance.total;
        })

        setNetWorth(total);
    }

    useEffect(() => {
        if(!isLoggedIn())
            navigate('/');

            const fetchData = async () => {
                await getCurrentBalances();
              };

            fetchData();
            getNetWorth();
    }, []);

    console.log(netWorth);
    return (
        <Grid container spacing={0}>
                <Grid item xs={12} sm={4} lg={3} height={'50vh'}>
                    <Totals data={currentBalances} />
                </Grid>
        </Grid>
    )
}