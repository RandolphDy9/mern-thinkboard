import axios, { type AxiosError } from "axios"

const API_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response received:`, response.status, response.statusText)
    return response
  },
  (error: AxiosError) => {
    console.error("Response error:", error.response?.status, error.response?.statusText)

    // Handle different error types
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout - please check your connection")
    }

    if (error.code === "ERR_NETWORK") {
      throw new Error("Network error - please check if the server is running")
    }

    if (error.response) {
      // Server responded with error status
      const message = error.response.data || error.response.statusText || "Server error"
      throw new Error(`${error.response.status}: ${message}`)
    }

    throw new Error(error.message || "An unexpected error occurred")
  },
)

export interface Note {
  _id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface CreateNoteData {
  title: string
  content: string
}

export interface UpdateNoteData {
  title: string
  content: string
}

export const notesApi = {
  // Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    try {
      const response = await apiClient.get<Note[]>("/notes")
      return response.data
    } catch (error) {
      console.error("Error fetching notes:", error)
      throw error
    }
  },

  // Get single note by ID
  getNoteById: async (id: string): Promise<Note> => {
    try {
      const response = await apiClient.get<Note>(`/notes/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching note ${id}:`, error)
      throw error
    }
  },

  // Create new note
  createNote: async (noteData: CreateNoteData): Promise<Note> => {
    try {
      const response = await apiClient.post<Note>("/notes", noteData)
      return response.data
    } catch (error) {
      console.error("Error creating note:", error)
      throw error
    }
  },

  // Update existing note
  updateNote: async (id: string, noteData: UpdateNoteData): Promise<Note> => {
    try {
      const response = await apiClient.put<Note>(`/notes/${id}`, noteData)
      return response.data
    } catch (error) {
      console.error(`Error updating note ${id}:`, error)
      throw error
    }
  },

  // Delete note
  deleteNote: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/notes/${id}`)
    } catch (error) {
      console.error(`Error deleting note ${id}:`, error)
      throw error
    }
  },
}

// Export axios instance for direct use if needed
export { apiClient }
