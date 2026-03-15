import { DataTable } from "@/components/Backoffice/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TypographyH1 } from "@/components/ui/typography";
import { usersMockData } from "@/lib/mockData";
import { User } from "@/types/user.type";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useState } from "react";

export default function Users() {
    const [selected, setSelected] = useState("active");
    
    const topRightActions = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1">
            <Button variant={selected === "active" ? 'selected' : 'notSelected'} onClick={() => setSelected("active")}>{t("active")}</Button>
            <Button variant={selected === "inactive" ? 'selected' : 'notSelected'} onClick={() => setSelected("inactive")}>{t("inactive")}</Button>
        </div>
    )

    const columns: ColumnDef<User>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "full_name",
            header: "Full Name",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "role",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Role
                        <LucideArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
    ];

    const data: User[] = usersMockData;

    return (
        <>
            <header className="px-4 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <TypographyH1>{t("users")}</TypographyH1>
                {topRightActions}
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 border m-4 rounded-lg">
                <div className="p-2 flex items-center justify-between gap-2">
                    <Button>+ Add User</Button>
                    <Button variant="destructive">Supprimer</Button>
                </div>
                <DataTable columns={columns} data={data} />
            </div>
        </>
    )
}