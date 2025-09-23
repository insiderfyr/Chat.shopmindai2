import type { DropdownValueSetter } from '~/common';

/**
 * Creates a Dropdown value setter that always passes a string value. This is
 * useful whenever options are provided as objects but downstream consumers expect
 * a plain string.
 */
export const createDropdownSetter = (setValue: (value: string) => void): DropdownValueSetter => {
  return (value) => {
    if (!value) {
      setValue('');
      return;
    }

    if (typeof value === 'string') {
      setValue(value);
      return;
    }

    if ('value' in value && value.value != null) {
      setValue(String(value.value));
      return;
    }

    setValue('');
  };
};
