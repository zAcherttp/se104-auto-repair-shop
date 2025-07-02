"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit } from "lucide-react";
import { VehicleRegistration } from "./columns";
import { UpdateDialog } from "@/components/dialogs/update-repair-order";

interface ActionsProps {
  vehicleRegistration: VehicleRegistration;
}

export function Actions({ vehicleRegistration }: ActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <UpdateDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="mr-2 h-4 w-4" />
              Update
            </DropdownMenuItem>
          }
          data={vehicleRegistration}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
