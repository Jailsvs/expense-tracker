export interface ExpenseGroup {
  _id?: string;
  name: string;
  icon: string;           // Base64 string with data URI
  iconType: string;       // MIME type
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateExpenseGroupDto {
  name: string;
  icon: string;
  iconType: string;
}

export interface UpdateExpenseGroupDto {
  name?: string;
  icon?: string;
  iconType?: string;
}
