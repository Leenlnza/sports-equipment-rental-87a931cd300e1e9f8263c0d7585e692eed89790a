export interface User {
  _id?: string
  name: string
  email: string
  password: string
  grade: string
  branch: string
  phone?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserRegistration {
  name: string
  email: string
  password: string
  grade: string
  branch: string
}

export interface UserLogin {
  email: string
  password: string
}
