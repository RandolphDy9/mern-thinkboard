import toast from "react-hot-toast"

// Custom toast configurations
export const showToast = {
  // Success toasts
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  // Error toasts
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: "#ef4444",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  // Loading toasts
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "#6366f1",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  // Custom task-specific toasts
  taskCreated: (title: string) => {
    toast.success(`Task "${title}" created successfully!`, {
      duration: 3000,
      icon: "✨",
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  taskUpdated: (title: string) => {
    toast.success(`Task "${title}" updated successfully!`, {
      duration: 3000,
      icon: "📝",
      style: {
        background: "#3b82f6",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  taskDeleted: (title: string) => {
    toast.success(`Task "${title}" deleted successfully!`, {
      duration: 3000,
      icon: "🗑️",
      style: {
        background: "#f59e0b",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  // Network-specific toasts
  networkError: () => {
    toast.error("Network error - please check your connection", {
      duration: 6000,
      icon: "📡",
      style: {
        background: "#ef4444",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  serverError: () => {
    toast.error("Server error - please try again later", {
      duration: 5000,
      icon: "⚠️",
      style: {
        background: "#ef4444",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  // Connection status toasts
  backOnline: () => {
    toast.success("You're back online!", {
      duration: 2000,
      icon: "🌐",
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  wentOffline: () => {
    toast.error("You're offline", {
      duration: 3000,
      icon: "📵",
      style: {
        background: "#f59e0b",
        color: "#fff",
        fontWeight: "600",
      },
    })
  },

  // Utility functions
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId)
  },

  dismissAll: () => {
    toast.dismiss()
  },

  // Promise-based toast for async operations
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
  ) => {
    return toast.promise(promise, messages, {
      style: {
        fontWeight: "600",
      },
      success: {
        duration: 3000,
        style: {
          background: "#10b981",
          color: "#fff",
        },
      },
      error: {
        duration: 5000,
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      },
      loading: {
        style: {
          background: "#6366f1",
          color: "#fff",
        },
      },
    })
  },
}
