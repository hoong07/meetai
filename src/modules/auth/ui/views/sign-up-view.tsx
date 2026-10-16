"use client";

import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FaGithub , FaGoogle } from "react-icons/fa"

import { Card , CardContent} from '@/components/ui/card';
import { 
        Form,
        FormItem,
        FormLabel,
        FormControl,
        FormMessage,
        FormField, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    name: z.string().min(1, {
        message: "请输入用户名",
    }),
    email: z.email({
        message: "请输入有效的邮箱地址",
    }),
    password: z.string().min(8, {
        message: "请输入密码",
    }),
    passwordConfirm: z.string().min(8, {
        message: "请再次输入密码",
    }),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "两次输入的密码不一致",
    path:["passwordConfirm"], //错误的时候 path是错误的指向
});

const SignUpView = () => {
    const router = useRouter()
    const [error , setError] = useState<string | null>(null)
    const [pending , setPending] = useState(false)

    //  社交媒体验证登陆
    const onSocail = (provider: "github" | "google") => {
        setError(null)
        setPending(true)

        authClient.signIn.social(
            {
                provider,
                callbackURL: "/",
            }
            , {
            onError: (error) => {
                setError(error.error.message)
                setPending(false)
            },
            onSuccess: () => {
                setPending(false)
                router.push('/')
            }
        })
    }

    // useform 和zodResolver结合使用，进行表单验证 -> 自动接管 -> 无需手写onchange...
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),// zod 校验规则写入form
        defaultValues: {
            name: "",
            email: "",
            password: "",
            passwordConfirm: "",
        }, // 设置默认值
    })
    // 处理表单逻辑
    const onSubmit = (data: z.infer<typeof formSchema>) => {
        setError(null)
        setPending(true)

        authClient.signUp.email({
            name: data.name,
            email: data.email,
            password: data.password, //只需要传一次密码给后端 confirm密码是前端验证使用的
            callbackURL: "/"
        },
        {
            onError: (error) => {
                setError(error.error.message)
                setPending(false)
            },
            onSuccess: () => {
                setPending(false)
            }
        }
    )
    }

  return (
    <div className="flex flex-col gap-6 md:p-10">
        <Card className="p-0 overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
                <Form {...form}>
                    {/* 提供原生form 的浏览器能力 /回车提交 */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4 md:p-8"> 

                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-2xl font-bold">
                                Welcome to Meet.AI
                            </h1>
                            <p className="text-sm text-muted-foreground text-balance">
                                注册账号
                            </p>
                        </div>
                        {/* 用户名验证 */}
                        <div>
                            <FormField
                                control={form.control}
                                name="name" // 字段名 绑定zodschema验证
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>用户名</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="张三"
                                                type="text" //浏览器识别 -> 手机端弹出密码键盘 / 浏览器自带原生校验
                                                {...field} //受控绑定 如onblur onChange value等
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* 邮箱验证 */}
                        <div>
                            <FormField
                                control={form.control}
                                name="email" // 字段名 绑定zodschema验证
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>邮箱</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="m@example.com"
                                                type="email" //浏览器识别 -> 手机端弹出邮箱键盘 / 浏览器自带原生校验
                                                {...field} //受控绑定 如onblur onChange value等
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* 密码验证 */}
                        <div>
                            <FormField
                                control={form.control}
                                name="password" // 字段名 绑定zodschema验证
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>密码</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="********"
                                                type="password" //浏览器识别 -> 手机端弹出密码键盘 / 浏览器自带原生校验
                                                {...field} //受控绑定 如onblur onChange value等
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* 确认密码验证 */}
                        <div>
                            <FormField
                                control={form.control}
                                name="passwordConfirm" // 字段名 绑定zodschema验证
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>密码</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="********"
                                                type="password" //浏览器识别 -> 手机端弹出密码键盘 / 浏览器自带原生校验
                                                {...field} //受控绑定 如onblur onChange value等
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                            {/* 错误提示 */}
                        <div>
                            { error && (
                                <Alert className="bg-destructive/10 border-none">
                                <OctagonAlertIcon className="h-4 w-4 text-destructive" />
                                <AlertTitle>{error}</AlertTitle>
                            </Alert>
                            )}
                        </div>
                        
                        <Button 
                            disabled={pending}
                            type="submit"
                            className="w-full">
                            注册
                        </Button>
                        {/* 底部分割线 */}
                        <div className="relative text-center overflow-hidden text-sm">
                            <div className="after:absolute after:top-1/2 after:left-0 after:w-full after:h-px
                                after:bg-border after:z-0 after:translate-y-1/2">
                                <span className="relative z-10 px-2 bg-card text-muted-foreground">
                                    或者使用其他社交账号登录
                                </span>
                            </div>
                        </div>

                        {/* 社交账号登录 */}
                        <div className="grid grid-cols-2 gap-6">
                            <Button
                                onClick={() => onSocail("github")}
                                variant="outline" //描边按钮
                                className="w-full"
                                type="button"
                            >
                                <FaGithub></FaGithub>
                            </Button>
                            <Button
                                onClick={() => onSocail("google")}
                                variant="outline"
                                className="w-full"
                                type="button"
                            >
                                <FaGoogle></FaGoogle>
                            </Button>
                        </div>
                        {/* 注册跳转 */}
                        <div className="text-center text-sm ">
                            如果你已经有了账号，<Link href="/sign-in" className="text-primary underline underline-offset-4">
                                点击登陆
                            </Link>
                        </div>

                    </form>
                </Form>
                {/* 信息 */}
                <div className="flex flex-col items-center justify-center p-6 text-center bg-radial from-sidebar-accent to-sidebar">
                    <img src="/logo.svg" alt="logo-img" 
                        className="w-24 h-24"
                    />
                    <p className="text-sm text-muted-foreground md:text-lg text-balance">
                        Meet.AI
                    </p>
                </div>
            </CardContent>
        </Card>

    </div>
  );
}

export default SignUpView