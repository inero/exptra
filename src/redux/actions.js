export const LOAD_MESSAGES = 'LOAD_MESSAGES';

export const LOAD_EXPENSES = 'LOAD_EXPENSES';
export const LOAD_CATEGORIES = 'LOAD_CATEGORIES';
export const LOAD_ACCOUNTS = 'LOAD_ACCOUNTS';

export const ADD_EXPENSE = 'ADD_EXPENSE';
export const ADD_CATEGORY = 'ADD_CATEGORY';
export const ADD_ACCOUNT = 'ADD_ACCOUNT';

export const EDIT_EXPENSE = 'EDIT_EXPENSE';
export const EDIT_CATEGORY = 'EDIT_CATEGORY';
export const EDIT_ACCOUNT = 'EDIT_ACCOUNT';

export const DELETE_EXPENSE = 'DELETE_EXPENSE';
export const DELETE_CATEGORY = 'DELETE_CATEGORY';
export const DELETE_ACCOUNT = 'DELETE_ACCOUNT';

export const loadMessages = payload => ({ type: LOAD_MESSAGES, payload });

export const loadExpenses = () => ({ type: LOAD_EXPENSES });
export const loadCategories = () => ({ type: LOAD_CATEGORIES });
export const loadAccounts = () => ({ type: LOAD_ACCOUNTS });

export const addExpense = item => ({ type: ADD_EXPENSE, payload: item });
export const addCategory = item => ({ type: ADD_CATEGORY, payload: item });
export const addAccount = item => ({ type: ADD_ACCOUNT, payload: item });

export const editExpense = item => ({ type: EDIT_EXPENSE, payload: item });
export const editCategory = item => ({ type: EDIT_CATEGORY, payload: item });
export const editAccount = item => ({ type: EDIT_ACCOUNT, payload: item });

export const deleteExpense = item => ({ type: DELETE_EXPENSE, payload: item });
export const deleteCategory = item => ({ type: DELETE_CATEGORY, payload: item });
export const deleteAccount = item => ({ type: DELETE_ACCOUNT, payload: item });