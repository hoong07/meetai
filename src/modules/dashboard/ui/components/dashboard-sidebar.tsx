"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import { BotIcon, StarIcon, VideoIcon } from "lucide-react"
import { DashboardUserButton } from "./dashboard-userbutton"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

//配置 侧边栏的内容
const firstSection = [
    {
        icon: VideoIcon,
        label: "Meeting",
        href: "/meeting",
    },
    {
        icon: BotIcon,
        label: "Agent",
        href: "/agent"
    }
]

const secondSection = [
    {
        icon: StarIcon,
        label: "Upgrade",
        href: "/upgrade"
    }
]


const DashboardSidebar = () => {

    const pathname = usePathname()


    return (
        <Sidebar>
            <SidebarHeader className="text-shadow-sidebar-accent-foreground">
                <Link href="/" className="flex items-center gap-2 px-2 pt-2">
                    <Image src="/logo.svg" height={34} width={34} alt="Meet.Ai" />
                    <p>Meet.AI</p>
                </Link>
            </SidebarHeader>
            {/* 分割线 */}
            <div className="px-4 py-2">
                <Separator className="opacity-10 text-[#5D6B68]" />
            </div>

            {/* sidebar 主内容 */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                firstSection.map(item => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton 
                                            asChild
                                            className={cn(
                                            "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                            pathname === item.href && "bg-linear-to-r/oklch border-[#5D6B68]"
                                            )}
                                            isActive={pathname === item.href}
                                            >
                                            <Link href={item.href}>
                                                <item.icon className="size-5" />
                                                <span className="text-sm font-medium tracking-tight">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* 分界线 */}
                <div className="px-4 py-2">
                    <Separator className="opacity-10 text-[#5D6B68]" />
                </div>

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                secondSection.map(item => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton 
                                            asChild
                                            className={cn(
                                            "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                            pathname === item.href && "bg-linear-to-r/oklch border-[#5D6B68]"
                                            )}
                                            isActive={pathname === item.href}
                                            >
                                            <Link href={item.href}>
                                                <item.icon className="size-5" />
                                                <span className="text-sm font-medium tracking-tight">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* 底部 个人信息区域 */}
            <SidebarFooter>
                <DashboardUserButton></DashboardUserButton>
            </SidebarFooter>
        </Sidebar>
    )
}

export default DashboardSidebar