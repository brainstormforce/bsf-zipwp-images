import { PreviewImage, SearchResults } from '../../screens';

const MainContainer = () => {
	return (
		<div className="px-5 pt-5 h-[calc(100%_-_1.25rem)]">
			<SearchResults />
			<PreviewImage />
		</div>
	);
};

export default MainContainer;
