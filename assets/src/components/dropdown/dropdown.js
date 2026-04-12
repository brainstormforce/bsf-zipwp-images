import {
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	Transition,
} from '@headlessui/react';
import { Fragment, useRef, useEffect } from '@wordpress/element';
import { usePopper } from '../../hooks';
import { classNames } from '../../utils/helpers';

const Dropdown = ( {
	placement = 'right',
	width = 'w-48',
	contentClassName = 'py-1 bg-white',
	trigger,
	offset = [ 0, 0 ],
	children,
	disabled = false,
	mainClassName = '',
	isOpen,
	onClose,
} ) => {
	let placementValue = 'bottom-end';
	switch ( placement ) {
		case 'left':
			placementValue = 'bottom-start';
			break;
		case 'right':
			placementValue = 'bottom-end';
			break;
		case 'top-start':
			placementValue = 'top-start';
			break;
		case 'top-end':
			placementValue = 'top-end';
			break;
		default:
			placementValue = 'bottom-end';
	}
	const [ triggerPopper, container ] = usePopper( {
		placement: placementValue,
		strategy: 'absolute',
		modifiers: [
			{ name: 'offset', options: { offset } },
			{
				name: 'flip',
				enabled: false, // This disables the flip modifier
			},
		],
	} );

	switch ( width?.toString() ) {
		case '48':
			width = 'w-48';
			break;
		case '60':
			width = 'w-60';
			break;
		case '72.5':
			width = 'w-[18.25rem]';
			break;
		case '80':
			width = 'w-80';
			break;
		default:
			width = !! width ? width : 'w-48';
	}

	const menuRef = useRef( null );

	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if (
				menuRef.current &&
				! menuRef.current.contains( event.target )
			) {
				onClose();
			}
		};

		if ( isOpen ) {
			document.addEventListener( 'click', handleClickOutside );
		}

		return () => {
			document.removeEventListener( 'click', handleClickOutside );
		};
	}, [ isOpen, onClose ] );

	return (
		<Menu
			as="div"
			className={ classNames( 'relative', mainClassName ) }
			ref={ menuRef }
		>
			{ () => (
				<>
					<div ref={ triggerPopper }>
						<MenuButton as={ Fragment } disabled={ disabled }>
							{ trigger }
						</MenuButton>
					</div>

					<div ref={ container } className="z-50">
						<Transition
							show={ isOpen }
							as={ Fragment }
							enter="transition ease-out duration-200"
							enterFrom={
								placementValue.startsWith( 'top' )
									? 'transform opacity-0 scale-95 translate-y-2'
									: 'transform opacity-0 scale-95 -translate-y-2'
							}
							enterTo="transform opacity-100 scale-100 translate-y-0"
							leave="transition ease-in duration-75"
							leaveFrom="transform opacity-100 scale-100 translate-y-0"
							leaveTo={
								placementValue.startsWith( 'top' )
									? 'transform opacity-0 scale-95 translate-y-2'
									: 'transform opacity-0 scale-95 -translate-y-2'
							}
						>
							<div
								className={ classNames(
									'my-2 rounded-md shadow-lg',
									width
								) }
							>
								<MenuItems
									className={ classNames(
										'rounded-md focus:outline-none ring-1 ring-black ring-opacity-5',
										contentClassName
									) }
								>
									{ children }
								</MenuItems>
							</div>
						</Transition>
					</div>
				</>
			) }
		</Menu>
	);
};

Dropdown.Item = MenuItem;

export default Dropdown;
