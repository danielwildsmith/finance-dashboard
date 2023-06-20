import React from 'react';
import { DataGrid, GridColDef, GridRowModel, GridComparatorFn, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport, GridValueGetterParams, GridRowParams } from '@mui/x-data-grid';
import { TransactionRow } from './pages/transactions';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import axios from 'axios';
import { Typography, Box } from '@mui/material';

const amountComparator : GridComparatorFn<String> = (a1, a2): number =>
    parseFloat(a1.slice(1)) - parseFloat(a2.slice(1)); 

const CustomToolbar = () => {
    return (
        <GridToolbarContainer sx={{justifyContent: 'space-between'}}>
            <Typography variant='h6' noWrap sx={{color: '#139eca'}}>Accountant</Typography>
            <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center'}}>
                <GridToolbarFilterButton sx={{color: '#139eca'}}/>
                <GridToolbarExport sx={{color: '#139eca'}}/>
            </div>
        </GridToolbarContainer>
    );
}

export const BasicEditingGrid = ( { data }: { data: TransactionRow[] | null } ) => {
    const [snackbar, setSnackbar] = React.useState<Pick<
    AlertProps,
    'children' | 'severity'
  > | null>(null);

    const handleCloseSnackbar = () => setSnackbar(null);

    const processRowUpdate = async (newRow : GridRowModel, oldRow : GridRowModel) => {
       if(newRow.note !== oldRow.note) {
            try {
                const response = await axios.put(`http://localhost:8000/api/transactions/note/${newRow.id}`, { note: newRow.note, category: newRow.category });
                setSnackbar({ children: 'Note successfully saved', severity: 'success' });
                return response.data;
            } 
            catch (error) {
                console.error("Error while saving note: " + error);
              }
        }
        else if(newRow.verified !== oldRow.verified) {
            try {
                const response = await axios.put(`http://localhost:8000/api/transactions/verify/${newRow.id}`, { verified: newRow.verified });
                
                const message = newRow.verified ? 'Transaction successfully verified' : 'Transaction successfully unverified';
                setSnackbar({ children: `${message}`, severity: 'success' });
                return response.data;
            } 
            catch (error) {
                console.error("Error while saving note: " + error);
            }
        }
        return oldRow;
    }
    
    const handleProcessRowUpdateError = (error : Error) => {
        setSnackbar({ children: error.message, severity: 'error' });
    }

    const renderRow = (params: GridRowParams) => {
        return <div style={{ borderBottom: '1px solid #878fa0' }}>{params.row.name}</div>;
      };
    
    if (data) {
        return (
            <>
                <div style={{ height: '44vh', width: '100%', padding: 12, backgroundColor: '#343a46',}}>
                    <DataGrid
                        rows={data}
                        columns={columns}
                        hideFooter
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={handleProcessRowUpdateError}
                        initialState={{
                            sorting: {
                            sortModel: [{ field: 'date', sort: 'desc' }],
                            },
                        }}
                        slots={{ toolbar: CustomToolbar }}
                        sx={{ m: 0, color: '#878fa0', border: 0, '& .MuiDataGrid-toolbarContainer': { margin: 0, padding: 0 },
                        '& .MuiDataGrid-main': { padding: 0 },}}
                    />
                </div>

                {!!snackbar && (
                    <Snackbar
                        open
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        onClose={handleCloseSnackbar}
                        autoHideDuration={2000}
                    >
                        <Alert {...snackbar} onClose={handleCloseSnackbar} />
                    </Snackbar>
                )}
            </>
        );
      }
      return <></>;      
}

const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', editable: false },
    { field: 'name', headerName: 'Name', flex: 0.70, minWidth: 180, editable: false },
    { field: 'amount', headerName: 'Amount', type: 'number', editable: false, sortComparator: amountComparator, valueGetter: (params: GridValueGetterParams) => `$${(params.row.amount).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}` },
    { field: 'category', headerName: 'Category', flex: 0.3, minWidth: 130, editable: false },
    { field: 'note', headerName: 'Note', flex: 0.6, minWidth: 220, editable: true },
    { field: 'verified', headerName: 'Verified', type: 'boolean', sortable: false, filterable: false, editable: true, cellClassName: 'grid-verified' }
];
