import Button from '@components/atoms/Button/Button';
import BatchIcon from 'public/icons/batch-transactions.svg';
import DownloadIcon from 'public/icons/download.svg';
import PrintIcon from 'public/icons/print.svg';
import React, { InputHTMLAttributes, MutableRefObject, Ref, forwardRef, useEffect, useRef } from 'react';
import { usePagination, useRowSelect, useTable } from 'react-table';

interface IndeterminateCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}
const IndeterminateCheckbox = forwardRef(
  ({ indeterminate = false, ...rest }: IndeterminateCheckboxProps, ref: Ref<HTMLInputElement>) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
      (resolvedRef as MutableRefObject<HTMLInputElement>).current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);

const Table = ({
  // Selectable and Batch options are always working together
  selectable = false,
  batchOptions = {
    label: 'Batch transactions',
    onBatchProcessClick: () => {}
  },
  // Default datas
  columns,
  data,
  pagination = false,
  exports = false,
  getTrProps = () => {}
}: any) => {
  // Table features -- initially has pagination and default column datas
  let tableFeatures = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    usePagination
  );

  // Add selectable rows feature
  if (selectable) {
    tableFeatures = useTable(
      {
        columns,
        data,
        initialState: { pageIndex: 0, pageSize: 10 }
      },
      usePagination,
      useRowSelect,
      (hooks) => {
        hooks.visibleColumns.push((columns) => [
          // Let's make a column for selection
          {
            id: 'selection',
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <div>
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              </div>
            ),
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }) => (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
              </div>
            )
          },
          ...columns
        ]);
      }
    );
  }
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    selectedFlatRows,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = tableFeatures;

  const handleBatchProcess = () => {
    console.log('Raw selected rows', selectedFlatRows);
    const actualData = selectedFlatRows.map((row) => ({ ...row.original }));
    batchOptions.onBatchProcessClick(actualData);
  };

  return (
    <div className="panel p-0">
      <div className="overflow-x-auto">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row: any, i: number) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} {...getTrProps(row)}>
                  {row.cells.map((cell: any) => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {exports || pagination || selectable ? (
        <div className="pt-5 border-t border-gray-200 row-center justify-between gap-6 p-3.5 h-[4.1875rem]">
          {exports ? (
            <div className="row-center gap-3">
              <button type="button" className="row-center primary py-1 px-3 gap-1 h-8 text-sm text-medium">
                <PrintIcon className="w-6 h-6" />
                Print
              </button>
              <button type="button" className="row-center primary py-1 px-3 gap-1 h-8 text-sm text-medium">
                <DownloadIcon className="w-6 h-6" />
                CSV
              </button>
            </div>
          ) : null}
          {pagination ? (
            <div className="row-center gap-3 text-sm">
              {pageCount > 1 ? (
                <button className="py-1 h-8 text-sm" onClick={() => previousPage()} disabled={!canPreviousPage}>
                  Previous
                </button>
              ) : null}
              <span className="block py-1 h-8">
                Page {pageIndex + 1} of {pageCount}
              </span>
              {pageCount > 1 ? (
                <button className="py-1 h-8 text-sm" onClick={() => nextPage()} disabled={!canNextPage}>
                  Next
                </button>
              ) : null}
            </div>
          ) : null}
          {selectable ? (
            <Button className="secondary py-1 px-3" disabled={!selectedFlatRows.length} onClick={handleBatchProcess}>
              <span className="row-center">
                <BatchIcon className="w-4 h-4" />
                {batchOptions.label}
              </span>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Table;
