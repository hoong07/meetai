// 生成头像 based on name 
import { Avatar , Style } from "@dicebear/core"
import initials from "@dicebear/styles/initials.json" 

export const generateDashAvatar = (seed: string) => {
    const style = new Style(initials);
    const avatar = new Avatar(style , {
        seed,
        borderRadius: 50,
        size: 96,
        textColor: "#ffffff"
    })

    return avatar.toString()
}
