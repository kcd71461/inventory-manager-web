import { FormControl, IconButton, InputAdornment, OutlinedInput, TextField } from "@material-ui/core";
import React, { ReactElement } from "react";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import "./NumberInput.scss";
interface Props {
  id?: string;
  value: number;
  onChange?: (newNumber: number) => void;
  allowNegative?: boolean;
  unit?: string;
}

export default function NumberInput({ id, value, onChange, allowNegative = false, unit }: Props): ReactElement {
  return (
    <div className="number-input">
      <IconButton color="primary" size="small" disabled={!allowNegative && (value <= 0 || isNaN(value))} onClick={() => onChange?.(value - 1)}>
        <RemoveIcon />
      </IconButton>
      <FormControl fullWidth size="small">
        <OutlinedInput
          inputProps={{ className: "text-align-center" }}
          id={id}
          value={value}
          type="number"
          onChange={(e) => {
            onChange?.(parseInt(e.target.value));
          }}
          fullWidth
          onBlur={() => {
            if (isNaN(value)) {
              onChange?.(0);
            }
          }}
          endAdornment={unit ? <InputAdornment position="end">{unit}</InputAdornment> : undefined}
        />
      </FormControl>
      {/* <TextField
        inputProps={{ className: "text-align-center" }}
        id={id}
        value={value}
        type="number"
        size="small"
        variant="outlined"
        onChange={(e) => {
          onChange?.(parseInt(e.target.value));
        }}
        fullWidth
        onBlur={() => {
          if (isNaN(value)) {
            onChange?.(0);
          }
        }}
      /> */}
      <IconButton color="primary" size="small" onClick={() => onChange?.(value + 1)}>
        <AddIcon />
      </IconButton>
    </div>
  );
}
