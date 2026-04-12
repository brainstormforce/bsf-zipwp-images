import { __ } from '@wordpress/i18n';
import Dropdown from '../dropdown';
import Tooltip from '../tooltip';
import Button from '../button';
import { TilesCircleIcon } from '../../ui/icons';
import { CheckIcon } from '@heroicons/react/24/outline';
import { classNames } from '../../utils/helpers';

export const COLORS = [
	{ name: 'red', label: __( 'Red', 'zipwp-images' ), hex: '#F90F0F' },
	{ name: 'orange', label: __( 'Orange', 'zipwp-images' ), hex: '#FD6713' },
	{ name: 'yellow', label: __( 'Yellow', 'zipwp-images' ), hex: '#FFE03B' },
	{ name: 'green', label: __( 'Green', 'zipwp-images' ), hex: '#4CAF50' },
	{ name: 'blue', label: __( 'Blue', 'zipwp-images' ), hex: '#2191F3' },
	{ name: 'pink', label: __( 'Pink', 'zipwp-images' ), hex: '#FE4483' },
	{ name: 'brown', label: __( 'Brown', 'zipwp-images' ), hex: '#795548' },
	{ name: 'black', label: __( 'Black', 'zipwp-images' ), hex: '#000000' },
	{ name: 'gray', label: __( 'Gray', 'zipwp-images' ), hex: '#9E9E9E' },
	{ name: 'white', label: __( 'White', 'zipwp-images' ), hex: '#FFFFFF' },
	{
		name: 'turquoise',
		label: __( 'Turquoise', 'zipwp-images' ),
		hex: '#29D5C4',
	},
	{ name: 'lilac', label: __( 'Lilac', 'zipwp-images' ), hex: '#CBABFF' },
	{ name: 'violet', label: __( 'Violet', 'zipwp-images' ), hex: '#9027FA' },
	{
		name: 'grayscale',
		label: __( 'Grayscale', 'zipwp-images' ),
		hex: '',
		component: (
			<div className="size-6 rounded-full overflow-hidden flex p-0">
				<div className="w-1/2 h-full bg-[#9E9E9E]" />
				<div className="w-1/2 h-full bg-white" />
			</div>
		),
	},
	{
		name: 'transparent',
		label: __( 'Transparent', 'zipwp-images' ),
		hex: '',
		component: <TilesCircleIcon className="size-6 rounded-full" />,
	},
];

const ColorsDropdown = ( { value, onChange } ) => {
	const handleOnChange = ( color ) => () => {
		if ( typeof onChange !== 'function' ) {
			return;
		}
		onChange( color );
	};

	return (
		<Dropdown
			contentClassName="p-3 bg-white space-y-4"
			trigger={ ( trigger ) => (
				<div
					className={ classNames(
						'flex items-center justify-between gap-2 min-w-[72px] pl-4 !py-2.5 pr-2 cursor-pointer rounded ring-1 ring-wp-component-border focus:ring-2 focus:ring-accent-wp-primary',
						trigger?.open && 'ring-2 ring-accent-wp-primary'
					) }
					tabIndex={ 0 }
				>
					{ !! value ? (
						<span className="text-sm font-normal text-body-text flex items-center gap-2">
							{ ! value?.component && (
								<span
									className="block size-4 rounded-full"
									style={ { backgroundColor: value?.hex } }
								></span>
							) }
							{ /* if componnent is there don't show color */ }
							{ !! value?.component && value.component }
							<span className="hover:text-accent">
								{ value?.label }
							</span>
						</span>
					) : (
						<span className="text-sm font-normal text-body-text hover:text-accent">
							{ __( 'Color', 'zipwp-images' ) }
						</span>
					) }
					<svg
						stroke="currentColor"
						fill="none"
						strokeWidth="0"
						viewBox="0 0 24 24"
						height="200px"
						width="200px"
						xmlns="http://www.w3.org/2000/svg"
						className="size-[18px] font-semibold text-app-inactive-icon"
					>
						<path
							d="M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z"
							fill="currentColor"
						></path>
					</svg>
				</div>
			) }
		>
			<div className="grid grid-cols-5 gap-2 auto-rows-auto">
				{ COLORS.map( ( colorItem ) => (
					<Tooltip key={ colorItem.name } content={ colorItem.label }>
						<Dropdown.Item
							as="div"
							className="relative flex place-items-center size-6 rounded-full cursor-pointer border border-solid border-black/10 [&>*]:shrink-0 hover:scale-125 transition-transform"
							onClick={ handleOnChange( colorItem ) }
							{ ...( !! colorItem?.hex && {
								style: { backgroundColor: colorItem.hex },
							} ) }
						>
							{ !! colorItem?.component && colorItem.component }
							{ value?.name === colorItem?.name && (
								<div className="flex justify-center items-center absolute inset-0 pointer-events-none">
									<div className="rounded-full size-4 bg-white flex justify-center items-center">
										<CheckIcon className="w-3 h-3 text-body-text" />
									</div>
								</div>
							) }
						</Dropdown.Item>
					</Tooltip>
				) ) }
			</div>
			<Dropdown.Item
				as={ Button }
				variant="blank"
				className={ classNames(
					'w-fit py-1 px-2.5 text-xs font-normal text-body-text border border-solid border-border-primary rounded',
					! value && 'opacity-50 cursor-not-allowed'
				) }
				onClick={ handleOnChange( null ) }
				disabled={ ! value }
			>
				{ __( 'Clear', 'zipwp-images' ) }
			</Dropdown.Item>
		</Dropdown>
	);
};

export default ColorsDropdown;
