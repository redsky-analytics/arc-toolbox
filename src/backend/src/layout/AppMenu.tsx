import { Menu } from "react-admin";
import SettingsIcon from "@mui/icons-material/Settings";

export const AppMenu = () => (
    <Menu>
        <Menu.ResourceItems />
        <Menu.Item 
            to={"/docs"}
            primaryText="Docs"
            leftIcon={<SettingsIcon />}
        />
    </Menu>
)