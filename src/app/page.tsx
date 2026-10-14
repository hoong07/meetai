"use client"

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useState } from "react"

export default function Home() {
  const [name , setName] = useState("")
  const [email , setEmail] = useState("")
  const [password , setPassword] = useState("")

  const { 
        data: session,
    } = authClient.useSession() 

  const onSubmit = () => {
    authClient.signUp.email({
      name,
      email,
      password
    },
    {
      onError: (error) => {
        window.alert(`注册失败: ${error.error.message}`);
        // console.log(error)
      },
      onSuccess: () => {
        window.alert("注册成功!");
      }
    }
  )}

  const onLogin = () => {
    authClient.signIn.email({
      email,
      password
    },
    {
      onError: (error) => {
        window.alert(`登录失败: ${error.error.message}`);
        // console.log(error)
      },
      onSuccess: () => {
        window.alert("登录成功!");
      }
    }
  )}

  if (session) {
    return (
      <div className="flex flex-col gap-4 w-100 mx-auto mt-20">
        <p>Welcome, {session.user.name}!</p>
        <Button onClick={() => authClient.signOut()}>退出</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 w-100 mx-auto mt-20">
      <div className="flex flex-col gap-4 w-100 mx-auto mt-20">
        <Input placeholder="Name"
        value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
        <Input placeholder="Email"
        value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
        <Input placeholder="Password"
        type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />

        <Button onClick={onSubmit}>注册</Button>
      </div>

      <div className="flex flex-col gap-4 w-100 mx-auto mt-20">
        <Input placeholder="Email"
        value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
        <Input placeholder="Password"
        type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />

        <Button onClick={onLogin}>登陆</Button>
      </div>
    </div>
  )
}
