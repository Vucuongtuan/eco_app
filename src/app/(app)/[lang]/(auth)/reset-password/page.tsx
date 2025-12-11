import FormResetPassword from "@/components/form/FormResetPassword"
import { getTranslations } from "next-intl/server"

export default async function ResetPassword({searchParams}: {searchParams:Promise< {token: string}>}) {
    const {token} = await searchParams
    const t = await getTranslations("resetPassword")
    
    return (
        <section className="min-h-screen flex items-center justify-center bg-primary-background px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t("title")}
                    </h1>
                    <p className="text-gray-600">
                        {t("description")}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <FormResetPassword token={token}/>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        {t("rememberPassword")}{" "}
                        <a 
                            href="/login" 
                            className="font-medium text-gray-900 hover:underline transition-all"
                        >
                            {t("loginNow")}
                        </a>
                    </p>
                </div>
            </div>
        </section>
    )
}