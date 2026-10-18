"use client"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

import { CreditCardIcon , LogOutIcon } from "lucide-react"
import { ChevronDownIcon , ChevronUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { 
    DropdownMenu , 
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar , AvatarImage} from "@/components/ui/avatar"
import { generateDashAvatar } from "@/components/generated-dash-avatar"


export const DashboardUserButton = () => {
    const router = useRouter()
    const isMobile = useIsMobile()

    const [isOpen , setIsOpen] = useState(false)
    const { data , isPending } = authClient.useSession()
    if (isPending || !data?.user) {
        return null
    }

    const onLogOut = () => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => router.push('/sign-in')
            }
        })
    }

    const svg = generateDashAvatar(data.user.name)

    if (isMobile) {
        return (
            <Drawer>
                <DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between 
            bg-white/5 hover:bg-white/10 overflow-hidden">
                    {data.user.image ? (
                    <Avatar>
                        <AvatarImage src={data.user.image} />
                    </Avatar>
                ) : (
                    <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} alt="avatar" 
                    className="size-9 mr-3 rounded-full" />
                )}

                <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
                    <p className="text-sm truncate w-full">
                        {data.user.name}
                    </p>
                    <p className="text-xs truncate w-full">
                        {data.user.email}
                    </p>
                </div>
                { isOpen ? (<ChevronDownIcon className="size-4 shrink-0"></ChevronDownIcon>)
                 : (<ChevronUpIcon className="size-4 shrink-0"></ChevronUpIcon>)}   
                </DrawerTrigger>

                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{data.user.name}</DrawerTitle>
                        <DrawerDescription>{data.user.email}</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button 
                        variant={"outline"}
                        onClick={() => {}} >
                        账单
                        <CreditCardIcon className="size-4" />
                        </Button>
                        <Button
                        variant={"outline"}
                        onClick={onLogOut}>
                        退出
                    <   LogOutIcon className="size-4" />
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between 
            bg-white/5 hover:bg-white/10 overflow-hidden" >
                {data.user.image ? (
                    <Avatar>
                        <AvatarImage src={data.user.image} />
                    </Avatar>
                ) : (
                    <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} alt="avatar" 
                    className="size-9 mr-3 rounded-full" />
                )}

                <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
                    <p className="text-sm truncate w-full">
                        {data.user.name}
                    </p>
                    <p className="text-xs truncate w-full">
                        {data.user.email}
                    </p>
                </div>
                { isOpen ? (<ChevronDownIcon className="size-4 shrink-0"></ChevronDownIcon>)
                 : (<ChevronUpIcon className="size-4 shrink-0"></ChevronUpIcon>)}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" side="right" className="w-72">
                <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                        <span className="font-medium truncate ">{data.user.name}</span>
                        <span className="font-light truncate">{data.user.email}</span>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                    账单
                    <CreditCardIcon className="size-4" />
                </DropdownMenuItem>
                <DropdownMenuItem 
                onClick={onLogOut}
                className="cursor-pointer flex items-center justify-between">
                    退出
                    <LogOutIcon className="size-4" />
                </DropdownMenuItem>
            </DropdownMenuContent>

        </DropdownMenu>
    )
}