import Image from "next/image";

interface Props {
    title: string;
    description: string;
    image?: string;
};

export const EmptyState = ({
    title,
    description,
    image = "/empty.svg"
}: Props) => {
    return (
        <div className="px-8 py-4 flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
                <Image src={image} alt="Empty" width={240} height={240} />
                <div className="flex flex-col gap-y-6 text-center max-w-md mx-auto">
                    <h6 className="text-lg font-medium">{title}</h6>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    )
}