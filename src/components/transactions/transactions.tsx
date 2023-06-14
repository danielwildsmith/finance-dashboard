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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { PageLayout } from "../../page-layout";

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
    amount: number,
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
    const [month, setMonth] = useState(date.getMonth().toString());
    const [year, setYear] = useState(date.getFullYear().toString());
    const [categoryData, setCategoryData] = useState<CategoryData[] | null>(null);
    const [monthlyTotalsData, setMonthlyTotalsData] = useState<MonthlyTotalData[] | null>(null);
    const [transactionRows, setTransactionRows] = useState<TransactionRow[] | null>(null);

    const navigate = useNavigate();
    let formattedMonth = month.length === 1 ? month.padStart(2, "0") : month;

    const handleYearChange = (event: SelectChangeEvent) => {
        setYear(event.target.value as string)
    };

    const handleMonthChange = (event: SelectChangeEvent) => {
        setMonth(event.target.value as string)
    };

    const startYear = date.getFullYear() - 10
    const yearOptions : string[] = [];
    for (let i = date.getFullYear(); i >= startYear; i--)
        yearOptions.push(i.toString());
    const monthOptions = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

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

    // if user is not logged in redirect to signin. when signed in, execute each time month/year is changed
    useEffect(() => {
        if(!isLoggedIn())
            navigate('/');

            const fetchData = async () => {
                await getCategoryData();
                await getMonthlyTotalsData();
                await getTransactionRows();
              };

            fetchData();
    }, [year, month]);

    const Content = () => {
        return (
            <>
                <Box sx={{ width: 220 }}>
                    <FormControl fullWidth>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={year}
                            label="Year"
                            onChange={handleYearChange}
                            >
                            {yearOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ width: 220 }}>
                    <FormControl fullWidth>
                        <InputLabel>Month</InputLabel>
                        <Select
                            value={monthOptions[parseInt(month) - 1]}
                            label="Month"
                            onChange={handleMonthChange}
                            >
                            {monthOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
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
    }

    return <PageLayout page={'Transactions'} isLinked={true} ContentComponent={Content} />
};