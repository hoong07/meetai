import { Style , Avatar } from "@dicebear/core"

import botttsNeutralStyle from "@dicebear/styles/bottts-neutral.json"
import initialsStyle from "@dicebear/styles/initials.json"

interface Props {
    seed: string
    variant: "botttsNeutralStyle" | "initialsStyle"
}

export const generateAvatarUri = ({ seed , variant }: Props): string => {
    let style: Style

    if (variant === "botttsNeutralStyle") {
        style = new Style(botttsNeutralStyle)
        const avatar = new Avatar(style , {seed})
        return avatar.toDataUri()
    } else {
        style = new Style(initialsStyle)
        return new Avatar(style , {
            seed,
            fontWeight: 500,
            size: 128,
            scale: 1.3,
        }).toDataUri()
    }
    
    throw new Error(`Unsupported variant:${variant}`)
}