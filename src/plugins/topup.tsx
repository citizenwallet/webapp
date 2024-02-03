import { MenuItemType } from "@/types/plugins.types"
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"

export const MenuItem: MenuItemType = {
  label: "Top up",
  icon: faPlus,
  frameSrc: "https://topup.citizenwallet.xyz/gt.celo"
}

const plugin = {
  MenuItem
};

export default plugin;