import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const classNames = ( ...classes ) => twMerge( clsx( classes ) );

export const frameModel = ( () => {
	let frameModelObj;

	return Object.seal( {
		get: () => frameModelObj,
		set: ( modelObj ) => {
			frameModelObj = modelObj;
		},
	} );
} )();

export const getFileName = ( url ) => {
	try {
		const path = new URL( url ).pathname;
		return path.split( '/' ).pop();
	} catch ( error ) {
		return '';
	}
};

export const updateSavedImages = ( imageId ) => {
	// Update the saved images array.
	if ( ! window?.zipwpImages?.saved_images ) {
		return;
	}
	window.zipwpImages.saved_images.push( imageId );
};

export const insertImage = async ( { id, description, url, name } ) => {
	const frame = frameModel.get();
	if ( ! frame ) {
		return;
	}
	try {
		const formData = new FormData();
		formData.append( 'action', 'zipwp_images_insert_image' );
		formData.append( 'id', id );
		formData.append( 'description', description );
		formData.append( 'url', url );
		formData.append( 'name', name ?? getFileName( url ) );
		formData.append( '_ajax_nonce', zipwpImages._ajax_nonce );

		const response = await fetch( zipwpImages.ajaxurl, {
			method: 'POST',
			body: formData,
		} );

		if ( response?.status !== 200 ) {
			console.error( response );
			return;
		}
		updateSavedImages( id );
		const data = await response.json();
		frame.model.frame.content.mode( 'browse' );
		frame.model.get( 'selection' ).add( data.data.attachmentData );
		frame.model.frame.trigger( 'library:selection:add' );
		frame.model.get( 'selection' );
		frame.controller.el.querySelector( '.media-button-select' ).click();
	} catch ( error ) {
		console.error( error );
	}
};
