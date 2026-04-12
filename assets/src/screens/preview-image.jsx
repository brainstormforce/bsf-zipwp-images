import { __ } from '@wordpress/i18n';
import useStore, { actionTypes } from '../store';
import Button from '../components/button';
import {
	ArrowDownTrayIcon,
	ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import RadioGroup from '../components/radio-group';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { classNames, getFileName, insertImage } from '../utils/helpers';
import LoadingSpinner from '../components/loading-spinner';

const PreviewImage = () => {
	const { imagePreview, dispatch } = useStore();
	const imageSizes = useMemo(
		() => ( !! imagePreview ? imagePreview.sizes : [] ),
		[ imagePreview ]
	);
	const [ imageSize, setImageSize ] = useState( imageSizes[ 0 ] ?? null );
	const [ inserting, setInserting ] = useState( false );

	const handleBackToAllImages = () => {
		dispatch( {
			type: actionTypes.SET_PREVIEW_IMAGE,
			payload: null,
		} );
	};

	const handleInsertImage = ( image ) => async () => {
		if ( inserting ) {
			return;
		}
		setInserting( true );
		await insertImage( image );
		setInserting( false );
		setTimeout( handleBackToAllImages, 1000 );
	};

	useEffect( () => {
		if ( ! imagePreview ) {
			return;
		}
		setImageSize( imageSizes[ 0 ] );
	}, [ imagePreview ] );

	return (
		!! imagePreview && (
			<div className="absolute inset-0 grid grid-cols-[1fr_380px] grid-rows-1 bg-white">
				<div className="flex items-center justify-center p-6">
					<img
						className="w-full h-full max-w-full max-h-full object-contain pointer-events-none"
						src={ imagePreview.url }
						alt="Preview"
						draggable="false"
					/>
				</div>

				{ /* Sidebar */ }
				<div className="flex flex-col justify-start items-start p-6 bg-wp-background border-l border-r-0 border-y-0 border-wp-border border-solid">
					<div className="!space-y-2">
						<p className="m-0 text-base font-semibold text-zip-app-heading">
							{ __( 'Image Details', 'zipwp-images' ) }
						</p>
						{ !! imagePreview?.description && (
							<p className="">{ imagePreview.description }</p>
						) }
						<a
							href={ imagePreview.author_url }
							target="_blank"
							rel="noreferrer"
						>
							by { imagePreview.author_name } via{ ' ' }
							<span className="capitalize">
								{ imagePreview.engine }
							</span>
						</a>
						<p>
							{ __( 'Orientation', 'zipwp-images' ) }:{ ' ' }
							<span className="capitalize">
								{ imagePreview.orientation }
							</span>
						</p>
					</div>
					<hr className="w-full border-t border-b-0 border-solid border-border-tertiary my-6" />
					<div className="space-y-2 w-full">
						<p className="m-0 text-base font-semibold text-zip-app-heading">
							{ __( 'Choose a size:', 'zipwp-images' ) }
						</p>
						<RadioGroup
							value={ imageSize }
							onChange={ setImageSize }
						>
							{ imageSizes.map( ( item ) => (
								<RadioGroup.Button
									key={ item.id }
									value={ item }
								>
									<span className="text-zip-body-text text-sm capitalize">
										{ item.id }
									</span>{ ' ' }
									{ !! item.width && (
										<span className="text-zip-app-inactive-icon text-sm">
											W: { item.width }
										</span>
									) }{ ' ' }
									{ !! item.height && (
										<span className="text-zip-app-inactive-icon text-sm">
											H: { item.height }
										</span>
									) }
								</RadioGroup.Button>
							) ) }
						</RadioGroup>
						<Button
							className="w-full !mt-6 shadow-sm hover:bg-hover-wp-default transition-colors duration-200"
							variant="primary"
							onClick={ handleInsertImage( {
								id: imagePreview.id,
								description: imagePreview.description,
								name: getFileName( imageSize?.url ),
								url: imageSize?.url,
							} ) }
							isSmall
						>
							{ inserting ? (
								<LoadingSpinner className="w-4 h-4 text-white" />
							) : (
								<ArrowDownTrayIcon className="w-4 h-4" />
							) }
							<span
								className={ classNames(
									inserting && 'sr-only',
									'!leading-[30px] font-normal text-[13px]'
								) }
							>
								Insert Image
							</span>
						</Button>
						<Button
							variant="blank"
							className="w-full !mt-5 text-zip-body-text font-semibold text-sm border border-solid border-border-tertiary bg-white"
							isSmall
							onClick={ handleBackToAllImages }
						>
							<ChevronLeftIcon className="w-4 h-4 text-zip-app-inactive-icon" />
							<span className="leading-[30px] font-normal text-[13px]">
								{ __( 'Back to All Images', 'zipwp-images' ) }
							</span>
						</Button>
					</div>
				</div>
			</div>
		)
	);
};

export default PreviewImage;
