import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../login";
import { CategoryDistributionChart } from "../transactions/distribution-chart";
import { Grid } from "@mui/material";
import { CategorySpendingsGraph } from "./spendings-graph";
import axios from 'axios';
import { GetUsername } from '../login';
import { MonthlyTotalGraph } from "./monthly-total-graph";

export interface CategoryData {
    category: string,
    month: string,
    previous_month: string,
    amount: number,
    previous_month_amount: number
}

export interface MonthlyTotalData {
    month: string,
    FOOD_AND_DRINK: number,
    GENERAL_MERCHANDISE: number,
    TRANSPORTATION: number,
    RENT_AND_UTILITIES: number,
    TRAVEL: number,
    TRANSFER_OUT: number,
    GENERAL_SERVICES: number,
    OTHER: number
}

export const CATEGORIES = [
    'FOOD_AND_DRINK', 'GENERAL_MERCHANDISE', 'TRANSPORTATION', 'RENT_AND_UTILITIES', 'TRAVEL', 'TRANSFER_OUT', 'GENERAL_SERVICES', 'OTHER'
];
export const COLORS_MAP : { [key: string]: string } = {
    FOOD_AND_DRINK: '#0088FE',
    GENERAL_MERCHANDISE: '#00C49F',
    TRANSPORTATION: '#FFBB28',
    RENT_AND_UTILITIES: '#227878',
    TRAVEL: '#FF8042',
    TRANSFER_OUT: '#9C27B0',
    GENERAL_SERVICES: '#E5005E',
    OTHER: '#555555'
};

export const Transactions = () => {
    const date = new Date();
    const [month, setMonth] = useState(date.getMonth());
    const [year, setYear] = useState(date.getFullYear());
    const [categoryData, setCategoryData] = useState<CategoryData[] | null>(null);
    const [monthlyTotalsData, setMonthlyTotalsData] = useState<MonthlyTotalData[] | null>(null);

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

    const getMonthlyTotalsData = () => {
        let formattedMonth = month.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
        axios.get(`http://localhost:8000/api/transactions/totals/${GetUsername()}/${year}/${formattedMonth}`)
        .then(res => {
            setMonthlyTotalsData(res.data);
        })
        .catch(error => {
            console.error(error);
        });
    }

    // execute only on mount: if user is not logged in redirect to signin
    useEffect(() => {
        if(!isLoggedIn())
            navigate('/');

            getCategoryData();
            getMonthlyTotalsData();
    }, []);

    return (
        <>
            <p>Welcome to your transactions page.</p>
            <Grid container spacing={0}>
                <Grid item xs={12} sm={4} lg={3} height={'50vh'}>
                    <CategoryDistributionChart data={categoryData} />
                </Grid>
                <Grid item xs={12} sm={6} lg={5} height={'50vh'}>
                    <CategorySpendingsGraph data={categoryData} />
                </Grid>
                <Grid item xs={12} sm={4} lg={3} height={'50vh'}>
                    <MonthlyTotalGraph data={monthlyTotalsData} />
                </Grid>
            </Grid>
        </>
    )
};