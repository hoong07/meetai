import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";

import { useRouter } from "next/navigation";
interface NewMeetingsDialogProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
}

export const NewMeetingsDialog = ({open , onOpenChange} : NewMeetingsDialogProps) => {
    const router = useRouter()

    return (
        <ResponsiveDialog 
            title="新增会议"
            description="创建新的Meeting"
            open={open}
            onOpenChange={onOpenChange}>
            <MeetingForm 
                onSuccess={(id) => {
                    onOpenChange(false)
                    router.push(`/meetings/${id}`)
                    }}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    )
}