import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "./agent-form";
import { AgentGetOne } from "../../types";
interface UpdateAgentsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialValues: AgentGetOne
}

export const UpdateAgentsDialog = ({open , onOpenChange , initialValues} : UpdateAgentsDialogProps) => {
    return (
        <ResponsiveDialog 
            title="编辑Agent"
            description="编辑Agent"
            open={open}
            onOpenChange={onOpenChange}>
            <AgentForm 
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
            initialValues={initialValues}
            />
        </ResponsiveDialog>
    )
}