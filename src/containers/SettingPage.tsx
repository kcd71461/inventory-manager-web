import { observer } from "mobx-react";
import React, { ReactElement, useState } from "react";
import InventoryTable from "../components/InventoryTable";
import localStorage, { Product } from "../localStorage";
import update from "immutability-helper";
import { Button, ButtonGroup } from "@material-ui/core";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import { Paper } from "@material-ui/core";

interface Props {
  show: boolean;
}

export default observer(function SettingPage({ show }: Props): ReactElement | null {
  const [data, setData] = useState<Product[]>(localStorage.products.map((item) => item));

  if (!show) {
    return null;
  }

  return (
    <div className="page">
      <div className="table-wrapper">
        <InventoryTable
          getRowId={(data) => data.id.toString()}
          columns={[
            { Header: "이름", accessor: "name", editType: "string", columnAlign: "center" },
            { Header: "업체", accessor: "company", editType: "string", columnAlign: "center" },
            { Header: "단위", accessor: "unit", editType: "string", columnAlign: "center" },
          ]}
          data={data}
          onChange={(data) => setData(data)}
        />
      </div>
      <ButtonGroup className="buttons" color="primary" variant="contained">
        <Button
          startIcon={<RotateLeftIcon />}
          onClick={() => {
            if (window.confirm("마지막 저장된 내용으로 초기화합니다.\n초기화 하시겠습니까?")) {
              setData(localStorage.products.map((item) => item));
            }
          }}
        >
          초기화
        </Button>
        <Button
          startIcon={<PlaylistAddIcon />}
          onClick={() => {
            setData(update(data, { $push: [{ id: Date.now(), name: "", company: "", show: true, unit: "" }] }));
          }}
        >
          행 추가
        </Button>
        <Button startIcon={<SaveAltIcon />} color="primary" onClick={() => localStorage.saveProducts(data)}>
          저장
        </Button>
      </ButtonGroup>
    </div>
  );
});
