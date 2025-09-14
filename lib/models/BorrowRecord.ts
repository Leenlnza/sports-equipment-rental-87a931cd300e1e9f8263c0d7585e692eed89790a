export interface BorrowRecord {
  _id?: string
  userId: string
  equipmentId: string
  equipmentName: string
  borrowDate: Date
  returnDate: Date
  actualReturnDate?: Date
  status: "borrowed" | "returned" | "overdue"
  createdAt: Date
  updatedAt: Date
}
