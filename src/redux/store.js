import {legacy_createStore as createStore} from 'redux';
import expenseReducer from './reducer';

export const store = createStore(expenseReducer);