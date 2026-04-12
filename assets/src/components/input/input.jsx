import { useEffect, useRef } from '@wordpress/element';
import { classNames } from '../../utils/helpers';

const Input = ( {
	className,
	name,
	prefixIcon,
	suffixIcon,
	register,
	validations,
	error,
	onChange,
	focusOnLoad,
	...props
} ) => {
	const inputRef = useRef( null );

	useEffect( () => {
		if ( inputRef.current && !! focusOnLoad ) {
			inputRef.current.focus();
		}
	}, [] );

	return (
		<div className="space-y-1">
			<div
				className={ classNames(
					'relative flex items-center justify-start h-10 ring-1 ring-wp-component-border shadow-sm rounded focus-within:border-accent focus-within:ring-2 focus-within:ring-accent',
					!! error && 'border-alert-error',
					className
				) }
			>
				{ !! prefixIcon && prefixIcon }
				<input
					type="text"
					className={ classNames(
						'h-full !py-2 w-full px-3 !rounded-md !outline-none !text-sm placeholder:!text-sm placeholder:!text-zip-app-inactive-icon !bg-transparent disabled:!cursor-not-allowed !border-0 focus:!ring-0 focus:!outline-none'
					) }
					aria-invalid={ !! error }
					onChange={ ( e ) => onChange( e.target.value ) }
					ref={ inputRef }
					{ ...props }
				/>
				{ !! suffixIcon && suffixIcon }
			</div>
			{ !! error && (
				<p className="m-0 p-0 text-sm text-alert-error">
					{ error.message }
				</p>
			) }
		</div>
	);
};

export default Input;
