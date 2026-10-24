import { Loader2Icon } from "lucide-react";

interface Props {
    title: string;
    description: string
};

export const LoadingState = ({
    title,
    description
}: Props) => {
    return (
        <div className="px-8 py-4 flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
                <Loader2Icon className="size-6 animate-spin text-primary" />
                <div className="flex flex-col gap-y-4">
                    <h6 className="text-lg font-medium text-center">{title}</h6>
                    <p className="text-sm text-center">{description}</p>
                </div>
            </div>
        </div>
    )
}