import ProfileScreen from "@/components/Profile"
import { Suspense } from "react"




export default  function Profile() {
    return (
        <div>
            <Suspense>
                <ProfileScreen />
            </Suspense>
        </div>
    )
}