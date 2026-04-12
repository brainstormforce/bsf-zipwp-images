import { createRoot } from '@wordpress/element';
import MainContainer from './components/main-container';
import './style.scss';

const initApp = ( rootDom ) => {
	if ( ! rootDom ) {
		return;
	}

	const root = createRoot( rootDom );
	root.render( <MainContainer /> );
};
export default initApp;
