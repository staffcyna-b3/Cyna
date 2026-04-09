import { UserRoleType } from "../enum/UserRoleType.enum";

export interface JwtPayloadDto {
    userId: string
    email: string
    role: UserRoleType
}