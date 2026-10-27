import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { MeetingGetOne } from "../types";

interface UpdateMeetingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialValues?: MeetingGetOne
}

export const UpdateMeetingsDialog= ({open , onOpenChange, initialValues} : UpdateMeetingsDialogProps) => {

    return (
        <ResponsiveDialog 
            title="编辑会议"
            description="编辑你的Meeting"
            open={open}
            onOpenChange={onOpenChange}>
            <MeetingForm 
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
                initialValues={initialValues}
            />
        </ResponsiveDialog>
    )
}