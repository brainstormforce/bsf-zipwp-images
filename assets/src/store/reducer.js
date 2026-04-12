import actionTypes from './action-types';

const reducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case actionTypes.SET_PREVIEW_IMAGE:
			return { ...state, imagePreview: payload };
		default:
			return state;
	}
};

export default reducer;
