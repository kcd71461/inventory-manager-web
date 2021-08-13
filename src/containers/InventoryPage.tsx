import { observer } from "mobx-react";
import React, { ReactElement, useEffect, useState } from "react";
import InventoryTable from "../components/InventoryTable";
import localStorage, { ProductInventory } from "../localStorage";
import update from "immutability-helper";
import { Button, ButtonGroup, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, ListSubheader, Modal, Snackbar } from "@material-ui/core";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import ShareIcon from "@material-ui/icons/Share";
import AssignmentIcon from "@material-ui/icons/Assignment";
import "./InventoryPage.scss";
import { Paper } from "@material-ui/core";
import copy from "copy-to-clipboard";
import CloseIcon from "@material-ui/icons/Close";

interface Props {
  show: boolean;
}

interface RowData extends ProductInventory {
  name: string;
}

export default observer(function InventoryPage({ show }: Props): ReactElement | null {
  const [data, setData] = useState<RowData[]>(
    localStorage.productInventories.map<RowData>((item) => ({ ...item, name: `${item.product.name}/${item.product.company}` }))
  );

  const [clipboardModalOpen, setClipboardModalOpen] = useState(false);
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);

  useEffect(() => {
    setData(localStorage.productInventories.map<RowData>((item) => ({ ...item, name: `${item.product.name}/${item.product.company}` })));
    return () => {};
  }, [localStorage.products]);

  if (!show) {
    return null;
  }

  return (
    <div className="inventory-page page">
      <div className="table-wrapper">
        <InventoryTable
          getRowId={(data) => data.product.id.toString()}
          columns={[
            { Header: "이름/업체", accessor: "name", columnAlign: "center" },
            {
              Header: "재고수량",
              accessor: "remainCount",
              editType: "number",
              columnAlign: "center",
              getUnit: (cell) => {
                return cell.row.original.product.unit;
              },
            },
            {
              Header: "필요수량",
              accessor: "requiredCount",
              editType: "number",
              columnAlign: "center",
              getUnit: (cell) => {
                return cell.row.original.product.unit;
              },
            },
          ]}
          data={data}
          onChange={(data) => {
            setData(data);
            localStorage.saveProductInventories(data);
          }}
          allowReordering={false}
          allowRowDelete={false}
        />
      </div>
      <ButtonGroup className="buttons" color="primary" variant="contained">
        <Button
          startIcon={<RotateLeftIcon />}
          onClick={() => {
            if (window.confirm("재고/필요 수량이 0으로 초기화됩니다.\n초기화하시겠습니까?")) {
              const newData = data.map((item) => item);
              for (let row of newData) {
                row.remainCount = 0;
                row.requiredCount = 0;
              }
              setData(newData);
              localStorage.saveProductInventories(newData);
            }
          }}
        >
          초기화
        </Button>
        <Button
          startIcon={<ShareIcon />}
          onClick={() => {
            setClipboardModalOpen(true);
          }}
        >
          클립보드
        </Button>
      </ButtonGroup>
      <Modal
        open={clipboardModalOpen}
        onClose={() => {
          setClipboardModalOpen(false);
        }}
      >
        <Paper id="clipboard-modal">
          <CompanyClipboardList
            data={data}
            onCloseRequest={(showSnackbar) => {
              if (showSnackbar) {
                setCopySnackbarOpen(true);
              }
              setClipboardModalOpen(false);
            }}
          />
        </Paper>
      </Modal>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={copySnackbarOpen}
        autoHideDuration={2000}
        onClose={() => setCopySnackbarOpen(false)}
        message="복사되었습니다!"
        action={
          <React.Fragment>
            <IconButton color="inherit" onClick={() => setCopySnackbarOpen(false)}>
              <CloseIcon />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
});

function CompanyClipboardList({ data, onCloseRequest }: { data: ProductInventory[]; onCloseRequest: (showSnackbar: boolean) => void }) {
  const companies = data.reduce<{ name: string; inventories: ProductInventory[] }[]>((prevValue, current) => {
    let companyInventoreis = prevValue.find((item) => item.name === current.product.company);
    if (!companyInventoreis) {
      companyInventoreis = { name: current.product.company, inventories: [] };
      prevValue.push(companyInventoreis);
    }

    if (current.requiredCount > 0) {
      companyInventoreis.inventories.push(current);
    }

    return prevValue;
  }, []);

  return (
    <List subheader={<ListSubheader component="div">클립보드 복사</ListSubheader>}>
      {companies.map((company, key) => {
        return (
          <ListItem
            key={key}
            button
            disabled={company.inventories.length === 0}
            onClick={() => {
              exportText(company.inventories, { clipboardCopy: true });
              onCloseRequest(true);
            }}
          >
            <ListItemText
              primary={company.name}
              secondary={company.inventories.map((item) => `${item.product.name}(${item.requiredCount}${item.product.unit || ""})`).join(",")}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="share"
                onClick={() => {
                  exportText(company.inventories, { share: true });
                }}
              >
                <ShareIcon />
              </IconButton>
              {/* <IconButton
                edge="end"
                aria-label="copy"
                onClick={() => {
                  exportText(company.inventories, { clipboardCopy: true });
                  onCloseRequest(true);
                }}
              >
                <AssignmentIcon />
              </IconButton> */}
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
}

function exportText(inventories: ProductInventory[], { share, clipboardCopy }: { share?: boolean; clipboardCopy?: boolean }) {
  const shareText = inventories.map((item) => `${item.product.name}\t${item.requiredCount}${item.product.unit || ""}`).join("\r\n");
  if (clipboardCopy) {
    copy(shareText);
  }
  if (share) {
    if (window.navigator?.share) {
      window.navigator?.share({ text: shareText });
    }
  }
}
