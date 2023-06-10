import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../login";
import { CategoryDistributionChart } from "../transactions/distribution-chart";
import { Grid } from "@mui/material";
import { CategorySpendingsGraph } from "./spendings-graph";
import axios from 'axios';
import { GetUsername } from '../login';
import { MonthlyTotalGraph } from "./monthly-total-graph";
import { BasicEditingGrid } from "./table";

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

export interface TransactionRow {
    id: string,
    date: string,
    name: string,
    category: string,
    amount: string,
    note: string,
    verified: boolean
}

export const CATEGORIES = [
    'Food And Drink', 'General Merchandise', 'Transportation', 'Rent And Utilities', 'Travel', 'Transfer Out', 'General Services', 'Other'
];

export const COLORS_MAP : { [key: string]: string } = {
    'Food And Drink': '#0088FE',
    'General Merchandise': '#00C49F',
    'Transportation': '#FFBB28',
    'Rent And Utilities': '#227878',
    'Travel': '#FF8042',
    'Transfer Out': '#9C27B0',
    'General Services': '#E5005E',
    'Other': '#555555'
};

export const Transactions = () => {
    const date = new Date();
    const [month, setMonth] = useState(date.getMonth());
    const [year, setYear] = useState(date.getFullYear());
    const [categoryData, setCategoryData] = useState<CategoryData[] | null>(null);
    const [monthlyTotalsData, setMonthlyTotalsData] = useState<MonthlyTotalData[] | null>(null);
    const [transactionRows, setTransactionRows] = useState<TransactionRow[] | null>(null);

    const navigate = useNavigate();
    let formattedMonth = month.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

    const getCategoryData = () => {
        axios.get(`http://localhost:8000/api/transactions/categorized/${GetUsername()}/${year}/${formattedMonth}`)
        .then(res => {
            setCategoryData(res.data);
        })
        .catch(error => {
            console.error(error);
        });
    };

    const getMonthlyTotalsData = () => {
        axios.get(`http://localhost:8000/api/transactions/totals/${GetUsername()}/${year}/${formattedMonth}`)
        .then(res => {
            setMonthlyTotalsData(res.data);
        })
        .catch(error => {
            console.error(error);
        });
    }

    const getTransactionRows = () => {
        axios.get(`http://localhost:8000/api/transactions/${GetUsername()}/${year}/${formattedMonth}`)
        .then(res => {
            setTransactionRows(res.data);
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
            getTransactionRows();
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
            <BasicEditingGrid data={transactionRows} />
        </>
    )
};