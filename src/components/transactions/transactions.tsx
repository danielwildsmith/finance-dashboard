import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../login";
import { ExampleChart } from "../transactions/distribution-chart";
import { Grid } from "@mui/material";
import { SpendingsGraph } from "./spendings-graph";
import axios from 'axios';
import { GetUsername } from '../login';

export interface CategoryData {
    name: string,
    value: number
}

export interface MonthlyCategoryData {
    category: string,
    selected_month: string,
    selected_month_amount: number, 
    previous_month: string,
    previous_month_amount: number,
    penultimate_month: string,
    penultimate_month_amount: number,
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#E5005E', '#9C27B0', '#555555', '#0000A0'];

export const Transactions = () => {
    const date = new Date();
    const [month, setMonth] = useState(date.getMonth());
    const [year, setYear] = useState(date.getFullYear());
    const [categoryData, setCategoryData] = useState<CategoryData[] | null>(null);
    const [monthlyCategoryData, setMontlyCategoryData] = useState<MonthlyCategoryData[] | null>(null);

    const navigate = useNavigate();

    const getCategoryData = () => {
        let formattedMonth = month.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
        axios.get(`http://localhost:8000/api/transactions/categorized/${GetUsername()}/${year}/${formattedMonth}`)
        .then(res => {
            setCategoryData(res.data);
        })
        .catch(error => {
            console.error(error);
        });
    };

    const getMonthlyCategoryData = () => {
        let formattedMonth = month.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
        axios.get(`http://localhost:8000/api/transactions/monthly/${GetUsername()}/${year}/${formattedMonth}`)
        .then(res => {
            setMontlyCategoryData(res.data);
        })
        .catch(error => {
            console.error(error);
        });
    };

    // execute only on mount: if user is not logged in redirect to signin
    useEffect(() => {
        if(!isLoggedIn())
            navigate('/');

            getCategoryData();
            getMonthlyCategoryData();
    }, []);

    return (
        <>
            <p>Welcome to your transactions page.</p>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4} lg={4} height={'50vh'}>
                    <ExampleChart month={month} year={year} data={categoryData} colors={COLORS} />
                </Grid>
                <Grid item xs={12} sm={6} lg={6} height={'50vh'}>
                    <SpendingsGraph data={monthlyCategoryData} colors={COLORS} />
                </Grid>
            </Grid>
        </>
    )
};