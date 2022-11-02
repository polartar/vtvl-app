import DownloadIcon from 'public/icons/download.svg';
import PrintIcon from 'public/icons/print.svg';
import { usePagination, useTable } from 'react-table';

const Table = ({ columns, data, pagination = false, exports = false }: any) => {
  // Table features
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
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    usePagination
  );

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
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell: any) => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {exports || pagination ? (
        <div className="pt-5 border-t border-gray-200 row-center justify-between gap-6 p-3.5">
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
              <button className="py-1 h-8 text-sm" onClick={() => previousPage()} disabled={!canPreviousPage}>
                Previous
              </button>
              Page {pageIndex + 1} of {pageCount}
              <button className="py-1 h-8 text-sm" onClick={() => nextPage()} disabled={!canNextPage}>
                Next
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Table;
