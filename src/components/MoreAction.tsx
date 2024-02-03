import {
  AltIconButton,
  IconButton,
  OutlinedIconButton,
  PrimaryButton,
  OutlinedPrimaryButton,
} from "@/components/buttons"
import { IconDefinition, IconName } from "@fortawesome/fontawesome-svg-core"
import { cn } from "@/utils"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export const MoreAction = ({
  icon,
  label,
}: {
  icon: IconDefinition
  label: string
}) => (
  <div className="py-3 w-full flex justify-center">
    <Drawer>
      <DrawerTrigger>
        <div className="w-72 flex items-center gap-4 mx-auto">
          <OutlinedIconButton icon={icon} size="sm" />
          <div className="justify-start items-center gap-4 flex">
            <div className="self-stretch flex-col justify-start items-start inline-flex">
              <div className="self-stretch text-indigo-950 font-semibold font-['Inter'] leading-snug  text-md">
                {label}
              </div>
            </div>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{label}</DrawerTitle>
          <DrawerDescription>Choose an action to perform</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  </div>
)
