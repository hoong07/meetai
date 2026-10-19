import { HomeView } from "@/modules/home/ui/views/home-views"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

const Home = async () => {

  const session = await auth.api.getSession({
    headers: await headers(),
  }) // 解析请求头

  if (!session) {
    redirect("/sign-in") //没有登陆 -> 重定向 signIn page
  }

  return <HomeView></HomeView>
}

export default Home