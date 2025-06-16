import { useState, useEffect } from "react"
import { Plus, Edit3, Trash2, Lightbulb, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { notesApi, type Note, type CreateNoteData, type UpdateNoteData } from "./lib/api"
import { showToast } from "./lib/toast"
import TaskModal from "./component/task-modal"
import ConfirmModal from "./component/confirm-modal"

const colors = [
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-green-400 to-green-600",
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-orange-400 to-orange-600",
  "bg-gradient-to-br from-red-400 to-red-600",
  "bg-gradient-to-br from-indigo-400 to-indigo-600",
]

// Extend Note interface to include color for UI
interface TaskNote extends Note {
  color: string
}

const App = () => {
  const [tasks, setTasks] = useState<TaskNote[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskNote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    taskId: string
    taskTitle: string
    isDeleting: boolean
  }>({
    isOpen: false,
    taskId: "",
    taskTitle: "",
    isDeleting: false,
  })

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      showToast.backOnline()
    }
    const handleOffline = () => {
      setIsOnline(false)
      showToast.wentOffline()
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Load tasks on component mount
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const notes = await notesApi.getAllNotes()

      // Add random colors to notes for UI
      const tasksWithColors: TaskNote[] = notes.map((note) => ({
        ...note,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))

      setTasks(tasksWithColors)

      if (tasksWithColors.length > 0) {
        showToast.success(`Loaded ${tasksWithColors.length} tasks successfully`)
      }
    } catch (error) {
      console.error("Error loading tasks:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load tasks"
      setError(errorMessage)

      // Show appropriate error toast
      if (errorMessage.includes("Network") || errorMessage.includes("ECONNREFUSED")) {
        showToast.networkError()
      } else {
        showToast.serverError()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async (taskData: CreateNoteData) => {
    // Use toast.promise for the entire operation
    const addPromise = notesApi.createNote(taskData)

    try {
      const newNote = await showToast.promise(addPromise, {
        loading: "Creating task...",
        success: `Task "${taskData.title}" created successfully! ✨`,
        error: (err) => `Failed to create task: ${err.message}`,
      })

      const newTask: TaskNote = {
        ...newNote,
        color: colors[Math.floor(Math.random() * colors.length)],
      }
      setTasks([newTask, ...tasks])
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error adding task:", error)
      throw error
    }
  }

  const handleEditTask = async (taskData: UpdateNoteData) => {
    if (!editingTask) return

    const updatePromise = notesApi.updateNote(editingTask._id, taskData)

    try {
      const updatedNote = await showToast.promise(updatePromise, {
        loading: "Updating task...",
        success: `Task "${taskData.title}" updated successfully! 📝`,
        error: (err) => `Failed to update task: ${err.message}`,
      })

      setTasks(
        tasks.map((task) =>
          task._id === editingTask._id
            ? { ...updatedNote, color: task.color } // Keep the existing color
            : task,
        ),
      )
      setEditingTask(null)
    } catch (error) {
      console.error("Error editing task:", error)
      throw error
    }
  }

  // Open confirmation modal for deletion
  const openDeleteConfirmation = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      taskId: id,
      taskTitle: title,
      isDeleting: false,
    })
  }

  // Close confirmation modal
  const closeDeleteConfirmation = () => {
    if (!confirmModal.isDeleting) {
      setConfirmModal({
        isOpen: false,
        taskId: "",
        taskTitle: "",
        isDeleting: false,
      })
    }
  }

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    const { taskId, taskTitle } = confirmModal

    // Set deleting state
    setConfirmModal((prev) => ({ ...prev, isDeleting: true }))

    // Optimistic update - remove from UI first
    const originalTasks = [...tasks]
    setTasks(tasks.filter((task) => task._id !== taskId))

    try {
      await notesApi.deleteNote(taskId)
      showToast.taskDeleted(taskTitle)

      // Close modal after successful deletion
      setConfirmModal({
        isOpen: false,
        taskId: "",
        taskTitle: "",
        isDeleting: false,
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      // Revert optimistic update on error
      setTasks(originalTasks)

      const errorMessage = error instanceof Error ? error.message : "Failed to delete task"
      showToast.error(`Failed to delete task: ${errorMessage}`)

      // Reset deleting state but keep modal open
      setConfirmModal((prev) => ({ ...prev, isDeleting: false }))
    }
  }

  const openEditModal = (task: TaskNote) => {
    setEditingTask(task)
  }

  const closeEditModal = () => {
    setEditingTask(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleRefresh = async () => {
    showToast.dismiss() // Clear any existing toasts
    await loadTasks()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Think Board
            </h1>
            {/* Online/Offline indicator */}
            <div className={`p-2 rounded-full ${isOnline ? "bg-green-100" : "bg-red-100"}`}>
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
          <p className="text-slate-600 text-lg">
            Capture your ideas, organize your thoughts, and bring your vision to life
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={isLoading || !isOnline}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Task
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading || !isOnline}
            className="inline-flex items-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Modals */}
        <TaskModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddTask}
          mode="add"
        />

        <TaskModal
          isOpen={!!editingTask}
          onClose={closeEditModal}
          onSubmit={handleEditTask}
          task={editingTask}
          mode="edit"
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeDeleteConfirmation}
          onConfirm={handleConfirmDelete}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete Task"
          cancelText="Cancel"
          type="danger"
          isLoading={confirmModal.isDeleting}
          itemName={confirmModal.taskTitle}
        />

        {/* Loading State */}
        {isLoading && tasks.length === 0 && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-violet-500 animate-spin" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Loading tasks...</h3>
            <p className="text-slate-500">Please wait while we fetch your tasks</p>
          </div>
        )}

        {/* Tasks Grid */}
        {!isLoading && tasks.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center shadow-lg">
              <Lightbulb className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No tasks yet</h3>
            <p className="text-slate-500">Start by adding your first task to get organized!</p>
          </div>
        )}

        {tasks.length > 0 && (
          <>
            {/* Task count */}
            <div className="text-center mb-6">
              <p className="text-slate-600">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100"
                >
                  {/* Card Header */}
                  <div className={`${task.color} text-white p-4 relative`}>
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold leading-tight pr-2 break-words">{task.title}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                        <button
                          onClick={() => openEditModal(task)}
                          disabled={!isOnline}
                          className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit task"
                          aria-label={`Edit task: ${task.title}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirmation(task._id, task.title)}
                          disabled={!isOnline}
                          className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete task"
                          aria-label={`Delete task: ${task.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 min-h-[3rem] break-words">
                      {task.content || "No content provided"}
                    </p>
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        Created: {formatDate(task.createdAt)}
                      </div>
                      {task.updatedAt !== task.createdAt && (
                        <div className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full ml-2">
                          Updated: {formatDate(task.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm">Built with ❤️ for creative minds</p>
        </div>
      </div>
    </div>
  )
}

export default App;