import { createTheme } from "@material-ui/core";

const theme = createTheme({
  typography: {
    fontFamily: "Noto Sans KR, Roboto, sans-serif",
  },
  overrides: {
    MuiTableCell: {
      sizeSmall: {
        padding: "3px",
      },
      stickyHeader: {
        padding: "6px",
        fontSize: "1.1rem",
      },
    },
    MuiOutlinedInput: {
      input: {
        paddingLeft: 5,
        paddingRight: 5,
      },
      inputMarginDense: {
        paddingTop: 8,
        paddingBottom: 8,
      },
      adornedEnd: {
        paddingRight: 5,
      },
    },
    MuiInputAdornment: {
      positionEnd: {
        marginLeft: 4,
      },
    },
  },
});

export default theme;
