import type React from "react"
import { AlertTriangle, X, Trash2, Check } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
  isLoading?: boolean
  itemName?: string
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
  itemName,
}: ConfirmModalProps) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isLoading) {
      onClose()
    }
    if (e.key === "Enter") {
      onConfirm()
    }
  }

  if (!isOpen) return null

  // Dynamic styling based on type
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          confirmBg: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          titleColor: "text-red-600",
        }
      case "warning":
        return {
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          confirmBg: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          titleColor: "text-yellow-600",
        }
      case "info":
        return {
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          confirmBg: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          titleColor: "text-blue-600",
        }
      default:
        return {
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          confirmBg: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          titleColor: "text-red-600",
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyPress}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 rounded-full ${styles.iconBg}`}>
            {type === "danger" ? (
              <Trash2 className={`w-8 h-8 ${styles.iconColor}`} />
            ) : (
              <AlertTriangle className={`w-8 h-8 ${styles.iconColor}`} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className={`text-xl font-semibold mb-2 ${styles.titleColor}`}>{title}</h3>
          <div className="text-gray-600 space-y-2">
            <p>{message}</p>
            {itemName && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="text-sm font-medium text-gray-700">Item to be deleted:</p>
                <p className="text-sm text-gray-900 font-semibold break-words">"{itemName}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Warning text for dangerous actions */}
        {type === "danger" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">This action cannot be undone</p>
                <p>This will permanently delete the item and remove all associated data.</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 inline-flex items-center justify-center px-4 py-3 ${styles.confirmBg} text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmBg.includes("focus:ring") ? "" : "focus:ring-red-500"}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {confirmText}
              </>
            )}
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">Press Enter to confirm, Escape to cancel</p>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal;