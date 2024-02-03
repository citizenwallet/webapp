import { cn } from "@/utils";

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
import { Button } from "@/components/ui/button"
import {
  AltIconButton,
  IconButton,
  OutlinedIconButton,
  PrimaryButton,
  OutlinedPrimaryButton,
} from "@/components/buttons";
import {
  CurrencyAmountLarge,
  CurrencySymbolLarge,
  SubtleSubtitle,
  Text,
  TextBold,
} from "@/components/text";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown";
import {
  Column,
  Expanded,
  Row,
  VerticalSpacer,
  HorizontalSpacer,
  Divider,
} from "@/components/base";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SendForm from "@/components/SendForm";

const SendAction = ({ variant, address, config }: { variant: string, address: string, config: Config }) => {

  let trigger;

  // let amount_uint256 = getBigIntAmountFromString(searchParams.get("amount") || "", config.token.decimals);

  if (variant === "horizontal") {
    trigger = <>
      <PrimaryButton>
        <Row>
        <Text fontSize="0.8rem">Send</Text>
          <HorizontalSpacer $spacing={0.5} />
          <FontAwesomeIcon icon={faArrowUp} size="xs" />
        </Row>
      </PrimaryButton>
    </>
  } else {
    trigger = <>
      <IconButton icon={faArrowUp} size="2x" $shadow />
      <VerticalSpacer $spacing={0.5} />
      <TextBold>Send</TextBold>
    </>
  }

  let erc681Address = `ethereum:${config.token.address}@${config.node.chainId}/transfer?address=${address}`;
  // if (amount_uint256) {
  //   erc681Address += `&uint256=${amount_uint256}`;
  // }
  console.log("erc681Address", erc681Address);

  return (
    <>
    <Drawer>
      <DrawerTrigger>
        {trigger}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Send</DrawerTitle>
          {/* <DrawerDescription>This action cannot be undone.</DrawerDescription> */}
        </DrawerHeader>

        <div className="px-4">
          <SendForm />
        </div>

        <DrawerFooter>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
      </Drawer>
    </>
  );
}

export default SendAction;