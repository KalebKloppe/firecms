import React from "react";

import equal from "react-fast-compare"

import { CellRendererParams, VirtualTableColumn } from "./VirtualTableProps";

type VirtualTableCellProps<T extends any> = {
    dataKey: string;
    column: VirtualTableColumn;
    columns: VirtualTableColumn[];
    rowData: any;
    cellData: any;
    rowIndex: any;
    columnIndex: number;
    cellRenderer: React.ComponentType<CellRendererParams<T>>;
};

export const VirtualTableCell = React.memo<VirtualTableCellProps<any>>(
    function VirtualTableCell<T extends any>(props: VirtualTableCellProps<T>) {
        return props.rowData && <props.cellRenderer
            rowData={props.rowData}
            rowIndex={props.rowIndex}
            isScrolling={false}
            column={props.column}
            columns={props.columns}
            columnIndex={props.columnIndex}
            width={props.column.width}/>
    },
    (a, b) => {
        return equal(a, b);
    }
);
