import React from 'react';
import { DataGrid, GridColDef, GridRowModel, GridComparatorFn, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport, GridValueGetterParams } from '@mui/x-data-grid';
import { TransactionRow } from './transactions';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import axios from 'axios';

const amountComparator : GridComparatorFn<String> = (a1, a2): number =>
    parseFloat(a1.slice(1)) - parseFloat(a2.slice(1)); 

const CustomToolbar = () => {
    return (
        <GridToolbarContainer>
            <GridToolbarFilterButton />
            <GridToolbarExport />
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

    if(data) {
        return (
            <div style={{ height: 300, width: '100%' }}>
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
            />


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
            </div>
        );
    }
    return <></>;
}

const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', editable: false },
    { field: 'name', headerName: 'Name', flex: 0.75, editable: false },
    { field: 'amount', headerName: 'Amount', type: 'number', editable: false, sortComparator: amountComparator, valueGetter: (params: GridValueGetterParams) => `$${params.row.amount}` },
    { field: 'category', headerName: 'Category', flex: 0.3, editable: false },
    { field: 'note', headerName: 'Note', flex: 0.6, editable: true },
    { field: 'verified', headerName: 'Verified', type: 'boolean', sortable: false, filterable: false, editable: true }
];
