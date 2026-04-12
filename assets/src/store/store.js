import { redux } from 'zustand/middleware';
import { create } from 'zustand';
import reducer from './reducer';

export const initialState = {
	imagePreview: null,
};

const useStore = create( redux( reducer, initialState ) );

export default useStore;
