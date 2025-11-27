"use client"

import { RichText } from "@/components/RichText"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { ModelBlock } from "./config"

const STORAGE_KEY = "model-popup-viewed"

export default function ModelComponent(props: ModelBlock) {
    const { title, content } = props
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations("block.modal")
    
    useEffect(() => {
        // Kiểm tra xem người dùng đã xem popup chưa
        const hasViewed = localStorage.getItem(STORAGE_KEY)
        
        if (!hasViewed) {
            // Delay nhỏ để tránh popup xuất hiện quá đột ngột
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 500)
            
            return () => clearTimeout(timer)
        }
    }, [])
    
    const handleClose = () => {
        setIsOpen(false)
        // Lưu vào localStorage để không hiển thị lại
        localStorage.setItem(STORAGE_KEY, "true")
    }
    
    if (!isOpen) return null
    
    return (
        <>
            {/* Backdrop/Overlay */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
                onClick={handleClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div 
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                        aria-label={t("close")}
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* Title Section */}
                        {title && (
                            <div className="mb-6 md:mb-8">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                    {title}
                                </h2>
                                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto mt-4"></div>
                            </div>
                        )}

                        {/* Content Section */}
                        {content && (
                            <div className="prose prose-sm md:prose-base max-w-none">
                                <RichText data={content} />
                            </div>
                        )}
                        
                        {/* Action Button */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleClose}
                                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                            >
                                {t("understood")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
