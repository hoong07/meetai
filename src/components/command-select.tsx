import { ReactNode , useState } from "react";
import { ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

import {
     CommandEmpty,
     CommandInput,
     CommandItem,
     CommandList,
     CommandResponsiveDialog
 } from "./ui/command";
import { MeetingStatus } from "@/modules/meetings/types";

 interface Props {
    options: Array<{
        id: string | MeetingStatus,
        value: string | MeetingStatus,
        children: ReactNode
    }>
    onSelect: (value: string) => void
    onSearch?: (value: string) => void
    value: string
    placeholder?: string
    isSearchable?: boolean
    className?: string
 }

 export const CommandSelect = ({
    options,
    onSelect,
    onSearch,
    value,
    placeholder = "请选择一个Agent作为你的会议成员",
    className
 }: Props) => {
    const [ open , setOpen ] = useState(false)
    const selectedOption = options.find((option) => option.value === value)

    const handleOpenChange = (open: boolean) => {
        onSearch?.("")
        setOpen(open)
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                type="button"
                variant="outline"
                className={cn(
                    "h-9 justify-between font-normal px-2",
                    !selectedOption && "text-muted-foreground",
                    className,
                )}
            >
                <div>
                    {selectedOption?.children ?? placeholder}
                </div>
                <ChevronsUpDownIcon />
            </Button>
            <CommandResponsiveDialog
                shouldFilter={!onSearch}
                // command默认的本地查找 or 自己写的trpc查找
                open={open}
                onOpenChange={handleOpenChange}
            >
                <CommandInput placeholder="搜索..." onValueChange={onSearch} />
                <CommandList>
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            未找到相应选项
                        </span>
                    </CommandEmpty>
                    {options.map((option) => (
                        <CommandItem
                         key={option.id}
                         onSelect={() => {
                            onSelect(option.value)
                            setOpen(false)
                         }}
                         >
                            {option.children}
                        </CommandItem>
                    ))}
                </CommandList>
            </CommandResponsiveDialog>
        </>
    )
 }