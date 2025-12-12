"use client";

import { EditIcon, TrashIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteEmployee, getEmployees } from "@/app/actions/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Employee } from "@/types/settings";
import { Label } from "../ui/label";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";

export default function EmployeesTab() {
  const t = useTranslations("settings.employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await getEmployees();
      if (response.success && response.data) {
        setEmployees(response.data as Employee[]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await deleteEmployee(employeeToDelete.id);
      if (response.success) {
        toast.success("Employee deleted successfully");
        setDeleteDialogOpen(false);
        setEmployeeToDelete(null);
        await fetchEmployees();
      } else {
        toast.error(response.error || "Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-primary border-b-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="mb-2 flex justify-between">
            <Label className="self-start pl-2">{t("title")}</Label>
            <Button className="h-8" onClick={() => setAddDialogOpen(true)}>
              {t("addButton")}
            </Button>
          </div>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.role")}</TableHead>
                <TableHead>{t("columns.created")}</TableHead>
                <TableHead>{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                      <Label className="font-medium">
                        {employee.full_name || "N/A"}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        employee.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.created_at
                      ? new Date(employee.created_at).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddEmployeeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleDialogClose}
      />

      <EditEmployeeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        employee={selectedEmployee}
        onSuccess={handleDialogClose}
      />

      <DeleteEmployeeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteEmployee}
        employeeName={employeeToDelete?.full_name || undefined}
        loading={deleteLoading}
      />
    </>
  );
}
