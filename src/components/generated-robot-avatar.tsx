import { Avatar , Style } from "@dicebear/core"
import botttsNeutralStyle from "@dicebear/styles/bottts-neutral.json"

export const GeneratedRobotAvatar = (seed: string) => {
    const style = new Style(botttsNeutralStyle)
    const avatar = new Avatar(style,{
        seed: seed || "robot",
        borderRadius: 50,
        size: 96,
    })

    return avatar.toDataUri()
}