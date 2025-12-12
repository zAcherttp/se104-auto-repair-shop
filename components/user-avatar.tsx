import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserAvatar() {
  return (
    <Avatar>
      <Image
        src="https://github.com/shadcn.png"
        alt="@shadcn"
        width={40}
        height={40}
        className="rounded-full"
      />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}
