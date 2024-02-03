import { MenuItemType } from "@/types/plugins.types"
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers"

export const MenuItem: MenuItemType = {
  label: "Dashboard",
  icon: faUsers,
  frameSrc: "https://dashboard.citizenwallet.xyz/gt.celo"
}

const plugin = {
  MenuItem
};

export default plugin;