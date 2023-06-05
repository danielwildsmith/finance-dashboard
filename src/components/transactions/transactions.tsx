import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../login";
import { ExampleChart } from "../transactions/distribution-chart";
import { Grid } from "@mui/material";

export const Transactions = () => {
    const date = new Date();
    const [month, setMonth] = useState(date.getMonth());
    const [year, setYear] = useState(date.getFullYear());

    const navigate = useNavigate();

    // execute only on mount: if user is not logged in redirect to signin
    useEffect(() => {
        if(!isLoggedIn())
            navigate('/');
    }, []);

    return (
        <>
            <p>Welcome to your transactions page.</p>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4} lg={4} height={'50vh'}>
                    <ExampleChart month={month} year={year}/>
                </Grid>
            </Grid>
        </>
    )
};