import Tippy from '@tippyjs/react';

const Tooltip = ( {
	children,
	content,
	interactive = false,
	arrow = false,
	...props
} ) => {
	return !! content ? (
		<Tippy
			className="zipwp-images-tooltip"
			content={ content }
			interactive={ interactive }
			arrow={ arrow }
			{ ...props }
		>
			{ children }
		</Tippy>
	) : (
		children
	);
};

export default Tooltip;
