import React, { useState } from "react";
import "./App.scss";
import { ThemeProvider } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Paper from "@material-ui/core/Paper";
import DataUsageIcon from "@material-ui/icons/DataUsage";
import SettingsIcon from "@material-ui/icons/Settings";
import theme from "./theme";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { SvgIconTypeMap } from "@material-ui/core";
import InventoryPage from "./containers/InventoryPage";
import SettingPage from "./containers/SettingPage";

function App() {
  const [selectedTab, setSelectedTab] = useState<any>(tabs[0].title);

  return (
    <ThemeProvider theme={theme}>
      <div className="tab-page">
        {tabs.map((tab, key) => {
          if (tab.component) {
            return <tab.component key={key} show={tab.title === selectedTab} />;
          }
          return null;
        })}
      </div>
      <Paper elevation={10}>
        <BottomNavigation
          value={selectedTab}
          onChange={(e, value) => {
            setSelectedTab(value as number);
          }}
          showLabels
          className="bottom-nav"
        >
          {tabs.map(({ title, icon: Icon }, key) => (
            <BottomNavigationAction key={key} label={title} icon={<Icon />} value={title} />
          ))}
        </BottomNavigation>
      </Paper>
    </ThemeProvider>
  );
}

const tabs: { title: string; icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>; component: React.ComponentClass<any> | React.FC<any> | null }[] = [
  { title: "재고관리", icon: DataUsageIcon, component: InventoryPage },
  { title: "설정", icon: SettingsIcon, component: SettingPage },
];

export default App;
