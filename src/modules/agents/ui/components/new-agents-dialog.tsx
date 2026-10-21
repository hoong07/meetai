import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "./agent-form";
interface NewAgentsDialogProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
}

export const NewAgentsDialog = ({open , onOpenChange} : NewAgentsDialogProps) => {
    return (
        <ResponsiveDialog 
            title="新增Agent"
            description="创建Agent"
            open={open}
            onOpenChange={onOpenChange}>
            <AgentForm 
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}/>
    </ResponsiveDialog>
    )
}