import {
    LOAD_EXPENSES,
    LOAD_CATEGORIES,
    LOAD_ACCOUNTS,
    LOAD_MESSAGES,
    ADD_ACCOUNT,
    ADD_CATEGORY,
    ADD_EXPENSE,
    EDIT_ACCOUNT,
    EDIT_CATEGORY,
    EDIT_EXPENSE,
    DELETE_ACCOUNT,
    DELETE_CATEGORY,
    DELETE_EXPENSE
} from "./actions";


const initialState = {
    expenses: [],
    categories: [],
    accounts: [],
    messages: [],
    budget: 0
};

const expenseReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_MESSAGES:
            return {
                ...state,
                messages: [...messages, action.payload]
            };
        case LOAD_EXPENSES:
            return {
                ...state,
                expenses: [...state.expenses]
            };
        case LOAD_CATEGORIES:
            return {
                ...state,
                categories: [...state.categories]
            };
        case LOAD_ACCOUNTS:
            return {
                ...state,
                accounts: [...state.accounts]
            };
        case ADD_EXPENSE:
            return {
                ...state,
                expenses: [...state.expenses, action.payload]
            };
        case ADD_CATEGORY:
            return {
                ...state,
                categories: [...state.categories, action.payload]
            };
        case ADD_ACCOUNT:
            return {
                ...state,
                accounts: [...state.accounts, action.payload]
            };
        case EDIT_ACCOUNT:{
            let act = state.accounts.findIndex(e => e.id===action.payload.id);
            let newList = [...state.accounts];
            newList[act].name = action.payload.name;
            newList[act].amount = action.payload.amount;
            return { ...state, accounts: newList }
        }
        case EDIT_CATEGORY:{
            let cat = state.categories.findIndex(e => e.id===action.payload.id);
            let newList = [...state.categories];
            newList[cat].name = action.payload.name;
            newList[cat].icon = action.payload.icon;
            return { ...state, categories: newList }
        }
        case EDIT_EXPENSE: {
            let exp = state.expenses.findIndex(e => e.id===action.payload.id);
            let newList = [...state.expenses];
            newList[exp].name = action.payload.name;
            newList[exp].amount = action.payload.amount;
            return { ...state, expenses: newList }
        }
        case DELETE_ACCOUNT:{
            let act = state.accounts.findIndex(e => e.id===action.payload.id);
            let newList = [...state.accounts];
            newList.splice(act, 1);
            return { ...state, accounts: newList }
        }
        case DELETE_CATEGORY:{
            let cat = state.categories.findIndex(e => e.id===action.payload.id);
            let newList = [...state.categories];
            newList.splice(cat, 1);
            return { ...state, categories: newList }
        }
        case DELETE_EXPENSE: {
            let exp = state.expenses.findIndex(e => e.id===action.payload.id);
            let newList = [...state.expenses];
            newList.splice(exp, 1);
            return { ...state, expenses: newList }
        }
        default:
            return state;
    }
}
export default expenseReducer;