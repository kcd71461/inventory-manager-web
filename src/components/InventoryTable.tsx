import React from "react";
import { Cell, Column, Row, useTable } from "react-table";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch";
import update from "immutability-helper";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton, Table, TableRow, TableHead, TableBody, TableCell, TextField, FormControl, Input, InputAdornment, OutlinedInput } from "@material-ui/core";
import NumberInput from "./NumberInput";
import clsx from "clsx";

export type InventoryTableColumn<T extends object> = {
  editType?: "string" | "select" | "toggle" | "number";
  columnAlign?: "center" | "right";
  getUnit?: (cell: Cell<T, any>) => string;
} & Column<T>;

interface Props<T extends object> {
  className?: string;
  columns: InventoryTableColumn<T>[];
  data: T[];
  onChange?: (newData: T[]) => void;
  getRowId: (data: T) => string;
  allowRowDelete?: boolean;
  allowReordering?: boolean;
}

const InventoryTable = <T extends object>({ className, columns, data, getRowId, onChange, allowRowDelete = true, allowReordering = true }: Props<T>) => {
  // const [records, setRecords] = React.useState<T[]>(data);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<T>({
    data,
    columns,
    getRowId,
  });

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const dragRecord = data[dragIndex];
    onChange?.(
      update(data, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRecord],
        ],
      })
    );
  };

  const tableProps = getTableProps();
  return (
    <DndProvider options={HTML5toTouch}>
      <Table {...tableProps} size="small" stickyHeader className={clsx(tableProps.className, className)}>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {allowReordering && <TableCell width={10} align="center"></TableCell>}
              {headerGroup.headers.map((column) => (
                <TableCell {...column.getHeaderProps()} align={(column as InventoryTableColumn<T>).columnAlign}>
                  {column.render("Header")}
                </TableCell>
              ))}
              {allowRowDelete && <TableCell width={10} align="center"></TableCell>}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            return (
              <InventoryTableRow
                index={index}
                row={row}
                moveRow={moveRow}
                {...row.getRowProps()}
                allowReordering={allowReordering}
                allowRowDelete={allowRowDelete}
                onCellChange={(accessor, value) => {
                  onChange?.(update(data as any, { [index]: { [accessor]: { $set: value } } }));
                }}
                onDeleteRow={() => onChange?.(update(data, { $splice: [[index, 1]] }))}
              />
            );
          })}
        </TableBody>
      </Table>
    </DndProvider>
  );
};

const DND_ITEM_TYPE = "row";

const InventoryTableRow = <T extends object>({
  row,
  index,
  moveRow,
  onCellChange,
  allowReordering,
  allowRowDelete,
  onDeleteRow,
}: {
  row: Row<T>;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  onCellChange?: (accessor: keyof T, value: any) => void;
  allowReordering?: boolean;
  allowRowDelete?: boolean;
  onDeleteRow?: () => void;
}) => {
  const dropRef = React.useRef<HTMLTableRowElement>(null);
  const dragRef = React.useRef<HTMLTableCellElement>(null);

  const [, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    hover(item: any, monitor: any) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = dropRef!.current!.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_ITEM_TYPE,
    item: { type: DND_ITEM_TYPE, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  preview(drop(dropRef));
  drag(dragRef);
  return (
    <TableRow ref={dropRef} style={{ opacity }}>
      {allowReordering && (
        <TableCell ref={dragRef}>
          <IconButton size="small">
            <DragHandleIcon />
          </IconButton>
        </TableCell>
      )}
      {row.cells.map((cell) => {
        const column = cell.column as InventoryTableColumn<T>;
        return (
          <TableCell {...cell.getCellProps()}>
            <TableEditCell
              cell={cell}
              onChange={(data) => {
                onCellChange?.(column.id as keyof T, data);
              }}
            />
          </TableCell>
        );
      })}
      {allowRowDelete && (
        <TableCell>
          <IconButton size="small" color="secondary" onClick={onDeleteRow}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
};

const TableEditCell = <T extends object>({ cell, onChange }: { cell: Cell<T, any>; onChange?: (data: any) => void }) => {
  const column = cell.column as InventoryTableColumn<T>;
  const { value } = cell;
  const unit = column.getUnit ? column.getUnit(cell) : undefined;
  switch (column.editType) {
    case "string":
      return (
        <FormControl fullWidth size="small">
          <OutlinedInput
            fullWidth
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            endAdornment={unit ? <InputAdornment position="end">{unit}</InputAdornment> : undefined}
          />
        </FormControl>
      );
    case "number":
      return <NumberInput value={value} onChange={(newValue) => onChange?.(newValue)} unit={unit} />;
    default:
      return <>{cell.render("Cell")}</>;
  }
};

export default InventoryTable;
