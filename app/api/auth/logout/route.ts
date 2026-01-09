import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
    const cookieStore = await cookies()
    cookieStore.delete("auth_token")
    cookieStore.delete("curr_user")
    
    return NextResponse.json({ success: true })
}
