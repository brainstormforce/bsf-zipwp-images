import {
	Field,
	Label,
	Radio,
	RadioGroup as HLRadioGroup,
} from '@headlessui/react';
import { Fragment } from '@wordpress/element';
import { classNames } from '../../utils/helpers';

function RadioGroup( { value, onChange, by, children } ) {
	return (
		<HLRadioGroup
			value={ value }
			onChange={ onChange }
			{ ...( !! by && { by } ) }
		>
			{ children }
		</HLRadioGroup>
	);
}

RadioGroup.Button = ( { value, children, disabled = false } ) => {
	return (
		<Field className="flex items-center gap-2" disabled={ disabled }>
			<Radio as={ Fragment } value={ value }>
				{ ( { checked, disabled: disableFlag } ) => (
					<span
						className={ classNames(
							'group flex size-[14px] items-center justify-center rounded-full border border-solid border-zip-body-text bg-white',
							disableFlag && 'opacity-70 cursor-not-allowed'
						) }
					>
						{ checked && (
							<span className="size-2 rounded-full bg-zip-body-text" />
						) }
					</span>
				) }
			</Radio>
			<Label as={ Fragment }>
				{ ( { disabled: disableFlag } ) => (
					// eslint-disable-next-line jsx-a11y/label-has-associated-control
					<label
						className={ classNames(
							!! disableFlag && 'opacity-70'
						) }
					>
						{ children }
					</label>
				) }
			</Label>
		</Field>
	);
};

export default RadioGroup;
