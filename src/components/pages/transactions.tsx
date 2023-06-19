import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAccountLinked, isLoggedIn } from "./auth";
import { CategoryDistributionChart } from "../charts/transactions-category-distribution";
import { Grid, Typography } from "@mui/material";
import { CategorySpendingsGraph } from "../charts/transactions-spendings";
import axios from 'axios';
import { GetUsername } from './auth';
import { MonthlyTotalGraph } from "../charts/transactions-totals";
import { BasicEditingGrid } from "../transactions-table";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { PageLayout } from "../page-layout";
import { styled } from '@mui/material/styles';
import SquareIcon from '@mui/icons-material/Square';

export interface CategoryData {
    category: string,
    month: string,
    previous_month: string,
    amount: number,
    previous_month_amount: number
}

export interface MonthlyTotalData {
  month: string;
  'Food And Drink': number;
  'General Merchandise': number;
  'Transportation': number;
  'Rent And Utilities': number;
  'Travel': number;
  'Transfer Out': number;
  'General Services': number;
  'Other': number;
  total: number
  [key: string]: number | string;
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

const LegendContainer = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginTop: 22,
    marginBottom: 6,
});

const LegendList = styled('ul')({
    listStyle: 'none',
    flexWrap: 'wrap',
    padding: 0,
    margin: 0,
    display: 'flex',
    gap: 12,
    maxWidth: '100%',
    justifyContent: 'center',
    alignItems: 'center'
})

const LegendItem = styled('li')({
    display: 'list-item',
    alignItems: 'center',
    fontSize: 14,
    padding: 0,
    margin: 0,
    flex: '0 0 auto'
})

export const Transactions = () => {
    const date = new Date();
    const [month, setMonth] = useState((date.getMonth() + 1).toString());
    const [year, setYear] = useState(date.getFullYear().toString());
    const [categoryData, setCategoryData] = useState<CategoryData[] | null>(null);
    const [monthlyTotalsData, setMonthlyTotalsData] = useState<MonthlyTotalData[] | null>(null);
    const [transactionRows, setTransactionRows] = useState<TransactionRow[] | null>(null);
    const [accountLinked, setAccountLinked] = useState(false);

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
        const authenticate = () => {
            if (!isLoggedIn()) {
              navigate('/');
            } else {
                const linked = isAccountLinked();
                setAccountLinked(linked);
                if(!linked)
                    navigate('/dashboard');
            }
        };

        const fetchData = async () => {
            await getCategoryData();
            await getMonthlyTotalsData();
            await getTransactionRows();
          };

        authenticate();
        fetchData();
    }, [year, month]);

    const DateSelectionBox = ({ title, options }: {title: string, options: string[] }) => {
        const selectedValue = title === 'Month' ? month.padStart(2, "0") : year;
        return (
            <Box sx={{ width: 65 }}>
                <FormControl variant="standard" fullWidth sx={{margin: 0}}>
                    <InputLabel sx={{color: '#878fa0'}}>{title}</InputLabel>
                        <Select
                            value={selectedValue}
                            label={title}
                            onChange={title === 'Month' ? handleMonthChange : handleYearChange}
                            
                            sx={{color: '#f6f7f9', ':before': { borderBottomColor: '#878fa0'}, '.MuiSelect-icon': {color: '#f6f7f9'}}}
                        >
                            {options.map((option) => (
                                <MenuItem value={option} key={option} >
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                </FormControl>
            </Box>
        )
    }

    const CustomLegend = () => {
        return (
            <LegendContainer>
                <LegendList>
                    {CATEGORIES.map((category, index) => (
                        <LegendItem key={index} style={{ color: COLORS_MAP[category] }}>
                            <SquareIcon sx={{color: COLORS_MAP[category], fontSize: 8 }} />
                            {category}
                        </LegendItem>
                    ))}   
                </LegendList>
            </LegendContainer>
        )
    }

    const Content = () => {
        return (
            <>
                <Grid container spacing={3} sx={{marginBottom: 0.75, width: 'fit-content'}}>
                    <Grid item>
                        <DateSelectionBox title={'Year'} options={yearOptions} />
                    </Grid>
                    <Grid item>
                        <DateSelectionBox title={'Month'} options={monthOptions} />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={12} lg={2.5} height={'33vh'}>
                        <Typography variant='h6' noWrap sx={{color: '#878fa0', width: 'fit-content'}}>Distribution</Typography>
                        <CategoryDistributionChart data={categoryData} />
                    </Grid>
                    <Grid item xs={12} sm={12} lg={6} height={'33vh'}>
                        <Typography variant='h6' noWrap sx={{color: '#878fa0'}}>Spendings</Typography>
                        <CategorySpendingsGraph data={categoryData} />
                    </Grid>
                    <Grid item xs={12} sm={12} lg={3.5} height={'33vh'}>
                        <Typography variant='h6' noWrap sx={{color: '#878fa0'}}>Monthly Totals</Typography>
                        <MonthlyTotalGraph data={monthlyTotalsData} />
                    </Grid>
                </Grid>

                <CustomLegend />
                <BasicEditingGrid data={transactionRows} />
            </>
        )
    }

    return <PageLayout page={'Transactions'} isLinked={accountLinked} ContentComponent={Content} />
};