import { Key, Mail } from "lucide-react";
import { Config } from "@citizenwallet/sdk";
import { cn } from "@/lib/utils";
import {AuthMethod} from '@/hooks/signin-method'
import { IncognitoIcon } from "@/components/icons";

interface AuthBadgeProps {
    config: Config
  authMethod: AuthMethod;
}

export default function AuthBadge({ authMethod, config }: AuthBadgeProps) {
  const primaryColor = config.community.theme?.primary ?? "#000000";

  const style = {
    backgroundColor: `${primaryColor}1A`, // 10% opacity
    borderColor: `${primaryColor}33`, // 20% opacity
    color: primaryColor,
  };

  const getAuthIcon = () => {
    switch (authMethod) {
      case "email":
        return <Mail className="h-6 w-6" />;
      case "passkey":
        return <Key className="h-6 w-6" />;
      case "local":
        return <IncognitoIcon className="h-6 w-6" />;
      default:
        return <Mail className="h-6 w-6" />;
    }
  };

  return (
       <div 
      style={style}
      className={cn(
        "absolute -bottom-2 -right-2 rounded-full h-10 w-10",
        "flex items-center justify-center",
        "ring-2 ring-background",
        "transition-colors",
        "hover:bg-opacity-20"
      )}
    >
      {getAuthIcon()}
    </div>
  
  );
}
