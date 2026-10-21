import { Avatar , Style } from "@dicebear/core"
import definition from "@dicebear/styles/bottts.json" with {type: 'json'}

export const GeneratedRobotAvatar = (seed: string) => {
    const style = new Style(definition)
    const avatar = new Avatar(style,{
        seed: seed || "robot",
        borderRadius: 50,
        size: 96,
    })

    return avatar.toDataUri()
}