import type React from "react"
import { useState, useEffect } from "react"
import { X, Zap, Edit3, Target, Loader2 } from "lucide-react"
import type { Note } from "../lib/api"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: { title: string; content: string }) => Promise<void>
  task?: Note | null
  mode: "add" | "edit"
  isLoading?: boolean
}

const TaskModal = ({ isOpen, onClose, onSubmit, task, mode }: TaskModalProps) => {
  const [formData, setFormData] = useState({ title: "", content: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        setFormData({ title: task.title, content: task.content })
      } else {
        setFormData({ title: "", content: "" })
      }
      setError(null)
    }
  }, [isOpen, task, mode])

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Both title and content are required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(formData)
      setFormData({ title: "", content: "" })
    } catch (error) {
      console.error("Error submitting task:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") {
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose()
    }
  }

  if (!isOpen) return null

  const isAddMode = mode === "add"
  const title = isAddMode ? "Create New Task" : "Edit Task"
  const icon = isAddMode ? <Zap className="w-5 h-5 text-violet-500" /> : <Edit3 className="w-5 h-5 text-violet-500" />
  const submitText = isAddMode ? "Create Task" : "Update Task"
  const isFormValid = formData.title.trim() && formData.content.trim()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onKeyDown={handleKeyPress}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              autoFocus
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="task-content" className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="task-content"
              placeholder="Enter task content..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              onKeyDown={handleKeyPress}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition-colors min-h-[100px] resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              maxLength={1000}
            />
          </div>

          {/* Character count */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Title: {formData.title.length}/100</span>
            <span>Content: {formData.content.length}/1000</span>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="text-xs text-gray-400 text-center">Press Ctrl+Enter to submit, Escape to close</div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isAddMode ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  {submitText}
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskModal;