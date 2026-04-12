import {
	ArrowDownTrayIcon,
	ChevronDownIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';

import apiFetch from '@wordpress/api-fetch';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import Masonry from 'react-layout-masonry';

import ColorsDropdown, { COLORS } from '../components/colors-dropdown';
import Dropdown from '../components/dropdown/dropdown';
import LoadingSpinner from '../components/loading-spinner';
import Input from '../components/input/index';
import OrientationDropdown, {
	ORIENTATIONS,
} from '../components/orientation-dropdown';

import { useDebounce } from '../hooks';
import useStore, { actionTypes } from '../store';
import { classNames, getFileName, insertImage } from '../utils/helpers';

const FETCH_STATUS = {
	idle: 'idle',
	pending: 'pending',
	success: 'success',
	failure: 'failure',
};
const desiredSizes = [ 'original', 'small', 'large', 'medium' ];
const PER_PAGE = 20,
	SKELETON_COUNT = 20,
	IMAGE_ENGINES = zipwpImages?.image_engines || [ 'pexels', 'pixabay' ];

const getImageSkeleton = ( count = SKELETON_COUNT ) => {
	const aspectRatioClassNames = [
		'aspect-[1/1]',
		'aspect-[1/2]',
		'aspect-[2/1]',
		'aspect-[2/2]',
		'aspect-[3/3]',
		'aspect-[4/3]',
		'aspect-[3/4]',
	];

	let aspectRatioIndex = 0;

	return Array.from( { length: count } ).map( ( _, index ) => {
		aspectRatioIndex =
			aspectRatioIndex === aspectRatioClassNames.length
				? 0
				: aspectRatioIndex;

		return (
			<div
				key={ `skeleton-${ index }` }
				className={ classNames(
					'relative overflow-hidden rounded-lg',
					'bg-slate-300 rounded-lg relative animate-pulse',
					aspectRatioClassNames[ aspectRatioIndex++ ]
				) }
			/>
		);
	} );
};

const SearchResults = () => {
	const { dispatch } = useStore();

	// search and filters states
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ colorValue, setColorValue ] = useState( null );
	const [ orientationValue, setOrientationValue ] = useState( 'all' );

	const [ isAnyImageInserting, setIsAnyImageInserting ] = useState( false );
	const [ images, setImages ] = useState( [] );
	const [ fetchStatus, setFetchStatus ] = useState( FETCH_STATUS.idle );
	const [ currentPage, setCurrentPage ] = useState( 1 );
	const hasLoadMore = useRef( true );
	const lastSearchedKeyword = useRef( '' );
	const blockList = useRef( new Set() );
	const requests = useRef( [] );
	const [ dropdownOpenImageId, setDropdownOpenImageId ] = useState( -1 );
	const [ insertingImages, setInsertingImages ] = useState( {} );
	const imageRef = useRef( null );
	const scrollContainerRef = useRef( null );

	const handleOpenDropdown = ( imageID ) => {
		if ( dropdownOpenImageId === imageID ) {
			setDropdownOpenImageId( -1 );
		} else {
			setDropdownOpenImageId( imageID );
		}
	};

	const handleCloseDropdown = () => {
		setDropdownOpenImageId( -1 );
	};

	const handleSearch = ( value ) => {
		setSearchTerm( value );
		scrollToTop();
		resetBlackList();
		setCurrentPage( 1 );
		setImages( [] );
		hasLoadMore.current = true;
	};

	const fetchImages = async (
		keyword = searchTerm,
		imageOrientation = orientationValue,
		color = colorValue,
		engine = 'pexels',
		page = currentPage
	) => {
		try {
			const trimmedKeyword = keyword.trim(); // Trim the keyword here
			lastSearchedKeyword.current = trimmedKeyword;
			let selectedColor = color;

			// If the color is transparent or grayscale, we should not make a request to Pexels API.
			// Because Pexels API does not support transparent or grayscale colors.
			if (
				engine === 'pexels' &&
				color &&
				( color.name === 'transparent' || color.name === 'grayscale' )
			) {
				return 0;
			}

			// If the color is lilac, we should change it to violet because Pexels API does not support lilac color.
			if ( engine === 'pexels' && color && color.name === 'lilac' ) {
				selectedColor = COLORS.find(
					( colorItem ) => colorItem.name === 'violet'
				);
			}

			// If the color is violet, we should change it to lilac because Pixabay API does not support violet color.
			if ( engine === 'pixabay' && color && color.name === 'violet' ) {
				selectedColor = COLORS.find(
					( colorItem ) => colorItem.name === 'lilac'
				);
			}

			const abortController = new AbortController();
			requests.current.push( abortController );
			const response = await apiFetch( {
				path: `zipwp-images/v1/images`,
				data: {
					keywords: trimmedKeyword,
					orientation: imageOrientation,
					per_page: PER_PAGE.toString(),
					page: page.toString(),
					engine,
					...( !! selectedColor && { color: selectedColor.name } ),
				},
				method: 'POST',
				headers: {
					'X-WP-Nonce': zipwpImages.rest_api_nonce,
				},
				signal: abortController.signal,
			} );

			const newImages =
				response.success && response?.data ? response.data?.data : [];

			setImages( ( prev ) => [ ...prev, ...newImages ] );
			if ( newImages.length < PER_PAGE ) {
				blockList.current.add( engine );
			}
			return newImages?.length;
		} catch ( error ) {
			throw error;
		}
	};

	const cancelPreviousRequests = () => {
		requests.current.forEach( ( controller ) => controller.abort() );
		requests.current = [];
	};

	const resetBlackList = () => {
		blockList.current?.clear();
	};

	const fetchAllImages = async (
		keyword = searchTerm,
		imageOrientation = orientationValue,
		color = colorValue,
		page = currentPage
	) => {
		const responses = [];
		if ( requests.current.length ) {
			cancelPreviousRequests();
		}
		try {
			setFetchStatus( FETCH_STATUS.pending );

			for ( const engine of IMAGE_ENGINES ) {
				if ( blockList.current.has( engine ) ) {
					continue;
				}

				const response = await fetchImages(
					keyword,
					imageOrientation,
					color,
					engine,
					page
				);
				responses.push( response );
			}

			if ( blockList.current.size === IMAGE_ENGINES.length ) {
				hasLoadMore.current = false;
			}

			setFetchStatus( FETCH_STATUS.success );
		} catch ( error ) {
			if ( error.name === 'AbortError' ) {
				return;
			}
			setFetchStatus( FETCH_STATUS.failure );
			console.error( error );
		}
	};

	const debouncedSearchTerm = useDebounce( searchTerm, 400 );

	useEffect( () => {
		scrollToTop();
		resetBlackList();
		setCurrentPage( 1 );
		setImages( [] );
		hasLoadMore.current = true;
		fetchAllImages( debouncedSearchTerm, orientationValue, colorValue, 1 );
	}, [ debouncedSearchTerm ] );
	const scrollToTop = () => {
		if ( scrollContainerRef.current ) {
			scrollContainerRef.current.scrollTop = 0;
		}
	};

	const handleChangeOrientation = ( value ) => {
		resetBlackList();
		setOrientationValue( value );
		setCurrentPage( 1 );
		setImages( [] );
		fetchAllImages( debouncedSearchTerm, value, colorValue, 1 );
		scrollToTop();
	};

	const handleChangeColor = ( value ) => {
		resetBlackList();
		setColorValue( value );
		setCurrentPage( 1 );
		setImages( [] );
		scrollToTop();
		fetchAllImages( debouncedSearchTerm, orientationValue, value, 1 );
	};

	const handleAutoLoad = ( event ) => {
		if ( fetchStatus === FETCH_STATUS.pending ) {
			return;
		}
		const {
			target: { scrollHeight, scrollTop, clientHeight },
		} = event;

		if (
			scrollTop + clientHeight >= scrollHeight - 250 &&
			hasLoadMore.current
		) {
			setCurrentPage( ( prev ) => prev + 1 );

			fetchAllImages(
				debouncedSearchTerm,
				orientationValue,
				colorValue,
				currentPage + 1
			);
		}
	};
	const handleOpenPreview = ( image ) => {
		handleCloseDropdown();
		dispatch( {
			type: actionTypes.SET_PREVIEW_IMAGE,
			payload: image,
		} );
	};
	const getSizeUrl = ( image, size ) => {
		if (
			image.engine === 'pexels' ||
			image.engine === 'pixabay' ||
			image.engine === 'unsplash'
		) {
			// Find the size object that matches the requested size
			const sizeObj = image.sizes.find( ( s ) => s.id === size );

			// If the requested size is found, return its URL
			if ( sizeObj ) {
				return sizeObj.url;
			}

			//CHECK : if this is supposed to be a fallback order! (If the requested size is not found, fall back to a default order)
			const fallbackOrder = [
				'original',
				'large2x',
				'large',
				'medium',
				'small',
			];
			for ( const fallbackSize of fallbackOrder ) {
				const fallbackSizeObj = image.sizes.find(
					( s ) => s.id === fallbackSize
				);
				if ( fallbackSizeObj ) {
					return fallbackSizeObj.url;
				}
			}

			// If no suitable size is found, return the original URL
			return image.url;
		}
	};
	const handleInsertImage = ( image, size ) => async () => {
		if ( insertingImages[ image.id ] || isAnyImageInserting ) {
			return;
		}
		setIsAnyImageInserting( true );
		setInsertingImages( ( prev ) => ( { ...prev, [ image.id ]: true } ) );
		try {
			await insertImage( {
				id: image.id,
				description: image?.description,
				name: getFileName( getSizeUrl( image, size ) ),
				url: getSizeUrl( image, size ),
			} );
		} finally {
			setInsertingImages( ( prev ) => ( {
				...prev,
				[ image.id ]: false,
			} ) );
			setIsAnyImageInserting( false );
		}
	};

	const getSizeDisplay = ( sizeItem ) => {
		if ( sizeItem.width && sizeItem.height ) {
			return `${ sizeItem.width } x ${ sizeItem.height }`;
		}
		if ( sizeItem.width ) {
			return `W: ${ sizeItem.width }`;
		}
		if ( sizeItem.height ) {
			return `H: ${ sizeItem.height }`;
		}
		return '';
	};
	const handleClearFilters = () => {
		setColorValue( null );
		setOrientationValue( ORIENTATIONS.all?.value );
		setImages( [] );
		setCurrentPage( 1 );
		fetchAllImages(
			debouncedSearchTerm,
			ORIENTATIONS?.all?.value,
			null,
			1
		);
		scrollToTop();
	};

	const renderItems =
		fetchStatus === FETCH_STATUS.pending
			? [ ...images, ...getImageSkeleton() ]
			: images;

	const isShowClearFilter = null !== colorValue || 'all' !== orientationValue,
		savedImages = zipwpImages?.saved_images ?? [];

	return (
		<div className="flex flex-col justify-start items-center gap-5 h-full">
			<div className="w-full h-fit md:flex-row flex-col flex justify-between gap-3">
				<div className="w-full md:max-w-[420px]">
					<Input
						className="w-full"
						name="keyword"
						placeholder="Search images"
						suffixIcon={
							! searchTerm ? (
								<div className="inline-flex items-start justify-center pr-3 bg-transparent p-0 m-0 border-0">
									<MagnifyingGlassIcon className="w-4 h-4 text-zip-app-inactive-icon transition-all" />
								</div>
							) : (
								<button
									type="button"
									className="inline-flex items-start justify-center pr-3 bg-transparent p-0 m-0 border-0 outline-none focus:outline-none cursor-pointer"
									onClick={ () => setSearchTerm( '' ) }
								>
									<XMarkIcon className="w-4 h-4 text-zip-app-inactive-icon transition-all" />
								</button>
							)
						}
						autoComplete="off"
						onChange={ handleSearch }
						value={ searchTerm }
						focusOnLoad
					/>
				</div>
				{ /* Filters */ }
				<div className="flex items-center justify-end gap-3">
					{ isShowClearFilter && (
						<span
							className="text-sm font-normal text-body-text leading-[150%] cursor-pointer text-nowrap"
							onClick={ handleClearFilters }
							aria-hidden="true"
						>
							{ __( 'Clear filter', 'zipwp-images' ) }
						</span>
					) }
					<ColorsDropdown
						value={ colorValue }
						onChange={ handleChangeColor }
					/>
					<OrientationDropdown
						value={ orientationValue }
						onChange={ handleChangeOrientation }
					/>
				</div>
			</div>
			<div
				ref={ scrollContainerRef }
				className="w-full max-h-full overflow-y-auto"
				onScroll={ handleAutoLoad }
			>
				{ !! renderItems.length && (
					<Masonry
						className="gap-6 [&>div]:gap-6 pb-5"
						columns={ {
							default: 1,
							220: 1,
							767: 3,
							1024: 3,
							1280: 5,
							1920: 5,
						} }
					>
						{ renderItems.map( ( renderItem ) =>
							renderItem?.optimized_url ? (
								<div
									ref={ imageRef }
									key={ renderItem.id }
									className={ classNames(
										'flex relative bg-white rounded-lg shadow-none group/overlay',
										savedImages.includes( renderItem.id ) &&
											"before:absolute before:top-2 before:left-2 before:content-['Imported'] before:bg-black/70 before:px-2 before:py-1 before:rounded before:text-white before:text-xs before:font-semibold"
									) }
								>
									<img
										src={ renderItem.optimized_url }
										alt={ renderItem.alt }
										className="w-full h-fit min-h-[200px] object-cover"
									/>
									<div
										className={ classNames(
											'absolute inset-0 opacity-0 group-hover/overlay:opacity-100  transition-all duration-300 ease-in-out flex items-center justify-center gap-4 cursor-pointer',
											renderItem.id ===
												dropdownOpenImageId &&
												'!opacity-100'
										) }
										role="button"
										tabIndex={ 0 }
										onClick={ ( e ) => {
											e.stopPropagation(); // Prevent click from bubbling up to the overlay
											handleOpenPreview( renderItem );
										} }
										onKeyDown={ ( e ) => {
											if (
												e.key === 'Enter' ||
												e.key === ' '
											) {
												e.preventDefault();
												e.stopPropagation();
												handleOpenPreview( renderItem );
											}
										} }
									>
										<div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/10 to-transparent opacity-0 group-hover/overlay:opacity-100 transition-opacity duration-300"></div>
										<div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover/overlay:opacity-100 transition-opacity duration-300"></div>
										{ /* Bottom bar */ }
										<div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-4 z-5">
											{ /* Image details */ }
											<div className="w-1/2">
												<div className="flex flex-col !text-white/90 text-xs">
													<a
														className="!text-white/90 text-xs !no-underline"
														href={
															renderItem.author_url
														}
														target="_blank"
														onClick={ ( e ) =>
															e.stopPropagation()
														}
														rel="noreferrer"
													>
														by{ ' ' }
														{
															renderItem.author_name
														}
													</a>
													<span className="opacity-70 truncate">
														<span>via </span>
														<span className="capitalize">
															{
																renderItem.engine
															}
														</span>
													</span>
												</div>
											</div>

											{ /* Button */ }
											<div className="flex-shrink-0 ml-2">
												<div className="flex items-center overflow-hidden rounded">
													<button
														className={ classNames(
															'border-none flex cursor-pointer items-center justify-center text-zip-body-text bg-white hover:bg-white/80 transition-colors duration-200 h-[34px] px-2 rounded-l',
															isAnyImageInserting &&
																'opacity-50 cursor-not-allowed hover:bg-white'
														) }
														onClick={ ( e ) => {
															e.stopPropagation();
															if (
																! isAnyImageInserting
															) {
																handleInsertImage(
																	renderItem
																)();
															}
														} }
														disabled={
															isAnyImageInserting ||
															insertingImages[
																renderItem.id
															]
														}
													>
														<div className="flex items-center justify-center w-[70px]">
															{ ' ' }
															{ /* Fixed-width container */ }
															{ insertingImages[
																renderItem.id
															] ? (
																<LoadingSpinner className="w-4 h-4 mr-2" />
															) : (
																<ArrowDownTrayIcon className="w-4 h-4 mr-2" />
															) }
															<span
																className={ classNames(
																	insertingImages[
																		renderItem
																			.id
																	] &&
																		'sr-only',
																	'text-sm'
																) }
															>
																Insert
															</span>
														</div>
													</button>

													<div className="w-px h-[34px] bg-border-tertiary"></div>

													<button
														className={ classNames(
															'border-none flex items-center justify-center cursor-pointer h-[34px] bg-white hover:bg-white/80 transition-colors duration-200 px-2 rounded-r',
															isAnyImageInserting &&
																'opacity-50 cursor-not-allowed hover:bg-white'
														) }
														onClick={ ( e ) => {
															e.stopPropagation();
															if (
																! isAnyImageInserting
															) {
																handleOpenDropdown(
																	renderItem.id
																);
															}
														} }
														disabled={
															isAnyImageInserting
														}
													>
														<ChevronDownIcon
															className={ classNames(
																'w-3 h-3 transition-transform duration-300',
																dropdownOpenImageId ===
																	renderItem.id &&
																	'rotate-180'
															) }
														/>
													</button>
												</div>

												<Dropdown
													placement="top-end"
													isOpen={
														dropdownOpenImageId ===
														renderItem.id
													}
													onClose={
														handleCloseDropdown
													}
													offset={ [ 2, 30 ] }
													contentClassName="p-1 bg-white"
													trigger={ <div></div> }
												>
													{ renderItem.sizes
														.filter( ( sizeItem ) =>
															desiredSizes.includes(
																sizeItem.id
															)
														)
														.map(
															(
																sizeItem,
																index
															) => (
																<Dropdown.Item
																	as="div"
																	key={
																		index
																	}
																>
																	<div
																		aria-hidden="true"
																		className={ classNames(
																			'mr-2 flex items-center justify-start gap-2 px-2 py-1.5 text-sm font-normal leading-5 text-zip-body-text hover:bg-background-secondary transition duration-150 ease-in-out rounded bg-white border-none cursor-pointer w-full',
																			isAnyImageInserting &&
																				'opacity-50 cursor-not-allowed hover:bg-white'
																		) }
																		onClick={ (
																			e
																		) => {
																			e.stopPropagation();
																			if (
																				! isAnyImageInserting
																			) {
																				handleInsertImage(
																					renderItem,
																					sizeItem.id
																				)();
																			}
																		} }
																	>
																		<span className="text-sm font-medium capitalize">
																			{
																				sizeItem.id
																			}
																		</span>
																		<span className="text-xs leading-5 text-zip-app-inactive-icon !ml-0">
																			{ getSizeDisplay(
																				sizeItem
																			) }
																		</span>
																	</div>
																</Dropdown.Item>
															)
														) }
												</Dropdown>
											</div>
										</div>
									</div>
								</div>
							) : (
								renderItem
							)
						) }
					</Masonry>
				) }

				{ fetchStatus !== FETCH_STATUS.idle &&
					fetchStatus !== FETCH_STATUS.pending &&
					! images.length && (
						<div className="grid grid-cols-1 gap-2 mt-12 h-auto text-center">
							<h4 className="text-xl text-heading-text !mb-0">
								{ sprintf(
									// translators: %s: search keyword
									__(
										"Sorry, we couldn't find anything for “%s”.",
										'zipwp-images'
									),
									lastSearchedKeyword.current
								) }
							</h4>
							<p className="text-body-text text-sm !mt-2">
								{ __(
									'Try to refine your search.',
									'zipwp-images'
								) }
							</p>
						</div>
					) }

				{ fetchStatus !== FETCH_STATUS.pending &&
					! hasLoadMore.current &&
					!! images.length && (
						<div className="text-center text-sm text-border-primary mt-5 pb-5">
							{ __(
								'End of the search results.',
								'zipwp-images'
							) }
						</div>
					) }
			</div>
		</div>
	);
};

export default SearchResults;
