import {useFormContext, Controller} from 'react-hook-form';
// @mui
import Switch from '@mui/material/Switch';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel, {FormControlLabelProps} from '@mui/material/FormControlLabel';
import {SyntheticEvent} from "react";

// ----------------------------------------------------------------------

interface Props extends Omit<FormControlLabelProps, 'control'> {
    name: string;
    helperText?: React.ReactNode;
    onChange?: (event: SyntheticEvent<Element, Event>, checked: boolean) => void;
}

export default function RHFSwitch({name, helperText, onChange, ...other}: Props) {
    const {control} = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({field, fieldState: {error}}) => (
                <div>
                    <FormControlLabel control={
                        <Switch
                            {...field}
                            checked={field.value}
                            onChange={(event) => {
                                field.onChange(event.target.checked);
                                onChange?.(event, event.target.checked); // Call the onChange prop with the correct event type
                            }}
                        />} {...other} />

                    {(!!error || helperText) && (
                        <FormHelperText error={!!error}>{error ? error?.message : helperText}</FormHelperText>
                    )}
                </div>
            )}
        />
    );
}
