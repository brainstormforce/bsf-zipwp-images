import { __ } from '@wordpress/i18n';

export const ORIENTATIONS = {
	all: {
		value: 'all',
		label: __( 'All Orientation', 'zipwp-images' ),
	},
	horizontal: {
		value: 'landscape',
		label: __( 'Landscape', 'zipwp-images' ),
	},
	vertical: {
		value: 'portrait',
		label: __( 'Portrait', 'zipwp-images' ),
	},
	square: {
		value: 'square',
		label: __( 'Square', 'zipwp-images' ),
	},
};

const OrientationDropdown = ( { value, onChange } ) => {
	return (
		<select
			className="block h-auto min-w-fit border-0 py-1 md:!py-2.5 pl-3 pr-10 ring-1 !ring-wp-component-border focus:ring-2 focus:!ring-accent-wp-primary !text-sm hover:text-accent"
			onChange={ ( e ) => {
				onChange( e.target.value );
			} }
			value={ value }
		>
			{ Object.values( ORIENTATIONS ).map( ( orientationItem, index ) => (
				<option value={ orientationItem.value } key={ index }>
					{ orientationItem.label }
				</option>
			) ) }
		</select>
	);
};

export default OrientationDropdown;
